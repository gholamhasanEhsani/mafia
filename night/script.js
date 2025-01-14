const neutralRoles = ["نوستراداموس", "جک اسپارو", "شرلوک هولمز"];
const mafiaRoles = ["مافیای ساده", "ماتادور", "ساول گودمن", "پدرخوانده"];

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

const assignedRoles = JSON.parse(getCookie("assigned") || "{}");
const players = Object.keys(assignedRoles);
const roles = Object.values(assignedRoles);

document.addEventListener("DOMContentLoaded", () => {
    const accordions = document.querySelectorAll(".accordion-button");
    accordions.forEach(button => {
        const content = button.nextElementSibling;
        content.style.maxHeight = 0;
        button.querySelector(".accordion-icon").textContent = "+";
        button.addEventListener("click", () => {
            const icon = button.querySelector(".accordion-icon");
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

    let isIntroduction = getCookie("isIntroduction");
    if (isIntroduction == null || isIntroduction != "false") {
        setCookie("isIntroduction", "true", 7);
        isIntroduction = true;
    } else {
        isIntroduction = false;
    }

    let playersState = JSON.parse(getCookie("playersState") || "{}");
    players.forEach(player => {
        if (!playersState[player]) {
            playersState[player] = "alive";
        }
    });

    setCookie("playersState", JSON.stringify(playersState), 7);

    const preloadSounds = (sounds) => {
        sounds.forEach(sound => {
            const audio = new Audio(`../audio/${sound}`);
            audio.preload = 'auto';
        });
    };

    const sounds = ['bell-98033.mp3', 'shot-10069.mp3', 'shot-13207.mp3', 'shot-14566.mp3', 'shot-14649.mp3', 'shot-23053.mp3', 'shot-39722.mp3', 'shot-39789.mp3', 'shot-39791.mp3', 'shot-43852.mp3', 'shot-90286.mp3', 'shot-94951.mp3', 'shot-98831.mp3', 'time-10840.mp3'];

    preloadSounds(sounds);

    const neutralRoleButton = document.querySelector('#button-neutral-role');
    const accordionNeutralRole = document.getElementById('accordion-neutral-role');
    const accordionIcon = neutralRoleButton.querySelector('.accordion-icon');

    let neutralRoleFound = false;

    neutralRoles.forEach(role => {
        if (roles.includes(role)) {
            neutralRoleButton.innerHTML = role + accordionIcon.outerHTML;
            neutralRoleFound = true;
            if (role == "نوستراداموس") {
                neutralRoleButton.disabled = !isIntroduction;
                if (!isIntroduction) {
                    neutralRoleButton.innerHTML = role + " - فقط شب معارفه" + accordionIcon.outerHTML;
                }
                const otherPlayers = players.filter(player => assignedRoles[player] != role);
                const buttonsHTML = otherPlayers.map(player => `<button class="neutral-selector-button">${player}</button>`).join('');
                const neutralRoleContent = document.querySelector('#content-neutral-role');
                neutralRoleContent.innerHTML = buttonsHTML;
                const showMafiaCountButton = document.createElement('button');
                showMafiaCountButton.textContent = 'نمایش تعداد مافیاها';
                showMafiaCountButton.classList.add('show-mafia-count-button');
                showMafiaCountButton.setAttribute("disabled", "disabled");
                neutralRoleContent.appendChild(showMafiaCountButton);

                const selectedButtons = new Set();

                neutralRoleContent.addEventListener('click', (event) => {
                    if (event.target.classList.contains('neutral-selector-button')) {
                        const button = event.target;
                        if (selectedButtons.has(button)) {
                            selectedButtons.delete(button);
                            button.classList.remove('selected');
                        } else if (selectedButtons.size < 3) {
                            selectedButtons.add(button);
                            button.classList.add('selected');
                        }

                        const buttons = neutralRoleContent.querySelectorAll('.neutral-selector-button');
                        buttons.forEach(btn => {
                            (!selectedButtons.has(btn) && selectedButtons.size >= 3) ? btn.disabled = true: btn.disabled = false;

                            (selectedButtons.size >= 3) ? showMafiaCountButton.disabled = false: showMafiaCountButton.disabled = true;
                        });
                    }
                });

                const mafiaCountDiv = document.createElement('div');
                mafiaCountDiv.id = 'mafia-count';
                mafiaCountDiv.classList.add('mafia-count');
                neutralRoleContent.appendChild(mafiaCountDiv);

                showMafiaCountButton.addEventListener('click', () => {
                    const buttons = neutralRoleContent.querySelectorAll('.neutral-selector-button');
                    const selectedButtons = Array.from(buttons).filter(button => button.classList.contains('selected'));
                    if (selectedButtons.length == 3) {
                        buttons.forEach(button => {
                            button.disabled = true;
                        });
                        let mafiaCount = 0;
                        selectedButtons.forEach(selectedButton => {
                            const role = assignedRoles[selectedButton.textContent];
                            if (role == "مافیای ساده" || role == "ماتادور" || role == "ساول گودمن") {
                                mafiaCount++;
                            }
                        });
                        showMafiaCountButton.remove();
                        mafiaCountDiv.textContent = `تعداد مافیاها به جز پدرخوانده: ${mafiaCount}`;

                        const neutralResault = document.createElement('div');
                        neutralResault.id = 'neutral-resault';
                        const neutralResaultText = document.createElement('div');
                        neutralResaultText.classList.add('neutral-resault-text');
                        neutralResault.appendChild(neutralResaultText);
                        if (mafiaCount >= 2) {
                            neutralResaultText.textContent = "نوستراداموس باید با ساید مافیا بازی کند!";
                            const neutralResaultBtn1 = document.createElement('button');
                            neutralResaultBtn1.classList.add('neutral-resault-btn', "btn-1");
                            neutralResaultBtn1.textContent = "تایید";
                            neutralResault.appendChild(neutralResaultBtn1);
                            neutralResaultBtn1.addEventListener('click', () => {
                                setCookie("nostradamusSide", "mafia", 7);
                                neutralRoleButton.click();
                            });
                        } else {
                            neutralResaultText.textContent = "نوستراداموس باید انتخاب کند که با کدام ساید بازی می‌کند؟";
                            const neutralResaultBtn2 = document.createElement('button');
                            neutralResaultBtn2.classList.add('neutral-resault-btn', "btn-2");
                            neutralResaultBtn2.textContent = "شهروندان";
                            neutralResault.appendChild(neutralResaultBtn2);
                            const neutralResaultBtn3 = document.createElement('button');
                            neutralResaultBtn3.classList.add('neutral-resault-btn', "btn-3");
                            neutralResaultBtn3.textContent = "مافیاها";
                            neutralResault.appendChild(neutralResaultBtn3);
                            neutralResaultBtn2.addEventListener('click', () => {
                                setCookie("nostradamusSide", "citizen", 7);
                                neutralRoleButton.click();
                                neutralResaultBtn2.disabled = true;
                                neutralResaultBtn3.disabled = true;
                            });
                            neutralResaultBtn3.addEventListener('click', () => {
                                setCookie("nostradamusSide", "mafia", 7);
                                neutralRoleButton.click();
                                neutralResaultBtn2.disabled = true;
                                neutralResaultBtn3.disabled = true;
                            });
                        }
                        neutralRoleContent.appendChild(neutralResault);
                        neutralRoleContent.style.maxHeight = neutralRoleContent.scrollHeight + "px";
                    }
                });

                neutralRoleButton.addEventListener('click', () => {
                    if (neutralRoleContent.classList.contains("show")) {
                        neutralRoleContent.style.maxHeight = neutralRoleContent.scrollHeight + "px";
                    } else {
                        neutralRoleContent.style.maxHeight = 0;
                    }
                });
            }
        }
    });

    if (!neutralRoleFound) {
        accordionNeutralRole.remove();
    }

    // mafia
    const mafiaButton = document.querySelector('#button-mafia');
    const mafiaContent = document.querySelector('#content-mafia');
    mafiaButton.addEventListener('click', () => {
        const idDiv = mafiaContent.querySelector('.identification');
        const actionsDiv = mafiaContent.querySelector('.actions');
        if (isIntroduction) {
            const availableRoles = roles.filter(role => mafiaRoles.includes(role));
            idDiv.innerHTML = '';
            players.forEach(player => {
                if (mafiaRoles.includes(assignedRoles[player])) {
                    idDiv.innerHTML += `${player}: ${assignedRoles[player]}<br>`;
                    idDiv.style.display = 'block';
                }
            });
            if (mafiaContent.classList.contains("show")) {
                mafiaContent.style.maxHeight = mafiaContent.scrollHeight + "px";
            } else {
                mafiaContent.style.maxHeight = 0;
            }
        } else {

        }
    });

    // matador
    if (roles.includes("ماتادور")) {
        const matadorButton = document.querySelector('#button-matador');
        const matadorContent = document.querySelector('#content-matador');
        matadorButton.addEventListener('click', () => {
            const idDiv = matadorContent.querySelector('.identification');
            const actionsDiv = matadorContent.querySelector('.actions');
            if (isIntroduction) {
                players.forEach(player => {
                    if (assignedRoles[player] == "ماتادور") {
                        idDiv.innerHTML = player;
                    }
                });
                idDiv.style.display = 'block';
                if (matadorContent.classList.contains("show")) {
                    matadorContent.style.maxHeight = matadorContent.scrollHeight + "px";
                } else {
                    matadorContent.style.maxHeight = 0;
                }
            } else {

            }
        });
    } else {
        document.querySelector("#accordion-matador").remove();
    }

    // doctor watson
    const watsonButton = document.querySelector('#button-watson');
    const watsonContent = document.querySelector('#content-watson');
    watsonButton.addEventListener('click', () => {
        const idDiv = watsonContent.querySelector('.identification');
        const actionsDiv = watsonContent.querySelector('.actions');
        if (isIntroduction) {
            players.forEach(player => {
                if (assignedRoles[player] == "دکتر واتسون") {
                    idDiv.innerHTML = player;
                }
            });
            idDiv.style.display = 'block';
            if (watsonContent.classList.contains("show")) {
                watsonContent.style.maxHeight = watsonContent.scrollHeight + "px";
            } else {
                watsonContent.style.maxHeight = 0;
            }
        } else {

        }
    });

    // leon
    if (roles.includes("لئون حرفه ای")) {
        const leonButton = document.querySelector('#button-leon');
        const leonContent = document.querySelector('#content-leon');
        leonButton.addEventListener('click', () => {
            const idDiv = leonContent.querySelector('.identification');
            const actionsDiv = leonContent.querySelector('.actions');
            if (isIntroduction) {
                players.forEach(player => {
                    if (assignedRoles[player] == "لئون حرفه ای") {
                        idDiv.innerHTML = player;
                    }
                });
                idDiv.style.display = 'block';
                if (leonContent.classList.contains("show")) {
                    leonContent.style.maxHeight = leonContent.scrollHeight + "px";
                } else {
                    leonContent.style.maxHeight = 0;
                }
            }
        });
    } else {
        document.querySelector("#accordion-leon").remove();
    }

    // kane
    if (roles.includes("همشهری کین")) {
        const kaneButton = document.querySelector('#button-kane');
        const kaneContent = document.querySelector('#content-kane');
        kaneButton.addEventListener('click', () => {
            const idDiv = kaneContent.querySelector('.identification');
            const actionsDiv = kaneContent.querySelector('.actions');
            if (isIntroduction) {
                players.forEach(player => {
                    if (assignedRoles[player] == "همشهری کین") {
                        idDiv.innerHTML = player;
                    }
                });
                idDiv.style.display = 'block';
                if (kaneContent.classList.contains("show")) {
                    kaneContent.style.maxHeight = kaneContent.scrollHeight + "px";
                } else {
                    kaneContent.style.maxHeight = 0;
                }
            }
        });
    } else {
        document.querySelector("#accordion-kane").remove();
    }

    // constantine
    if (roles.includes("کنستانتین")) {
        const constantineButton = document.querySelector('#button-constantine');
        const constantineContent = document.querySelector('#content-constantine');
        constantineButton.addEventListener('click', () => {
            const idDiv = constantineContent.querySelector('.identification');
            const actionsDiv = constantineContent.querySelector('.actions');
            if (isIntroduction) {
                players.forEach(player => {
                    if (assignedRoles[player] == "کنستانتین") {
                        idDiv.innerHTML = player;
                    }
                });
                idDiv.style.display = 'block';
                if (constantineContent.classList.contains("show")) {
                    constantineContent.style.maxHeight = constantineContent.scrollHeight + "px";
                } else {
                    constantineContent.style.maxHeight = 0;
                }
            }
        });
    } else {
        document.querySelector("#accordion-constantine").remove();
    }

    // day-phase
    const goDayPhaseButton = document.querySelector('#go-day');
    goDayPhaseButton.addEventListener('click', () => {
        if (isIntroduction && (getCookie("nostradamusSide") == "citizen" || getCookie("nostradamusSide") == "mafia")) {
            setCookie("isIntroduction", "false", 7);
            setCookie("day", 1);
            isIntroduction = false;
            location.href = "../play/";
        } else if (isIntroduction) {
            neutralRoleButton.click();
        }
    });

    // console.log(Num2persian());
});