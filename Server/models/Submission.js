const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Passed', 'Failed'],
    default: 'Pending',
  },
  results: [
    {
      input: String,
      expected: String,
      output: String,
      passed: Boolean,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
