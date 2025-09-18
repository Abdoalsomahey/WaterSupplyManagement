// Add to your views files (e.g., errorViews.js)
export function render_NotFound() {
    return `
        <div class="container mt-5">
            <div class="row">
                <div class="col-md-12 text-center">
                    <div class="error-container">
                        <h1 class="display-1 text-primary">404</h1>
                        <h2 class="display-4">Page Not Found</h2>
                        <p class="lead">The page you're looking for doesn't exist or you don't have permission to access it.</p>
                        <div class="mt-4">
                            <a href="/" class="btn btn-primary me-2">
                                <i class="bi bi-house-door me-1"></i>Go to Dashboard
                            </a>
                            <button id="goBackBtn" class="btn btn-outline-secondary">
                                <i class="bi bi-arrow-left me-1"></i>Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}