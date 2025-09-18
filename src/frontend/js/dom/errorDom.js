// Initialize the 404 page
export function init_NotFound() {
    document.getElementById('goBackBtn').addEventListener('click', () => {
        window.history.back();
    });
    console.log('404 page loaded');
}