var range = document.createRange();

export function renewAlert(message = '') {
    document.getElementById('app-session').replaceChildren(range.createContextualFragment(message));
};
