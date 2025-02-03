
function saveThemePreference() {
    // flip current value
    preference.theme = preference.theme === 'light' ? 'dark' : 'light';

    setThemePreference();
};

function saveColorPreference() {
    preference.color = document.querySelector('#app-color-theme').value;

    setColorPreference();
};

function getThemePreference() {
    if (localStorage.getItem('theme-preference')) {
        return localStorage.getItem('theme-preference')
    }
    else {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
};

function getColorPreference() {
    if (localStorage.getItem('color-preference')) {
        return localStorage.getItem('color-preference');
    }
    else {
        return Math.floor(Math.random() * (1 + 360 - 0)) + 0;
    }
};

function setThemePreference() {
    localStorage.setItem('theme-preference', preference.theme);

    reflectThemePreference();
};

function setColorPreference() {
    localStorage.setItem('color-preference', preference.color);

    reflectColorPreference();
};

function reflectThemePreference() {
    document.firstElementChild.setAttribute('data-theme', preference.theme);

    var themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.setAttribute('aria-label', preference.theme);
    }
};

function reflectColorPreference() {
    document.documentElement.style.setProperty('--hue', preference.color);

    var colorSlider = document.getElementById('app-color-theme');

    if (colorSlider) {
        colorSlider.value = preference.color;
    };
};

function updateColorPreference(hue) {
    document.documentElement.style.setProperty('--hue', hue);
};

function shuffleColorPreference() {
    localStorage.removeItem('color-preference');
    preference.color = getColorPreference();

    reflectColorPreference();
};

var preference = {
    theme: getThemePreference(),
    color: getColorPreference()
};

// set early so no page flashes / CSS is made aware
reflectThemePreference();
reflectColorPreference();

window.addEventListener("DOMContentLoaded", () => {
    // set on load so screen readers can see latest value on the button
    reflectThemePreference();
    reflectColorPreference();

    // now this script can find and listen for clicks on the control
    document.getElementById('theme-toggle').addEventListener('click', saveThemePreference);
    document.getElementById('save-app-color-theme').addEventListener('click', saveColorPreference);
    document.getElementById('shuffle-app-color-theme').addEventListener('click', shuffleColorPreference);
    document.getElementById('app-color-theme').addEventListener('input', (event) => {
        updateColorPreference(event.target.value);
    });
});

// sync with system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
    preference.theme = isDark ? 'dark' : 'light';

    setThemePreference();
});
