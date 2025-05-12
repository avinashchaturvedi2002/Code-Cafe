import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import DarkModeToggle from "../components/DarkModeToggle";

function CreateProblem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [testCases, setTestCases] = useState([
    { input: "", output: "" },
    { input: "", output: "" },
    { input: "", output: "" },
  ]);

  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/problems`, {
        title,
        description,
        difficulty,
        testCases,
      });
      navigate(`/problems/${response.data._id}`);
    } catch (err) {
      console.error("Error creating problem:", err);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} p-6`}>
      <div className="flex justify-end mb-4">
        <DarkModeToggle />
      </div>

      <h2 className="text-2xl font-bold mb-4">Create a New Problem</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title:</label>
          <input
            className="w-full p-2 border rounded dark:bg-gray-800"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Description:</label>
          <textarea
            className="w-full p-2 border rounded dark:bg-gray-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="6"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Difficulty:</label>
          <select
            className="w-full p-2 border rounded dark:bg-gray-800"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Sample & Test Cases</h3>
          {testCases.map((testCase, index) => (
            <div key={index} className="mb-3">
              <label className="block">Input (Test {index + 1}):</label>
              <input
                className="w-full p-2 border rounded dark:bg-gray-800"
                type="text"
                value={testCase.input}
                onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                required
              />
              <label className="block mt-1">Expected Output:</label>
              <input
                className="w-full p-2 border rounded dark:bg-gray-800"
                type="text"
                value={testCase.output}
                onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add More Test Case
          </button>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default CreateProblem;
