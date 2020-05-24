// Set links up to load new pages.
    document.querySelectorAll('.channels').forEach(link => {
        link.onclick = () => {
            load_page(link.dataset.page);
            return false;
    };
});
// Renders contents of new page in main view.
function load_page(name) {
const request = new XMLHttpRequest();
    request.open('GET', `/${name}`);
    request.onload = () => {
    const response = request.responseText;
    document.querySelector('#body').innerHTML = response;
};
request.send();
