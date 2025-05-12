import { useEffect, useState } from "react";
import axios from "axios";
import { useDarkMode } from "../context/DarkModeContext";
import DarkModeToggle from "../components/DarkModeToggle";
import { Link } from "react-router-dom";

function AllProblems() {
  const { isDarkMode } = useDarkMode();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/problems`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProblems(res.data);
      } catch (err) {
        setError("Failed to load problems");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className={`min-h-screen py-8 px-4 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-slate-900"}`}>
      <DarkModeToggle />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">All Problems</h1>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid gap-4">
          {problems.map((problem) => (
            <div
              key={problem._id}
              className={`p-4 rounded shadow-md ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <h2 className="text-xl font-semibold">{problem.title}</h2>
              <p className="text-sm mt-1 mb-2 text-slate-400">
                Difficulty: <span className={`font-medium ${problem.difficulty === "Easy" ? "text-green-500" : problem.difficulty === "Medium" ? "text-yellow-500" : "text-red-500"}`}>
                  {problem.difficulty}
                </span>
              </p>
              <p className="text-sm line-clamp-3">{problem.description}</p>
              <Link to={`/problems/${problem._id}`} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AllProblems;
