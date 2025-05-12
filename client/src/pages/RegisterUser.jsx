import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";
import { useDarkMode } from "../context/DarkModeContext";

function RegisterUser() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const [formData, setFormData] = useState({
    name: "",
    lname: "",
    username: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (formData.password !== formData.cpassword) {
      return setError("Passwords do not match");
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(formData.email)) {
    return setError("Please enter a valid email address.");
  }
    const fullName = `${formData.name} ${formData.lname}`.trim();

    const payload = {
      name: fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
setError(""); // clear any previous errors
setTimeout(() => {
  navigate("/login");
}, 5000);

      
    } catch (err) {
      console.error("Registration error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-slate-900"} flex flex-col items-center justify-center py-10 px-4`}>
      <DarkModeToggle />

      <form
        onSubmit={handleRegister}
        className="w-full max-w-3xl bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md"
      >
        <h3 className="text-3xl font-bold mb-8 text-center dark:text-white">
          Create your account
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">First Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Last Name</label>
            <input
              type="text"
              name="lname"
              value={formData.lname}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Confirm Password</label>
            <input
              type="password"
              name="cpassword"
              value={formData.cpassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="w-full flex justify-center items-center">
          

         
        <button
          type="submit"
          className="w-1/2 mt-8 py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded font-semibold md:w-1/4"
        >
          Sign up
        </button>
        </div>
        <p className="text-sm mt-6 text-center dark:text-slate-300">
          Already have an account?
          <Link to="/login" className="text-blue-600 font-medium hover:underline ml-1">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterUser;
