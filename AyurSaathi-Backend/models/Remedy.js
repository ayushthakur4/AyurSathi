const mongoose = require('mongoose');

const remedySchema = new mongoose.Schema({
  diseaseName: { type: String, required: true, lowercase: true },
  healthTip: String,
  ayurvedicAnalysis: String, // New field for the "thinking" aspect
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
      duration: String,
      imageKeyword: String, // For Unsplash
      youtubeSearchQuery: String // For YouTube link
    }
  ],
  doctorAdvice: String
}, { timestamps: true });

module.exports = mongoose.model('Remedy', remedySchema);
