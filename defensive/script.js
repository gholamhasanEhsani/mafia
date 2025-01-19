const getCookie = (name) => {
    name = encodeURIComponent(name);
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
};
const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

function showDisciplinaryPopup() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('disciplinary-popup').style.display = 'block';
    document.getElementById('overlay').addEventListener('click', closePopup);
}

let colors = ["red", "blue"];
const lotteryBox = document.querySelectorAll('.lottery-box');

function showDeathLotteryPopup() {
    document.querySelectorAll('.card .name').forEach((name, i) => document.getElementById('lottery-player-' + (i + 1)).textContent = name.textContent.trim());
    lotteryBox[0].classList.add("active");
    lotteryBox[1].classList.remove("active");
    lotteryBox[1].querySelectorAll('button').forEach(button => button.onclick = null);
    lotteryBox[0].querySelectorAll('button').forEach(button => button.onclick = () => selectLotteryPlayer(button.id));

    document.getElementById('overlay').style.display = 'block';
    document.getElementById('death-lottery-popup').style.display = 'block';
}

function selectLotteryPlayer(playerId){
    document.getElementById(playerId).classList.add("transformed");
    lotteryBox[0].querySelectorAll('button').forEach(button => button.onclick = null);
    lotteryBox[0].classList.remove("active");
    lotteryBox[1].classList.add("active");
    lotteryBox[1].querySelectorAll('button').forEach(button => button.onclick = () => selectLotteryCard(button.id));
}

function selectLotteryCard(cardId) {
    colors = colors.sort(() => Math.random() - 0.5);
    document.querySelectorAll('.lottery-card').forEach(card => card.onclick = null);
    setTimeout(() => {
        const cardElement = document.getElementById(cardId);
        cardElement.classList.add(colors.shift(), "transformed");
        document.querySelector('.lottery-card:not(#' + cardId + ')').classList.add(colors[0]);
        lotteryBox[1].classList.remove("active");
        showLotteryResult();
    }, 1000);
}

function showLotteryResult() {
    let resultBox = document.createElement('div');
    resultBox.classList.add('result-box');
    const selectedPlayer = document.querySelector(".lottery-player.transformed").textContent.trim();
    const notSelectedPlayer = document.querySelector(".lottery-player:not(.transformed)").textContent.trim();
    if (document.querySelector('.lottery-card.transformed').classList.contains('red')) {
        resultBox.textContent = `${notSelectedPlayer} زنده می‌ماند و ${selectedPlayer} می‌میرد.`;
    } else {
        resultBox.textContent = `${selectedPlayer} زنده می‌ماند و ${notSelectedPlayer} می‌میرد.`;
    }
    document.querySelector('#lottery-result').innerHTML = "";
    document.querySelector('#lottery-result').appendChild(resultBox);
    document.querySelector(".lottery-btn").disabled = false;
}

function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('disciplinary-popup').style.display = 'none';
    document.getElementById('voting-rights-popup').style.display = 'none';
    document.getElementById('kick-popup').style.display = 'none';
    document.getElementById('overlay').removeEventListener('click', closePopup);
}

