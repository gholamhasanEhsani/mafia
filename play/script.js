const citizenRoles = ["شهروند ساده", "دکتر واتسون", "لئون حرفه ای", "همشهری کین", "کنستانتین"];
const mafiaRoles = ["پدرخوانده", "ماتادور", "ساول گودمن", "مافیای ساده"];
const neutralRoles = ["نوستراداموس", "جک اسپارو *", "شرلوک هولمز *"];

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

const assignedRoles = JSON.parse(getCookie("assigned") || "{}");

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
    const input = fixedTime === null ? document.getElementById(`${id}-input`).value : fixedTime;
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
                bellAudio.play().catch(error => console.error('Audio playback failed:', error));زمان
                resetTimers();
            }
        }, 1000);
        button.textContent = 'توقف';
    }
};

document.querySelectorAll('.timer-button').forEach(button => {
    button.dataset.initialText = button.textContent;
    button.addEventListener('click', () => {
        if (!bellAudio.paused) {
            bellAudio.pause();
            bellAudio.currentTime = 0;
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const rolesContainer = document.getElementById("content-roles");
    rolesContainer.classList.add('role-container');

    if (Object.keys(assignedRoles).length > 0) {
        rolesContainer.innerHTML = Object.entries(assignedRoles).map(([player, role]) => {
            let roleClass = "";
            if (citizenRoles.includes(role)) {
                roleClass = "role-citizen";
            } else if (mafiaRoles.includes(role)) {
                roleClass = "role-mafia";
            } else if (neutralRoles.includes(role)) {
                roleClass = "role-neutral";
            }
            return `<div class="role-card ${roleClass}">
                        <div class="role-player">${player}</div>
                        <div class="role-name">${role}</div>
                    </div>`;
        }).join('');
    } else {
        rolesContainer.innerHTML = `
            <p>هیچ نقشی اختصاص داده نشده است. لطفا ابتدا نقش‌ها را توزیع کنید.</p>
            <button onclick="window.location.href='../'">توزیع نقش‌ها</button>
        `;
    }

    const accordions = document.querySelectorAll(".accordion-button");
    accordions.forEach((button, i) => {
        const content = button.nextElementSibling;
        const icon = button.querySelector(".accordion-icon");
        content.classList.add("show");
        content.style.maxHeight = content.scrollHeight + "px";
        icon.textContent = "-";
        button.addEventListener("click", () => {
            content.classList.toggle("show");
            if (content.classList.contains("show")) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.textContent = "-";
            } else {
                content.style.maxHeight = null;
                icon.textContent = "+";
            }
        });
        if (i == 2) {
            button.click();
        }
    });
});