export default function render_Login() {
    return `
        <div class="m-4 conteiner">
            <div class="row">
                <div class="col"></div>
                <div class="  col-md-4 background-dashboard col-12 rounded col-lg-3 mx-auto col-xl-3 col-sm-6">
                    <h3 class=" mt-3 text-light text-center">Login</h3>
                    <!--Login Form-->
                    <form id="loginForm">
                        <!--Email-->
                        <div class="mb-3">
                            <label for="username" class="text-light form-label">Username</label>
                			<input type="text" class="form-control" id="username" name="user_name" placeholder="Enter your username" required>
                        </div>
                        <!--Password-->
                        <div class="mb-5">
                            <label for="password" class="text-light form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="user_password" placeholder="password" required>
                        </div>
                        <!--Buttons-->
                        <div class="gap-2 d-grid mb-4">
                            <!--Login with Form Data-->
                            <button type="submit" id="button-login" class="button-custom my_bacground_grey p-2 rounded ">Login</button>
                        </div>
                    </form>
                </div>
                <div class="col"></div>
            </div>
        </div>
    `;
}