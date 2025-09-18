export default function render_Login() {
    return `
        <div class="main-content">
            <div class="content-wrapper">
                <div class="card" style="max-width: 400px; margin: 0 auto;">
                    <div class="card-body">
                        <h3 class="text-center" style="margin-bottom: var(--spacing-xl); color: var(--text-primary);">Login</h3>
                        <!--Login Form-->
                        <form id="loginForm">
                            <!--Email-->
                            <div style="margin-bottom: var(--spacing-lg);">
                                <label for="username" class="form-label">Username</label>
                                <input type="text" class="form-control" id="username" name="user_name" placeholder="Enter your username" required>
                            </div>
                            <!--Password-->
                            <div style="margin-bottom: var(--spacing-2xl);">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" name="user_password" placeholder="Enter your password" required>
                            </div>
                            <!--Buttons-->
                            <div style="display: grid; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);">
                                <!--Login with Form Data-->
                                <button type="submit" class="btn" style="background-color: var(--primary-color); color: var(--white); padding: var(--spacing-md) var(--spacing-lg);">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}