document.addEventListener("DOMContentLoaded", () => {
    const accordions = document.querySelectorAll(".accordion-button");
    accordions.forEach((button, i) => {
        const content = button.nextElementSibling;
        const icon = button.querySelector(".accordion-icon");
        content.style.maxHeight = 0;
        icon.textContent = "+";
        button.addEventListener("click", () => {
            content.classList.toggle("show");
            if (content.classList.contains("show")) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.textContent = "-";
            } else {
                content.style.maxHeight = 0;
                icon.textContent = "+";
            }
        });
    });

    // Timer functionality
    const timers = {};
    const bellAudio = new Audio('../audio/bell-98033.mp3');

    const resetTimers = () => {
        for (const id in timers) {
            clearInterval(timers[id]);
            const initialTime = document.getElementById(`${id}-input`).value;
            const display = document.getElementById(`${id}-display`);
            display.textContent = initialTime;
            display.classList.remove('running', 'almost-done');
            const button = document.querySelector(`#${id} .timer-button`);
            const initialText = button.dataset.initialText;
            button.textContent = initialText;
        }
    };

    const toggleTimer = (id, fixedTime = null) => {
        const button = document.querySelector(`#${id} .timer-button`);
        const initialText = button.dataset.initialText;
        const input = fixedTime == null ? document.getElementById(`${id}-input`).value : fixedTime;
        const display = document.getElementById(`${id}-display`);

        if (timers[id]) {
            clearInterval(timers[id]);
            delete timers[id];
            button.textContent = initialText;
            display.textContent = input;
            display.classList.remove('running', 'almost-done');
        } else {
            resetTimers();
            let timeLeft = input;
            display.textContent = timeLeft;
            timers[id] = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    display.textContent = timeLeft;
                    if (timeLeft <= 10) {
                        display.classList.add('almost-done');
                        display.classList.remove('running');
                    } else {
                        display.classList.add('running');
                        display.classList.remove('almost-done');
                    }
                } else {
                    clearInterval(timers[id]);
                    display.classList.remove('almost-done', 'running');
                    bellAudio.play().catch(error => console.error('Audio playback failed:', error));
                    resetTimers();
                }
            }, 1000);
            button.textContent = 'توقف';
        }
    };

    window.toggleTimer = toggleTimer;

    document.querySelectorAll('.timer-button').forEach(button => {
        button.dataset.initialText = button.textContent;
        button.addEventListener('click', () => {
            if (!bellAudio.paused) {
                bellAudio.pause();
                bellAudio.currentTime = 0;
            }
        });
    });

    // Voting functionality
    let defensivePlayers = JSON.parse(getCookie("defensivePlayers") || "[]");
    const playersState = JSON.parse(getCookie("playersState") || "{}");
    let alivePlayersCount = 0;
    let votingRightsRemoved = [];
    let kickedPlayers = [];

    for (player in playersState) {
        if (playersState[player] == 'alive') {
            alivePlayersCount++;
        }
    }

    const max = alivePlayersCount - 1;
    const cardContainer = document.querySelector("#cards");

    // اقدامات انظباطی فراموش نشه
    const checkVotingStatus = () => {
        const counts = cardContainer.querySelectorAll('.count');

        const minVotesToLeave = Math.floor((alivePlayersCount - 1) / 2);

        if (defensivePlayers.length == 1) {
            const suspiciousPlayerVotes = counts[0].textContent;
            if (suspiciousPlayerVotes >= minVotesToLeave) {
                document.getElementById('night-phase').style.display = 'none';
                document.getElementById('final-move').style.display = 'block';
                counts[0].classList.add("danger");
            } else {
                document.getElementById('night-phase').style.display = 'block';
                document.getElementById('final-move').style.display = 'none';
                counts[0].classList.remove("danger");
            }
        } else if (defensivePlayers.length == 2) {
            let votes1 = parseInt(counts[0].textContent);
            let votes2 = parseInt(counts[1].textContent);
            document.getElementById('night-phase').style.display = 'none';

            counts[0].classList.remove("danger");
            counts[1].classList.remove("danger");
            counts[0].classList.remove("warning");
            counts[1].classList.remove("warning");
            if (votes1 == votes2) {
                document.getElementById('death-lottery').style.display = 'block';
                document.getElementById('final-move').style.display = 'none';
                counts[0].classList.add("warning");
                counts[1].classList.add("warning");
            } else {
                document.getElementById('death-lottery').style.display = 'none';
                document.getElementById('final-move').style.display = 'block';
                if (votes1 > votes2) {
                    counts[0].classList.add("danger");
                    counts[1].classList.remove("danger");
                } else {
                    counts[1].classList.add("danger");
                    counts[0].classList.remove("danger");
                }
            }
        } else {
            let voteCounts = Array.from(counts).map(countEl => parseInt(countEl.textContent));
            let maxVote = Math.max(...voteCounts);
            let maxVotesCount = voteCounts.filter(vote => vote == maxVote).length;
            counts.forEach(countEl => countEl.classList.remove("danger", "warning"));
            if (maxVotesCount > 1) {
                document.getElementById('night-phase').style.display = 'block';
                document.getElementById('final-move').style.display = 'none';
            } else {
                document.getElementById('night-phase').style.display = 'none';
                document.getElementById('final-move').style.display = 'block';
                counts.forEach(countEl => {
                    if (parseInt(countEl.textContent) == maxVote) {
                        countEl.classList.add("danger");
                    }
                });
            }
        }
        document.getElementById('disciplinary-actions').style.display = 'block';
    };

    const updateEventListeners = () => {
        const plusButtons = document.querySelectorAll(".plus");
        const minusButtons = document.querySelectorAll(".minus");

        plusButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const countEl = btn.parentNode.parentElement.querySelector(".count");
                const count = parseInt(countEl.textContent);
                if (count < max) {
                    countEl.textContent = count + 1;
                } else {
                    countEl.textContent = max;
                }
                checkVotingStatus();
            });
        });

        minusButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const countEl = btn.parentNode.parentElement.querySelector(".count");
                const count = parseInt(countEl.textContent);
                if (count > 0) {
                    countEl.textContent = count - 1;
                } else {
                    countEl.textContent = 0;
                }
                checkVotingStatus();
            });
        });
    };

    cardContainer.innerHTML = "";
    defensivePlayers.forEach(player => {
        cardContainer.innerHTML += `<div class="card"><div class="count">0</div><div class="name">${player}</div><div class="vote"><button class="plus">+</button><button class="minus">-</button></div></div>`;
    });
    updateEventListeners();
    checkVotingStatus();
    document.getElementById("button-vote").click();

    function showVotingRightsPopup() {
        document.getElementById('disciplinary-popup').style.display = 'none';
        const playersButtonsContainer = document.getElementById('players-buttons');
        playersButtonsContainer.innerHTML = '';

        for (const player in playersState) {
            if (playersState[player] == 'alive' && !votingRightsRemoved.includes(player)) {
                const button = document.createElement('button');
                button.classList.add('disciplinary-btn');
                button.textContent = player;
                button.onclick = () => {
                    votingRightsRemoved.push(player);
                    const warningBox = document.createElement('div');
                    warningBox.classList.add('warning-box');
                    warningBox.textContent = `${player} حق رای دادن ندارد!`;
                    const voteContent = document.getElementById('content-vote');
                    voteContent.insertBefore(warningBox, document.getElementById('content-vote').firstChild);
                    if (voteContent.classList.contains("show")) {
                        voteContent.style.maxHeight = voteContent.scrollHeight + "px";
                    }
                    closePopup();
                };
                playersButtonsContainer.appendChild(button);
            }
        }
        document.getElementById('voting-rights-popup').style.display = 'block';
    }
    window.showVotingRightsPopup = showVotingRightsPopup;

    function closeVotingRightsPopup() {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('voting-rights-popup').style.display = 'none';
    }
    window.closeVotingRightsPopup = closeVotingRightsPopup;

    function showKickPopup() {
        document.getElementById('disciplinary-popup').style.display = 'none';
        const kickPlayersButtonsContainer = document.getElementById('kick-players-buttons');
        kickPlayersButtonsContainer.innerHTML = '';

        for (const player in playersState) {
            if (playersState[player] == 'alive') {
                const button = document.createElement('button');
                button.classList.add('disciplinary-btn');
                button.textContent = player;
                button.onclick = () => {
                    kickPlayersButtonsContainer.querySelectorAll('button').forEach(btn => {
                        btn.disabled = true;
                        btn.classList.remove('selected');
                    });
                    button.disabled = false;
                    button.classList.add('selected');
                    const confirmKickBtn = document.getElementById('confirm-kick-btn');
                    confirmKickBtn.disabled = false;
                    document.querySelector("#kick-popup .close-btn").textContent = "انصراف";
                    confirmKickBtn.onclick = () => {
                        kickedPlayers.push(player);
                        setCookie("kickedPlayers", JSON.stringify(kickedPlayers), 7);
                        confirmKickBtn.disabled = true;
                        closePopup();
                    };
                };
                kickPlayersButtonsContainer.appendChild(button);
            }
        }

        document.getElementById('kick-popup').style.display = 'block';
    }
    window.showKickPopup = showKickPopup;

    function closeKickPopup() {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('kick-popup').style.display = 'none';
    }
    window.closeKickPopup = closeKickPopup;
})