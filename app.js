document.addEventListener('DOMContentLoaded', () => {
    const tabs = {
        '1': document.getElementById('tab1'),
        '2': document.getElementById('tab2'),
        '3': document.getElementById('tab3'),
        '4': document.getElementById('tab4')
    };
    const citizenRolesContainer = document.getElementById('citizen-roles-container');
    const mafiaRolesContainer = document.getElementById('mafia-roles-container');
    const neutralRolesContainer = document.getElementById('neutral-roles-container');
    const citizenRolesCount = document.getElementById('citizen-roles-count');
    const mafiaRolesCount = document.getElementById('mafia-roles-count');
    const neutralRolesCount = document.getElementById('neutral-roles-count');
    const selectedRolesCount = document.getElementById('selected-roles-count');
    const confirmRolesButton = document.getElementById('confirm-roles');
    let selectedRoles = [];
    let maxRolesCount = 0;

    const getCookie = name => {
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
        let expires = "";
        name = encodeURIComponent(name);
        value = encodeURIComponent(value);
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    };

    const showTab = (tab) => {
        for (const key in tabs) {
            if (tabs.hasOwnProperty(key)) {
                tabs[key].style.display = (key == tab) ? 'block' : 'none';
            }
        }
        if (tab == '3') {
            loadMaxRolesCountFromCookie();
            updateSideRolesCount();
        }
    };

    window.showTab = showTab;

    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        const tab = hash ? hash : '1';
        showTab(tab);
    };

    handleHashChange();

    const startGameButton = document.getElementById('start-game');
    startGameButton.addEventListener('click', () => window.location.hash = '2');

    const nextStepButton = document.getElementById('next-step');
    nextStepButton.addEventListener('click', () => window.location.hash = '3');

    const playerContainer = document.getElementById('player-container');

    const addPlayerInput = (playerCount, value = "") => {
        if (playerCount > 13) return;

        const playerInput = document.createElement('div');
        playerInput.className = 'player-input';
        playerInput.innerHTML = `
            <img src="https://gholamhasan.sirv.com/drag.png" alt="درگ" class="drag-handle">
            <label for="player${playerCount}">${playerCount}:</label>
            <input type="text" name="player${playerCount}" id="player${playerCount}" value="${value}">
            <button class="remove-player">
                <img src="https://gholamhasan.sirv.com/clear-x.png" alt="حذف">
            </button>
        `;
        playerContainer.appendChild(playerInput);
    };

    const updateLabels = () => {
        const playerInputs = playerContainer.querySelectorAll('.player-input');
        playerInputs.forEach((input, index) => {
            const label = input.querySelector('label');
            label.textContent = `${index + 1}:`;
            label.setAttribute('for', `player${index + 1}`);
            const inputField = input.querySelector('input');
            inputField.name = `player${index + 1}`;
            inputField.id = `player${index + 1}`;
        });
    };

    const checkAndAddInput = () => {
        const playerInputs = playerContainer.querySelectorAll('.player-input');
        if (playerInputs.length == 0 || (playerInputs[playerInputs.length - 1].querySelector('input').value.trim() !== '' && playerInputs.length < 13)) {
            const playerCount = playerInputs.length + 1;
            addPlayerInput(playerCount);
        }
    };

    const savePlayersToCookie = () => {
        const playerInputs = playerContainer.querySelectorAll('.player-input input');
        const players = Array.from(playerInputs).map(input => input.value).filter(value => value.trim() !== '');
        setCookie('players', JSON.stringify(players), 365);
    };

    const loadPlayersFromCookie = () => {
        const players = JSON.parse(getCookie('players') || '[]');
        players.forEach((player, index) => addPlayerInput(index + 1, player));
        checkAndAddInput();
        toggleNextStepButton();
    };

    const toggleNextStepButton = () => {
        const playerInputs = playerContainer.querySelectorAll('.player-input');
        const filledInputs = Array.from(playerInputs).filter(input => input.querySelector('input').value.trim() !== '');
        const watsonSelected = selectedRoles.includes('دکتر واتسون');
        const godfatherSelected = selectedRoles.includes('پدرخوانده');
        const currentTab = window.location.hash.substring(1);
        if (filledInputs.length >= 5 && currentTab == '2') {
            nextStepButton.style.display = 'block';
            confirmRolesButton.style.display = 'none';
        } else if (currentTab == '3' && watsonSelected && godfatherSelected && selectedRoles.length == maxRolesCount) {
            nextStepButton.style.display = 'none';
            confirmRolesButton.style.display = 'block';
        } else {
            nextStepButton.style.display = 'none';
            confirmRolesButton.style.display = 'none';
        }
    };

    const removeEmptyInput = (event) => {
        const inputField = event.target;
        if (inputField.value.trim() == '') {
            inputField.closest('.player-input').remove();
            updateLabels();
            checkAndAddInput();
            toggleNextStepButton();
            savePlayersToCookie();
        }
    };

    playerContainer.addEventListener('input', (e) => {
        checkAndAddInput();
        toggleNextStepButton();
        savePlayersToCookie();
    });

    playerContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-player') || e.target.parentElement.classList.contains('remove-player')) {
            e.target.closest('.player-input').remove();
            updateLabels();
            checkAndAddInput();
            toggleNextStepButton();
            savePlayersToCookie();
        }
    });

    playerContainer.addEventListener('focusout', removeEmptyInput);

    new Sortable(playerContainer, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: () => {
            updateLabels();
            savePlayersToCookie();
        }
    });

    loadPlayersFromCookie();

    const toggleRoleSelection = (roleButton) => {
        if (selectedRoles.length > maxRolesCount) {
            selectedRoles = [];
            document.querySelectorAll('.role-button').forEach(button => button.classList.remove('selected'));
            showTab('2');
            return;
        }
        const role = roleButton.getAttribute('data-role');
        let count = parseInt(roleButton.getAttribute('data-count')) || 0;

        if (role == 'شهروند ساده' || role == 'مافیای ساده') {
            if (selectedRoles.filter(r => r == role).length < count + 1 && selectedRoles.length < maxRolesCount) {
                selectedRoles.push(role);
                count++;
                roleButton.setAttribute('data-count', count);
                roleButton.classList.add('selected');
                const removeButton = roleButton.querySelector('.remove-button');
                if (removeButton) {
                    removeButton.style.display = 'inline';
                }
            }
        } else {
            const roleIndex = selectedRoles.indexOf(role);
            if (roleIndex !== -1) {
                selectedRoles.splice(roleIndex, 1);
                roleButton.classList.remove('selected');
            } else {
                if (selectedRoles.length < maxRolesCount) {
                    selectedRoles.push(role);
                    roleButton.classList.add('selected');
                }
            }
        }

        if (['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز'].includes(role)) {
            const neutralButtons = document.querySelectorAll('.role-button.neutral');
            const selectedRole = document.querySelector(`.role-button[data-role="${role}"]`);
            neutralButtons.forEach(neutralButton => {
                if (selectedRole != neutralButton) {
                    neutralButton.classList.remove('selected');

                    if (selectedRole.classList.contains('selected')) {
                        neutralButton.classList.add('disabled');
                    } else {
                        neutralButton.classList.remove('disabled');
                    }
                }
            });
        }

        updateSideRolesCount();
        toggleCitizenRolesState();
        toggleSimpleCitizenState();
        toggleMatadorState();
        toggleSaulGoodmanState();
        toggleSimpleMafiaState();
        toggleNextStepButton();
    };

    const removeRole = (roleButton) => {
        const role = roleButton.getAttribute('data-role');
        let count = parseInt(roleButton.getAttribute('data-count')) || 0;
        if (count >= 1 && roleButton.classList.contains('selected')) {
            if (count > 1) {
                count--;
                roleButton.setAttribute('data-count', count);
            } else if (count == 1) {
                count = 0;
                roleButton.setAttribute('data-count', count);
                roleButton.classList.remove('selected');
            }
        } else {
            count = 0;
            roleButton.setAttribute('data-count', count);
            roleButton.classList.remove('selected');
        }

        const roleIndex = selectedRoles.indexOf(role);
        if (roleIndex !== -1) {
            selectedRoles.splice(roleIndex, 1);
        }

        updateSideRolesCount();
        toggleCitizenRolesState();
        toggleSimpleCitizenState();
        toggleMatadorState();
        toggleSaulGoodmanState();
        toggleSimpleMafiaState();
        toggleNextStepButton();
    };

    const toggleCitizenRolesState = () => {
        const watsonSelected = selectedRoles.includes('دکتر واتسون');
        const citizenRoles = document.querySelectorAll('.role-button.citizen:not([data-role="دکتر واتسون"], [data-role="شهروند ساده"])');

        citizenRoles.forEach(roleButton => {
            if (watsonSelected) {
                roleButton.classList.remove('disabled');
            } else {
                roleButton.classList.add('disabled');
                selectedRoles = selectedRoles.filter(r => r !== roleButton.getAttribute('data-role'));
                roleButton.classList.remove('selected');
            }
        });
        updateSideRolesCount();
    };

    const toggleSimpleCitizenState = () => {
        const citizenRoles = ['دکتر واتسون', 'لئون حرفه ای', 'همشهری کین', 'کنستانتین'];
        const selectedCitizenRoles = citizenRoles.filter(role => selectedRoles.includes(role));
        const simpleCitizenButton = document.querySelector('.role-button[data-role="شهروند ساده"]');

        if (selectedCitizenRoles.length == 4) {
            simpleCitizenButton.classList.remove('disabled');
        } else {
            simpleCitizenButton.classList.add('disabled');
            simpleCitizenButton.setAttribute('data-count', 0);
            selectedRoles = selectedRoles.filter(r => r !== 'شهروند ساده');
            simpleCitizenButton.classList.remove('selected');
            const removeButton = simpleCitizenButton.querySelector('img');
            if (removeButton) {
                removeButton.style.display = 'none';
            }
        }
        updateSideRolesCount();
    };

    const toggleMatadorState = () => {
        const godfatherSelected = selectedRoles.includes('پدرخوانده');
        const matadorButton = document.querySelector('.role-button[data-role="ماتادور"]');

        if (godfatherSelected) {
            matadorButton.classList.remove('disabled');
        } else {
            matadorButton.classList.add('disabled');
            selectedRoles = selectedRoles.filter(r => r !== 'ماتادور');
            matadorButton.classList.remove('selected');
        }
        updateSideRolesCount();
    };

    const toggleSaulGoodmanState = () => {
        const godfatherSelected = selectedRoles.includes('پدرخوانده');
        const matadorSelected = selectedRoles.includes('ماتادور');
        const simpleCitizenCount = parseInt(document.querySelector('.role-button[data-role="شهروند ساده"]').getAttribute('data-count')) || 0;
        const saulGoodmanButton = document.querySelector('.role-button[data-role="ساول گودمن"]');

        if (godfatherSelected && matadorSelected && simpleCitizenCount > 0) {
            saulGoodmanButton.classList.remove('disabled');
        } else {
            saulGoodmanButton.classList.add('disabled');
            selectedRoles = selectedRoles.filter(r => r !== 'ساول گودمن');
            saulGoodmanButton.classList.remove('selected');
        }
        updateSideRolesCount();
    };

    const toggleSimpleMafiaState = () => {
        const mafiaRoles = ['پدرخوانده', 'ماتادور', 'ساول گودمن'];
        const selectedMafiaRoles = mafiaRoles.filter(role => selectedRoles.includes(role));
        const simpleMafiaButton = document.querySelector('.role-button[data-role="مافیای ساده"]');

        if (selectedMafiaRoles.length == 3) {
            simpleMafiaButton.classList.remove('disabled');
        } else {
            simpleMafiaButton.classList.add('disabled');
            simpleMafiaButton.setAttribute('data-count', 0);
            selectedRoles = selectedRoles.filter(r => r !== 'مافیای ساده');
            simpleMafiaButton.classList.remove('selected');
            const removeButton = simpleMafiaButton.querySelector('img');
            if (removeButton) {
                removeButton.style.display = 'none';
            }
        }
        updateSideRolesCount();
    };

    function updateSideRolesCount() {
        const simpleCitizenButton = document.querySelector('.role-button[data-role="شهروند ساده"]');
        const simpleMafiaButton = document.querySelector('.role-button[data-role="مافیای ساده"]');
        const simpleCitizenCount = parseInt(simpleCitizenButton.getAttribute('data-count')) || 0;
        const simpleMafiaCount = parseInt(simpleMafiaButton.getAttribute('data-count')) || 0;

        const citizenSelected = selectedRoles.filter(role => {
            return ['دکتر واتسون', 'لئون حرفه ای', 'همشهری کین', 'کنستانتین'].includes(role);
        }).length;

        const mafiaSelected = selectedRoles.filter(role => {
            return ['پدرخوانده', 'ماتادور', 'ساول گودمن'].includes(role);
        }).length;

        const neutralSelected = selectedRoles.filter(role => {
            return ['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز'].includes(role);
        }).length;

        citizenRolesCount.textContent = `${citizenSelected + simpleCitizenCount} شهروند`;
        mafiaRolesCount.textContent = `${mafiaSelected + simpleMafiaCount} مافیا`;
        neutralRolesCount.textContent = `${neutralSelected} مستقل`;
        selectedRolesCount.textContent = `تعداد نقش‌های انتخاب شده: ${citizenSelected + simpleCitizenCount + mafiaSelected + simpleMafiaCount + neutralSelected} از ${maxRolesCount}`;
    }

    window.addEventListener('load', () => {
        toggleCitizenRolesState();
        toggleSimpleCitizenState();
        toggleMatadorState();
        toggleSaulGoodmanState();
        toggleSimpleMafiaState();
    });

    function updateSideRolesCount() {
        const simpleCitizenButton = document.querySelector('.role-button[data-role="شهروند ساده"]');
        const simpleMafiaButton = document.querySelector('.role-button[data-role="مافیای ساده"]');
        const simpleCitizenCount = parseInt(simpleCitizenButton.getAttribute('data-count')) || 0;
        const simpleMafiaCount = parseInt(simpleMafiaButton.getAttribute('data-count')) || 0;

        const citizenSelected = selectedRoles.filter(role => {
            return ['دکتر واتسون', 'لئون حرفه ای', 'همشهری کین', 'کنستانتین'].includes(role);
        }).length;

        const mafiaSelected = selectedRoles.filter(role => {
            return ['پدرخوانده', 'ماتادور', 'ساول گودمن'].includes(role);
        }).length;

        const neutralSelected = selectedRoles.filter(role => {
            return ['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز'].includes(role);
        }).length;

        citizenRolesCount.textContent = `${citizenSelected + simpleCitizenCount} شهروند`;
        mafiaRolesCount.textContent = `${mafiaSelected + simpleMafiaCount} مافیا`;
        neutralRolesCount.textContent = `${neutralSelected} مستقل`;
        selectedRolesCount.textContent = `تعداد نقش‌های انتخاب شده: ${citizenSelected + simpleCitizenCount + mafiaSelected + simpleMafiaCount + neutralSelected} از ${maxRolesCount}`;
    }

    [citizenRolesContainer, mafiaRolesContainer, neutralRolesContainer].forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('role-button')) {
                toggleRoleSelection(e.target);
                toggleNextStepButton();
            }
        });
    });

    function loadMaxRolesCountFromCookie() {
        const players = JSON.parse(getCookie('players') || '[]');
        maxRolesCount = players.length;
        updateSideRolesCount();
    }

    loadMaxRolesCountFromCookie();

    const infoButton = document.getElementById('info-button');
    const infoModal = document.getElementById('info-modal');
    const closeButton = document.querySelector('.close-button');
    infoButton.addEventListener('click', () => {
        infoModal.style.display = 'block';
    });
    closeButton.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == infoModal) {
            infoModal.style.display = 'none';
        }
    });
    window.addEventListener('hashchange', () => {
        handleHashChange();
        toggleNextStepButton();
    });
    window.removeRole = removeRole;
    confirmRolesButton.onclick = () => {
        setCookie('roles', JSON.stringify(selectedRoles), 365);
        window.location.hash = '4';
        AssignRoles();
    }
    const getRolesFromCookie = () => JSON.parse(getCookie("roles") || "[]");
    const loadTabThreeData = () => {
        const rolesData = getRolesFromCookie();
        if (rolesData.length > 0) {
            selectedRoles = rolesData;
            if (rolesData.indexOf('شهروند ساده') == -1 && rolesData.indexOf('مافیای ساده') == -1) {
                rolesData.forEach(role => {
                    document.querySelectorAll(".role-button").forEach(button => {
                        if (button.getAttribute('data-role') == role) {
                            button.classList.add('selected');
                        }
                    })
                });
            } else {
                const citizenCount = rolesData.filter(role => role.includes('شهروند ساده')).length;
                const mafiaCount = rolesData.filter(role => role.includes('مافیای ساده')).length;
                if (citizenCount > 0) {
                    document.querySelector('.role-button[data-role="شهروند ساده"]').classList.add('selected');
                    document.querySelector('.role-button[data-role="شهروند ساده"]').setAttribute('data-count', citizenCount);
                    selectedRoles.sort();
                    const ind = selectedRoles.indexOf('شهروند ساده');
                    selectedRoles.splice(ind, citizenCount);
                }
                if (mafiaCount > 0) {
                    document.querySelector('.role-button[data-role="مافیای ساده"]').classList.add('selected');
                    document.querySelector('.role-button[data-role="مافیای ساده"]').setAttribute('data-count', mafiaCount);
                    selectedRoles.sort();
                    const ind = selectedRoles.indexOf('مافیای ساده');
                    selectedRoles.splice(ind, mafiaCount);
                }
                selectedRoles.forEach(role => {
                    document.querySelectorAll(".role-button").forEach(button => {
                        if (button.getAttribute('data-role') == role) {
                            button.classList.add('selected');
                        }
                    })
                });
                selectedRoles = getRolesFromCookie();
            }
            updateSideRolesCount();
            toggleNextStepButton();
        }
    }
    loadTabThreeData();

    const AssignRoles = () => {
        const players = JSON.parse(getCookie('players') || '[]');
        let roles = getRolesFromCookie();
        if (!roles || !players || roles.length <= 0 || players.length <= 0 || roles.length != players.length) {
            return false;
        }
        roles = shuffleArray(roles);
        const roleDistribution = players.map((player, index) => ({
            player,
            role: roles[index]
        }));
        const assigned = {}
        players.forEach((player, index) => {
            assigned[player] = roles[index];
        });
        setCookie('assigned', JSON.stringify(assigned), 365);
        displayAssignedRoles(roleDistribution);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let roleDescriptions = {};

    fetch('https://gholamhasan.sirv.com/desc.json')
        .then(response => response.json())
        .then(data => {
            roleDescriptions = data;
            const infoModalContent = document.getElementById('info-modal-content-3');
            infoModalContent.innerHTML = '';
            Object.entries(roleDescriptions).forEach(([role, description]) => {
                const roleHeading = document.createElement('h3');
                roleHeading.textContent = role;
                const roleDescription = document.createElement('p');
                roleDescription.textContent = description;
                infoModalContent.appendChild(roleHeading);
                infoModalContent.appendChild(roleDescription);
            });
        })
        .catch(error => console.error('Error loading role descriptions:', error));

    const displayAssignedRoles = (roleDistribution) => {
        const resultDiv = document.getElementById('assigned-roles-result');
        resultDiv.innerHTML = '';
        roleDistribution.forEach((distribution, index) => {
            const button = document.createElement('button');
            button.textContent = distribution.player;
            button.classList.add('role-display-button');
            button.setAttribute('data-role', distribution.role);
            button.setAttribute('id', `role-button-${index}`);
            button.onclick = () => showRoleDetails(distribution, `role-button-${index}`);
            resultDiv.appendChild(button);
        });
    }

    const showRoleDetails = (distribution, buttonId) => {
        const modal = document.getElementById('role-details-modal');
        const modalContent = document.getElementById('role-details-content');
        const imageUrl = getRoleImageURL(distribution.role);
        modalContent.innerHTML = `
                <img src="${imageUrl}" alt="${distribution.role}">
                <h3 style="color: #333">${distribution.player}: <span style="color: ${getRoleColor(distribution.role)}">${distribution.role}</span></h3>
                <p>${roleDescriptions[distribution.role] || 'توضیحات موجود نیست.'}</p>
            `;
        modal.style.display = 'block';

        const roleButton = document.getElementById(buttonId);
        if (roleButton) {
            roleButton.classList.add('viewed');
        }
    }

    const getRoleColor = role => {
        const citizenRoles = ['دکتر واتسون', 'همشهری کین', 'کنستانتین', 'لئون حرفه ای', 'شهروند ساده'];
        const mafiaRoles = ['ماتادور', 'ساول گودمن', 'پدرخوانده', 'مافیای ساده'];
        const neutralRoles = ['نوستراداموس', 'جک اسپارو', 'شرلوک هولمز'];
        if (citizenRoles.includes(role)) {
            return '#007';
        } else if (mafiaRoles.includes(role)) {
            return '#b00';
        } else if (neutralRoles.includes(role)) {
            return '#ffb000';
        } else {
            return '#000000';
        }
    }

    const getRoleImageURL = (role) => {
        const roleImageURLs = {
            "ماتادور": "https://gholamhasan.sirv.com/mafia-images/1.png",
            "لئون حرفه ای": "https://gholamhasan.sirv.com/mafia-images/2.png",
            "همشهری کین": "https://gholamhasan.sirv.com/mafia-images/3.png",
            "پدرخوانده": "https://gholamhasan.sirv.com/mafia-images/4.png",
            "دکتر واتسون": "https://gholamhasan.sirv.com/mafia-images/5.png",
            "کنستانتین": "https://gholamhasan.sirv.com/mafia-images/6.png",
            "ساول گودمن": "https://gholamhasan.sirv.com/mafia-images/7.png",
            "نوستراداموس": "https://gholamhasan.sirv.com/mafia-images/11.png"
        };

        const citizenImages = [
            "https://gholamhasan.sirv.com/mafia-images/8.png",
            "https://gholamhasan.sirv.com/mafia-images/9.png",
            "https://gholamhasan.sirv.com/mafia-images/10.png"
        ];

        if (role == "شهروند ساده") {
            const randomIndex = Math.floor(Math.random() * citizenImages.length);
            return citizenImages[randomIndex];
        }

        return roleImageURLs[role] || "https://gholamhasan.sirv.com/mafia-images/default.png";
    }

    document.getElementById('start-game-button').onclick = () => {
        const assigned = JSON.parse(getCookie("assigned") || "{}");
        if (Object.keys(assigned).length > 0) {
            location.href = "./play/";
        }
    };

    const closeModal = () => {
        const modal = document.getElementById('role-details-modal');
        modal.style.display = 'none';
    }
    window.closeModal = closeModal;
    window.onclick = (event) => {
        const modals = document.querySelectorAll('.info-modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    AssignRoles();

    // Preload
    const imageURLs = [
        "https://gholamhasan.sirv.com/mafia-images/1.png",
        "https://gholamhasan.sirv.com/mafia-images/2.png",
        "https://gholamhasan.sirv.com/mafia-images/3.png",
        "https://gholamhasan.sirv.com/mafia-images/4.png",
        "https://gholamhasan.sirv.com/mafia-images/5.png",
        "https://gholamhasan.sirv.com/mafia-images/6.png",
        "https://gholamhasan.sirv.com/mafia-images/7.png",
        "https://gholamhasan.sirv.com/mafia-images/8.png",
        "https://gholamhasan.sirv.com/mafia-images/9.png",
        "https://gholamhasan.sirv.com/mafia-images/10.png",
        "https://gholamhasan.sirv.com/mafia-images/11.png",
        "https://gholamhasan.sirv.com/drag.png",
        "https://gholamhasan.sirv.com/clear-x.png",
        "https://gholamhasan.sirv.com/info.png",
        "https://gholamhasan.sirv.com/right.png",
        "https://gholamhasan.sirv.com/tick.png",
        "https://gholamhasan.sirv.com/default.png"
    ];
    
    const preloadImages = (urls) => {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    };
    
    window.onload = () => preloadImages(imageURLs);
});