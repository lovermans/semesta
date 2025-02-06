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

export function findCurrentPage() {
    document.querySelectorAll('a[href]').forEach((element) => {
        (element.href == document.location.href) ? element.ariaCurrent = 'page' : element.ariaCurrent = 'false';
    });
};

export function getBrowserInfo(unknown, version, elementId) {
    const userAgent = navigator.userAgent;
    let browserName = unknown;
    let browserVersion = unknown;

    if (/chrome|crios|crmo/i.test(userAgent) && !/edg/i.test(userAgent)) {
        browserName = 'Google Chrome';
        browserVersion = userAgent.match(/chrome\/([0-9]+)/i)?.[1] || unknown;
    } else if (/firefox|fxios/i.test(userAgent)) {
        browserName = 'Mozilla Firefox';
        browserVersion = userAgent.match(/firefox\/([0-9]+)/i)?.[1] || unknown;
    } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo|edg/i.test(userAgent)) {
        browserName = 'Safari';
        browserVersion = userAgent.match(/version\/([0-9]+)/i)?.[1] || unknown;
    } else if (/edg/i.test(userAgent)) {
        browserName = 'Microsoft Edge';
        browserVersion = userAgent.match(/edge\/([0-9]+)/i)?.[1] || unknown;
    } else if (/opera|opr/i.test(userAgent)) {
        browserName = 'Opera';
        browserVersion = userAgent.match(/(?:opera|opr)\/([0-9]+)/i)?.[1] || unknown;
    };

    let detectedBrowser = `${browserName} version ${browserVersion}`;
    let detectedBrowserAnchor = document.getElementById(elementId);

    if (detectedBrowserAnchor) {
        detectedBrowserAnchor.textContent = detectedBrowser;
    };
};

export function handleAppLocaleChange() {
    document.getElementById('app-locale').addEventListener('change', (event) => {
        event.target.form.submit();
    })
};

export function handleGlobalClickEvent() {
    window.addEventListener('click', (event) => {
        if (event.target.closest('nav li a:not([data-pjax=true])')) {
            event.stopPropagation();
            updateCurrentPage(event);
        }
    });
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
    document.querySelectorAll('a[href]')?.forEach(element => {
        element.ariaCurrent = 'false';
    });
    event.target.ariaCurrent = 'page';
};
