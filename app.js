document.addEventListener('DOMContentLoaded', () => {
    const tabs = {
        '1': document.getElementById('tab1'),
        '2': document.getElementById('tab2'),
        '3': document.getElementById('tab3')
    };

    const showTab = (tab) => {
        for (const key in tabs) {
            if (tabs.hasOwnProperty(key)) {
                tabs[key].style.display = (key === tab) ? 'block' : 'none';
            }
        }
    };

    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        const tab = hash ? hash : '1';
        showTab(tab);
    };

    window.addEventListener('hashchange', handleHashChange);

    handleHashChange();

    const startGameButton = document.getElementById('start-game');
    startGameButton.addEventListener('click', () => window.location.hash = '2');

    const playerContainer = document.getElementById('player-container');
    const nextStepButton = document.getElementById('next-step');

    const addPlayerInput = (playerCount) => {
        if (playerCount > 13) return;

        const playerInput = document.createElement('div');
        playerInput.className = 'player-input';
        playerInput.innerHTML = `
            <img src="https://gholamhasan.sirv.com/drag.png" alt="درگ" class="drag-handle">
            <label for="player${playerCount}">${playerCount}:</label>
            <input type="text" name="player${playerCount}" id="player${playerCount}">
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
        }
    };

    playerContainer.addEventListener('input', (e) => {
        checkAndAddInput();
        toggleNextStepButton();
    });

    playerContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-player') || e.target.parentElement.classList.contains('remove-player')) {
            e.target.closest('.player-input').remove();
            updateLabels();
            checkAndAddInput();
            toggleNextStepButton();
        }
    });

    playerContainer.addEventListener('focusout', removeEmptyInput);

    new Sortable(playerContainer, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: () => {
            updateLabels();
        }
    });

    addPlayerInput(1);
});