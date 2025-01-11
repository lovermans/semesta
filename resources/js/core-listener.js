export function showHideTopAppBarOnScroll(element, milisecondDelay) {
    let lastWindowScrollPosition = 0;

    let debounce = (command, milisecondDelay) => {
        let timer;

        return function (...argument) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                command(...argument);
            }, milisecondDelay);
        };
    };

    let updateClass = (targetElement) => {

        let currentWindowSrollPosition = window.scrollY;

        if (currentWindowSrollPosition <= 0) {
            targetElement.classList.remove('scrolled-up');
            targetElement.classList.remove('scrolled-down');
        }

        if (currentWindowSrollPosition > lastWindowScrollPosition && !targetElement.classList.contains('scrolled-down')) {
            targetElement.classList.remove('scrolled-up');
            targetElement.classList.add('scrolled-down');
        }

        if (currentWindowSrollPosition < lastWindowScrollPosition && targetElement.classList.contains('scrolled-down')) {
            targetElement.classList.remove('scrolled-down');
            targetElement.classList.add('scrolled-up');
        }

        lastWindowScrollPosition = currentWindowSrollPosition;

    };

    updateClass = debounce(updateClass, milisecondDelay);

    window.addEventListener('scroll', () => updateClass(element));
};
