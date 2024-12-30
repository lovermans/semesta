(() => {
    const THEME_STORAGE_KEY = 'theme-preference';

    function saveThemePreference() {
        // flip current value
        theme.value = theme.value === 'light' ? 'dark' : 'light';

        setThemePreference();
    };

    function getThemePreference() {
        if (localStorage.getItem(THEME_STORAGE_KEY)) {
            return localStorage.getItem(THEME_STORAGE_KEY)
        }
        else {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
    };

    function setThemePreference() {
        localStorage.setItem(THEME_STORAGE_KEY, theme.value);

        reflectThemePreference();
    };

    function reflectThemePreference() {
        document.firstElementChild.setAttribute('data-theme', theme.value);

        document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
    };

    let theme = {
        value: getThemePreference()
    };

    // set early so no page flashes / CSS is made aware
    reflectThemePreference();

    document.addEventListener("DOMContentLoaded", () => {
        // set on load so screen readers can see latest value on the button
        reflectThemePreference();

        // now this script can find and listen for clicks on the control
        document.querySelector('#theme-toggle').addEventListener('click', saveThemePreference);
    });

    // sync with system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
        theme.value = isDark ? 'dark' : 'light';

        setThemePreference();
    });
})();