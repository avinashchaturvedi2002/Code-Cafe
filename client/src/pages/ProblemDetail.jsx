import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { useDarkMode } from "../context/DarkModeContext";

function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");
  const [submissionResult, setSubmissionResult] = useState(null);
  const { isDarkMode } = useDarkMode();

  const languageExtensions = {
    javascript: javascript(),
    python: python(),
    cpp: cpp(),
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error("Failed to fetch problem:", err);
      }
    };
    fetchProblem();
  }, [id]);

  const convertTestCase = (input, lang) => {
    const match = input.match(/^(\w+)\((.*)\)$/);  // Match function call (e.g., func(1, 2))
    if (!match) return "";  // Return an empty string if the match fails
  
    const [, functionName, args] = match;  // Destructure function name and arguments
  
    if (lang === "javascript") {
      return `${functionName}(${args});`;  // In JavaScript, just call the function
    }
  
    if (lang === "cpp") {
      return `
  auto result = ${functionName}(${args});
  for (auto val : result) std::cout << val << " ";
  std::cout << std::endl;`;  // C++ output with auto and looping through result
    }
  
    // Default for Python
    return `${functionName}(${args})`;  // Just call the function in Python
  };
  

  const handleCodeSubmit = async () => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }
  
    // Build the final code submission by appending all test cases
    const modifiedCode = `${code}\n\n${problem.testCases.map(tc => convertTestCase(tc.input, language)).join("\n")}`;
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/submissions/submit`,
        {
          problemId: id,
          code: modifiedCode,
          language,
          share: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSubmissionResult(response.data);
    } catch (err) {
      console.error("Error submitting code:", err);
    }
  };
  

  if (!problem) return <div>Loading...</div>;

  return (
    <div className={`min-h-screen flex ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} p-6`}>
      {/* Left Side: Problem Details */}
      <div className="w-1/2 pr-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
        <p className="mb-4 whitespace-pre-line">{problem.description}</p>
        <p className="font-semibold">
          Difficulty:{" "}
          <span className={`text-${problem.difficulty === "Hard" ? "red" : problem.difficulty === "Medium" ? "yellow" : "green"}-500`}>
            {problem.difficulty}
          </span>
        </p>
      </div>

      {/* Right Side: Code Editor */}
      <div className="w-1/2 pl-6 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Code Editor</h3>
          <select
            className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <CodeMirror
          value={code}
          height="400px"
          theme={isDarkMode ? "dark" : "light"}
          extensions={[languageExtensions[language]]}
          onChange={(value) => setCode(value)}
        />

        <button
          onClick={handleCodeSubmit}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 self-start"
        >
          Submit Code
        </button>

        {submissionResult && (
          <div className="mt-6">
            <h4 className="text-xl">Submission Result</h4>
            <p>Status: {submissionResult.status}</p>
            <ul>
              {submissionResult.results.map((result, index) => (
                <li key={index}>
                  <strong>Test Case {index + 1}:</strong>
                  {result.passed ? (
                    <span className="text-green-500"> Passed</span>
                  ) : (
                    <>
                      <span className="text-red-500"> Failed</span>
                      <br />
                      <span className="text-gray-500">
                        Expected: {result.expected} <br />
                        Output: {result.output}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDetail;
