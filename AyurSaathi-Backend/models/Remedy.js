const mongoose = require('mongoose');

const remedySchema = new mongoose.Schema({
  diseaseName: { type: String, required: true, lowercase: true },
  healthTip: String,
  homeRemedies: [
    {
      remedyName: String,
      ingredients: [String],
      preparationSteps: [String]
    }
  ],
  yoga: [
    {
      asanaName: String,
      howToDo: [String],
      duration: String
    }
  ],
  doctorAdvice: String
}, { timestamps: true });

module.exports = mongoose.model('Remedy', remedySchema);
