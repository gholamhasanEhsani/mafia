document.addEventListener('DOMContentLoaded', () => {
    const tabs = {
        '1': document.getElementById('tab1'),
        '2': document.getElementById('tab2'),
        '3': document.getElementById('tab3')
    };

    const showTab = (tab) => {
        console.log("Showing tab:", tab);
        for (const key in tabs) {
            if (tabs.hasOwnProperty(key)) {
                tabs[key].style.display = (key === tab) ? 'block' : 'none';
            }
        }
    };
    window.showTab = showTab;

    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        const tab = hash ? hash : '1';
        showTab(tab);
    };

    window.addEventListener('hashchange', handleHashChange);

    handleHashChange();

    const startGameButton = document.getElementById('start-game');
    startGameButton.addEventListener('click', () => window.location.hash = '2');

    const nextStepButton = document.getElementById('next-step');
    nextStepButton.addEventListener('click', () => window.location.hash = '3');

    const playerContainer = document.getElementById('player-container');

    const setCookie = (name, value, days) => {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    };

    const getCookie = (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

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
        if (playerInputs.length === 0 || (playerInputs[playerInputs.length - 1].querySelector('input').value.trim() !== '' && playerInputs.length < 13)) {
            const playerCount = playerInputs.length + 1;
            addPlayerInput(playerCount);
        }
    };

    const savePlayersToCookie = () => {
        const playerInputs = playerContainer.querySelectorAll('.player-input input');
        const players = Array.from(playerInputs).map(input => input.value).filter(value => value.trim() !== '');
        setCookie('players', JSON.stringify(players), 7);
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
        if (filledInputs.length >= 5) {
            nextStepButton.style.display = 'block';
        } else {
            nextStepButton.style.display = 'none';
        }
    };

    const removeEmptyInput = (event) => {
        const inputField = event.target;
        if (inputField.value.trim() === '') {
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
    // tab 3
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

    const toggleRoleSelection = (roleButton) => {
        const role = roleButton.getAttribute('data-role');
        const maxCount = roleButton.getAttribute('data-max');
        let count = parseInt(roleButton.getAttribute('data-count')) || 0;

        if (role === 'شهروند ساده' || role === 'مافیای ساده') {
            if (!selectedRoles.includes(role)) {
                selectedRoles.push(role);
                count = 1; // شروع شمارش از یک
            } else {
                count++;
            }
            roleButton.setAttribute('data-count', count);
            roleButton.classList.add('selected');

            if (count >= 1) {
                roleButton.classList.add('has-role');
            }
        } else {
            const roleIndex = selectedRoles.indexOf(role);
            if (roleIndex !== -1) {
                selectedRoles.splice(roleIndex, 1);
                roleButton.classList.remove('selected');
            } else {
                if (selectedRoles.length < maxRolesCount && (maxCount === '∞' || selectedRoles.filter(r => r === role).length < maxCount)) {
                    selectedRoles.push(role);
                    roleButton.classList.add('selected');
                }
            }
        }
        updateSideRolesCount();
    };

    const removeRole = (roleButton) => {
        const role = roleButton.getAttribute('data-role');
        let count = parseInt(roleButton.getAttribute('data-count')) || 0;
        console.log(count);

        if (count > 1) {
            count--;
            roleButton.setAttribute('data-count', count);
        } else if (count === 1) {
            count = 0;
            roleButton.setAttribute('data-count', count);
            roleButton.classList.remove('has-role');
        }

        if (count <= 1) {
            roleButton.classList.remove('selected');
            roleButton.querySelector('img').style.display = 'none';
        }

        updateSideRolesCount();
    };
    window.removeRole = removeRole;
    const updateSideRolesCount = () => {
        const simpleCitizenCount = parseInt(document.querySelector('.role-button[data-role="شهروند ساده"]').getAttribute('data-count')) || 0;
        const simpleMafiaCount = parseInt(document.querySelector('.role-button[data-role="مافیای ساده"]').getAttribute('data-count')) || 0;

        const citizenSelected = selectedRoles.filter(role => {
            return ['دکتر واتسون', 'لئون حرفه ای', 'همشهری کین', 'کنستانتین'].includes(role);
        }).length;

        const mafiaSelected = selectedRoles.filter(role => {
            return ['پدرخوانده', 'ماتادور', 'ساول گودمن'].includes(role);
        }).length;

        const neutralSelected = selectedRoles.filter(role => {
            return ['نوستاراداموس', 'جک اسپارو', 'شرلوک هولمز'].includes(role);
        }).length;

        citizenRolesCount.textContent = `${citizenSelected + simpleCitizenCount} شهروند`;
        mafiaRolesCount.textContent = `${mafiaSelected + simpleMafiaCount} مافیا`;
        neutralRolesCount.textContent = `${neutralSelected} مستقل`;
        selectedRolesCount.textContent = `تعداد نقش‌های انتخاب شده: ${citizenSelected + simpleCitizenCount + mafiaSelected + simpleMafiaCount + neutralSelected} از ${maxRolesCount}`;
    };

    [citizenRolesContainer, mafiaRolesContainer, neutralRolesContainer].forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('role-button')) {
                toggleRoleSelection(e.target);
            }
        });
    });

    const loadMaxRolesCountFromCookie = () => {
        const players = JSON.parse(getCookie('players') || '[]');
        maxRolesCount = players.length;
        updateSideRolesCount();
    };

    loadMaxRolesCountFromCookie();
});