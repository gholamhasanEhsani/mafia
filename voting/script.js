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

let playersState = JSON.parse(getCookie("playersState")) || {};
let alivePlayers = [];
for (let player in playersState) {
    if (playersState[player] == "alive") {
        alivePlayers.push(player);
    }
}
let max = alivePlayers.length - 1;
let min = Math.floor(alivePlayers.length / 2);

const minEl = document.getElementById("minimum");
const cardContainer = document.querySelector("#cards");
const defensiveButton = document.querySelector('.operation-btn.defensive-phase');
const nightButton = document.querySelector('.operation-btn.night-phase');

minEl.textContent = "حداقل تعداد رای مورد نیاز برای شرکت در دفاعیه: " + min;

const checkVotingStatus = () => {
    const counts = document.querySelectorAll('.count');
    let defensivePhaseActive = false;

    counts.forEach(countEl => {
        if (countEl.classList.contains('danger')) {
            defensivePhaseActive = true;
        }
    });

    if (defensivePhaseActive) {
        defensiveButton.style.display = 'block';
        nightButton.style.display = 'none';
    } else {
        defensiveButton.style.display = 'none';
        nightButton.style.display = 'block';
    }
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
            if (parseInt(countEl.textContent) >= min) {
                countEl.classList.add("danger");
            } else {
                countEl.classList.remove("danger");
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
            if (parseInt(countEl.textContent) >= min) {
                countEl.classList.add("danger");
            } else {
                countEl.classList.remove("danger");
            }
            checkVotingStatus();
        });
    });
};

cardContainer.innerHTML = "";
alivePlayers.forEach(player => {
    cardContainer.innerHTML += `<div class="card"><div class="count">0</div><div class="name">${player}</div><div class="vote"><button class="plus">+</button><button class="minus">-</button></div></div>`;
    updateEventListeners();
});

defensiveButton.addEventListener("click", () => {
    const counts = document.querySelectorAll(".count");
    let defensivePlayers = [];
    counts.forEach(count => {
        if (parseInt(count.textContent) >= min) {
            defensivePlayers.push(count.nextElementSibling.textContent);
        }
    });
    setCookie("defensivePlayers", JSON.stringify(defensivePlayers), 7);
    location.href = "../defensive/";
})

// night phase مشکل داره ها