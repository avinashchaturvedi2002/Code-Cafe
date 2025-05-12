import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";
import { useDarkMode } from "../context/DarkModeContext";
import { useEffect } from "react";
import axios from "axios"




function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { isDarkMode } = useDarkMode();

  const handleLogin = async (e) => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      if (rememberMe) {
        localStorage.setItem("token", data.token);
        sessionStorage.setItem("token", data.token);
      } else {
        sessionStorage.setItem("token", data.token);
      }
      navigate("/problems");
      console.log("Login successful");
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
  
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        {
          theme: "outline",
          size: "medium",          // or "medium" if "small" is too tiny
          shape: "circle",        // makes it round!
          width: 40,              // control size (default is ~240)
        }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log("Google response token:", response.credential);
  
    try {
      const res = await axios.post(`${backendUrl}/api/auth/google`, {
        token: response.credential,
      });
  
      const token = res.data.token;
  
      rememberMe
        ? localStorage.setItem("token", token)
        : sessionStorage.setItem("token", token);
  
      navigate("/");
    } catch (err) {
      console.error("Google sign-in failed:", err.response?.data || err.message);
      setError("Google sign-in failed");
    }
  };
  
  

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-slate-900"} flex flex-col items-center justify-center py-6 px-4`}>
      <DarkModeToggle />

      <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl max-md:max-w-md w-full">
        <div>
          <h2 className="lg:text-5xl text-3xl font-bold lg:leading-[57px]">
            Welcome to Code Cafe
          </h2>
          <p className="text-sm mt-6 text-slate-500 dark:text-slate-300 leading-relaxed">
            Your Friendly Coding Corner — Code, Connect, Celebrate
          </p>
          <p className="text-sm mt-12 text-slate-500 dark:text-slate-300">
            Don't have an account?
            <Link to="/register" className="text-blue-600 font-medium hover:underline ml-1">
              Register here
            </Link>
          </p>
        </div>

        <form className="max-w-md md:ml-auto w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md" onSubmit={handleLogin}>
          <h3 className="text-2xl font-bold mb-6 dark:text-white">Sign in</h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm dark:text-white">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <p
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 hover:underline text-sm cursor-pointer"
              >
                Forgot password?
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              Log in
            </button>
          </div>
          <div class="my-4 flex items-center gap-4">
            <hr class="w-full border-slate-300" />
            <p class="text-sm text-slate-800 text-center dark:text-white">or</p>
            <hr class="w-full border-slate-300" />
          </div>

          <div class="space-x-6 flex justify-center">
            <button id="google-signin-btn" type="button"
              class="border-none outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 512 512">
                <path fill="#fbbd00" d="M120 256c0-25.367 6.989-49.13 19.131-69.477v-86.308H52.823C18.568 144.703 0 198.922 0 256s18.568 111.297 52.823 155.785h86.308v-86.308C126.989 305.13 120 281.367 120 256z" data-original="#fbbd00" />
                <path fill="#0f9d58" d="m256 392-60 60 60 60c57.079 0 111.297-18.568 155.785-52.823v-86.216h-86.216C305.044 385.147 281.181 392 256 392z" data-original="#0f9d58" />
                <path fill="#31aa52" d="m139.131 325.477-86.308 86.308a260.085 260.085 0 0 0 22.158 25.235C123.333 485.371 187.62 512 256 512V392c-49.624 0-93.117-26.72-116.869-66.523z" data-original="#31aa52" />
                <path fill="#3c79e6" d="M512 256a258.24 258.24 0 0 0-4.192-46.377l-2.251-12.299H256v120h121.452a135.385 135.385 0 0 1-51.884 55.638l86.216 86.216a260.085 260.085 0 0 0 25.235-22.158C485.371 388.667 512 324.38 512 256z" data-original="#3c79e6" />
                <path fill="#cf2d48" d="m352.167 159.833 10.606 10.606 84.853-84.852-10.606-10.606C388.668 26.629 324.381 0 256 0l-60 60 60 60c36.326 0 70.479 14.146 96.167 39.833z" data-original="#cf2d48" />
                <path fill="#eb4132" d="M256 120V0C187.62 0 123.333 26.629 74.98 74.98a259.849 259.849 0 0 0-22.158 25.235l86.308 86.308C162.883 146.72 206.376 120 256 120z" data-original="#eb4132" />
              </svg>
            </button>
            </div>
        </form>
        {/* <div  className="mt-6 flex justify-center"></div> */}
      </div>
    </div>
  );
}

export default Login;
