require('dotenv').config();
const axios = require('axios');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Feed = require('../models/Feed');  // Assuming the Feed model exists

// Create a submission for a problem
const submitSolution = async (req, res) => {
  const { problemId, code, language, share } = req.body;  // Added 'share' field to body
  const user = req.user.id;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const submission = new Submission({
      problem: problemId,
      user,
      code,
      language,
      status: 'Pending',
      difficulty:problem.difficulty,
      shared: share || false,  // Set the shared field based on request
    });
    console.log(submission.language);

    await submission.save();

    const result = await evaluateCode(submission, problem);

    submission.status = result.status;
    submission.results = result.results;
    await submission.save();

    // If the submission is passed and the user wants to share, create a post
    if (submission.status === 'Passed' && submission.shared) {
      const post = new Feed({
        user: user,
        content: `I solved the problem: ${problem.title}!`,
        submission: submission._id,
        likes: [],
        comments: [],
      });

      await post.save();
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to evaluate the code against test cases
const evaluateCode = async (submission,problem) => {
  try {
    console.log(submission);
  
    const result = await executeCode(submission.code, '', submission.language, problem);

    const actualOutputs = result.stdout?.trim().split('\n') || [];
    const results = [];
    let status = 'Passed';

    for (let i = 0; i < problem.testCases.length; i++) {
      const expected = problem.testCases[i].output.trim();
      const actual = actualOutputs[i]?.trim() || '';
      const passed = actual === expected;

      if (!passed) status = 'Failed';

      results.push({
        input: problem.testCases[i].input,
        expected,
        output: actual,
        passed
      });
    }

    return {
      status,
      results
    };

  } catch (err) {
    console.error("Error while checking submission status:", err.message);
    return {
      status: "Error",
      results: [],
      error: err.message
    };
  }
};



// Function to execute code using Judge0
const executeCode = async (code, input, language, problem) => {
  try {
    let finalCode = code;
    console.log(problem);
    if (language.toLowerCase() === "python") {
      const testCaseCalls = problem.testCases
        .map(tc => `print(twoSum(${tc.input.trim()}))`)
        .join("\n");

      finalCode += `\n\n${testCaseCalls}`;
    }

    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: finalCode,
        stdin: input,
        language_id: language === "python" ? 71 : 63, // 71 for Python, 63 for JavaScript
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Error in executeCode:", err);
    throw err;
  }
};








// Function to check the status of the submission
const checkSubmissionStatus = async (submissionId, retries = 20) => {
  const judge0URL = `https://judge0-ce.p.rapidapi.com/submissions/${submissionId}`;

  try {
    const statusResponse = await axios.get(judge0URL, {
      headers: {
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });

    const data = statusResponse.data;
    const statusId = data.status.id;

    console.log('Submission Data:', data); // Added detailed log here

    if (statusId <= 2 && retries > 0) {
      console.log('Still processing, retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return checkSubmissionStatus(submissionId, retries - 1);
    }

    // 🛠️ Handle different error types based on status ID
    switch (statusId) {
      case 3:
        // Accepted
        return data;
      case 6:
        throw new Error(`Compilation Error:\n${data.compile_output}`);
      case 11:
        throw new Error(`Runtime Error:\n${data.stderr}`);
      case 13:
        throw new Error('Time Limit Exceeded');
      default:
        throw new Error(`Error: ${data.status.description}`);
    }

  } catch (error) {
    console.error('Error while checking submission status:', error.message);
    throw new Error('Judge0 error: ' + error.message);
  }
};



// Map user-friendly language to Judge0 language IDs
const mapLanguageToJudge0 = (language) => {
  const normalizedLang = language.toLowerCase();
  const languageMap = {
    'javascript': 63,
    'python': 71,
    'cpp': 54,
    'c++':54,
    'java': 62,
  };

  return languageMap[normalizedLang] || 63; // Default to JavaScript
};


module.exports = { submitSolution };
