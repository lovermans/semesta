// export function expandNavigationAccesibility() {
//     document.body.addEventListener('focus', (event) => {
//         if (event.target.matches('.menu li>button[aria-expanded]')) {
//             event.stopPropagation();

//             if (event.target.getAttribute('aria-expanded') === 'false') {
//                 event.target.setAttribute('aria-expanded', 'true');
//             }
//         }
//     }, true);
// };

function debounce(command, milisecondDelay) {
    let timer;

    return function (...argument) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            command(...argument);
        }, milisecondDelay);
    };
};

export function showHideTopAppBarOnScroll(element, milisecondDelay) {
    let lastWindowScrollPosition = 0;

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

    window.addEventListener('scroll', () => updateClass(element), { passive: true });
};

function updateCurrentPage(event) {
    document.querySelectorAll('nav li a')?.forEach(element => {
        element.ariaCurrent = 'false';
    });
    event.target.ariaCurrent = 'page';
};

export function handleGlobalClickEvent() {
    window.addEventListener('click', (event) => {
        if (event.target.closest('nav li a:not([data-pjax=true])')) {
            event.stopPropagation();
            updateCurrentPage(event);
        }
    });
};