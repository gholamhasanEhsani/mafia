document.addEventListener('DOMContentLoaded', function () {
    const tabs = {
        '1': document.getElementById('tab1'),
        '2': document.getElementById('tab2'),
        '3': document.getElementById('tab3')
    };

    function showTab(tab) {
        for (const key in tabs) {
            if (tabs.hasOwnProperty(key)) {
                tabs[key].style.display = (key === tab) ? 'block' : 'none';
            }
        }
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const tab = hash ? hash : '1';
        showTab(tab);
    }

    window.addEventListener('hashchange', handleHashChange);

    handleHashChange();
});