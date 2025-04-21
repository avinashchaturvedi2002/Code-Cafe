require('dotenv').config();
const axios = require('axios');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

// Create a submission for a problem
const submitSolution = async (req, res) => {
  const { problemId, code, language } = req.body;
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
    });

    await submission.save();

    const result = await evaluateCode(submission, problem);

    submission.status = result.status;
    submission.results = result.results;
    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Evaluate the code against the test cases
const evaluateCode = async (submission, problem) => {
  let status = 'Passed';
  const results = [];

  for (const testCase of problem.testCases) {
    const wrappedCode = `${submission.code}\n${testCase.input}`; // No need to add another print statement
    const output = await executeCode(wrappedCode, '', submission.language);

    const passed = output.trim() === testCase.output.trim();

    results.push({
      input: testCase.input,
      expected: testCase.output,
      output: output,
      passed: passed,
    });

    if (!passed) {
      status = 'Failed';
    }
  }

  return { status, results };
};

// Function to execute code using Judge0
const executeCode = async (code, input, language) => {
  try {
    // Step 1: Submit the code to Judge0
    const judge0URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false';
    const payload = {
      source_code: code,
      stdin: input,
      language_id: mapLanguageToJudge0(language),
    };

    const submissionResponse = await axios.post(judge0URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });

    // The response contains a submission ID
    const submissionId = submissionResponse.data.token;
    console.log('Submission ID:', submissionId);

    // Step 2: Check the status of the submission until it is complete
    let statusResponse = await checkSubmissionStatus(submissionId);

    // Step 3: Once the submission is completed, return the output or error
    return statusResponse.stdout || statusResponse.stderr || 'No Output';
  } catch (error) {
    console.error('Execution error:', error.response?.data || error.message);
    return 'Error during code execution';
  }
};

// Function to check the status of the submission
const checkSubmissionStatus = async (submissionId) => {
  const judge0URL = `https://judge0-ce.p.rapidapi.com/submissions/${submissionId}`;

  try {
    const statusResponse = await axios.get(judge0URL, {
      headers: {
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });

    // If submission status is 'completed', return the result
    if (statusResponse.data.status.id === 3) {
      return statusResponse.data;
    }

    // If the submission is still processing, wait and try again
    console.log('Still processing, retrying...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
    return checkSubmissionStatus(submissionId); // Retry
  } catch (error) {
    console.error('Error while checking submission status:', error.response?.data || error.message);
    throw new Error('Error while checking submission status');
  }
};

// Map user-friendly language to Judge0 language IDs
const mapLanguageToJudge0 = (language) => {
  const languageMap = {
    'JavaScript': 63,
    'Python': 71,
    'C++': 54,
    'Java': 62,
    // Add more as needed
  };

  return languageMap[language] || 63; // Default to JavaScript
};

module.exports = { submitSolution };
