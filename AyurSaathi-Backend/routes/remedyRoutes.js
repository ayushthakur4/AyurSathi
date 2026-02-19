const express = require("express");
const router = express.Router();
const Remedy = require("../models/Remedy");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MOCK_RESPONSES, FALLBACK_MOCK_RESPONSES } = require("../data/mockRemedies");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const remediesCache = {};

// wait for retry
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// valid languages
const LANG_NAMES = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu', ta: 'Tamil',
  mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam',
  pa: 'Punjabi', or: 'Odia', ur: 'Urdu', as: 'Assamese', sa: 'Sanskrit',
};

const generateAIResponse = async (disease, lang = 'en', retries = 3) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const langName = LANG_NAMES[lang] || 'English';
  console.log(`asking gemini in ${langName}`);

  const langInstruction = lang !== 'en'
    ? `IMPORTANT: Write ALL text values in ${langName} script/language. Only keep JSON keys, imageKeyword, and youtubeSearchQuery in English.`
    : '';

  const prompt = `Act as an Ayurvedic expert. Provide a JSON response for condition: "${disease}".
${langInstruction}
Schema:
{
  "diseaseName": "${disease}",
  "ayurvedicAnalysis": "Dosha imbalance explanation (2 sentences)",
  "healthTip": "Actionable tip",
  "homeRemedies": [{"remedyName": "", "ingredients": [], "preparationSteps": []}],
  "yoga": [{"asanaName": "", "howToDo": [], "duration": "", "imageKeyword": "2-3 word English visual keyword", "youtubeSearchQuery": "search query"}],
  "doctorAdvice": "When to see a doctor"
}
Keep it concise and authentic.`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();

      // Clean up markdown formatting if present
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(text);

      // Validate the response has the required fields
      if (
        !parsed.healthTip ||
        !parsed.homeRemedies ||
        !parsed.yoga ||
        !parsed.doctorAdvice ||
        !parsed.ayurvedicAnalysis
      ) {
        throw new Error("Incomplete AI response - missing required fields");
      }

      console.log("got response from ai");
      return parsed;
    } catch (err) {
      console.error(`gemini failed attempt ${attempt + 1}:`, err.message);

      // Log safety ratings or other details if available
      if (err.response && err.response.promptFeedback) {
        console.error("Safety Ratings:", JSON.stringify(err.response.promptFeedback, null, 2));
      }

      if (
        attempt < retries &&
        (err.message.includes("429") ||
          err.message.includes("retry") ||
          err.message.includes("RESOURCE_EXHAUSTED") ||
          err.message.includes("overloaded"))
      ) {
        const waitTime = (attempt + 1) * 10000; // 10s, 20s, 30s
        console.log("rate limit hit, waiting...");
        await delay(waitTime);
      } else {
        throw err;
      }
    }
  }
};

router.get("/:disease", async (req, res) => {
  try {
    const disease = req.params.disease.toLowerCase().trim();
    const lang = (req.query.lang || 'en').toLowerCase().trim();
    console.log(`searching for ${disease} in ${lang}`);
    const cacheKey = `${disease}_${lang}`;

    // check cache
    if (remediesCache[cacheKey]) {
      console.log("found in cache");
      return res.json(remediesCache[cacheKey]);
    }

    // check database for english only
    if (lang === 'en') {
      try {
        let remedy = await Remedy.findOne({ diseaseName: disease });
        if (remedy) {
          console.log("found in db");
          remediesCache[cacheKey] = remedy;
          return res.json(remedy);
        }
      } catch (dbError) {
        console.warn("db read error:", dbError.message);
      }
    }

    // try ai generation
    if (
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
    ) {
      try {
        console.log(`querying ai for ${disease}`);
        const aiResponse = await generateAIResponse(disease, lang);
        aiResponse.diseaseName = disease;

        // save to db for later
        (async () => {
          try {
            const newRemedy = new Remedy(aiResponse);
            await newRemedy.save();
            console.log("saved to db");
          } catch (saveErr) {
            console.error(
              "db save failed:",
              saveErr.message,
            );
          }
        })();

        // Cache it
        remediesCache[cacheKey] = aiResponse;

        return res.json(aiResponse);
      } catch (aiError) {
        console.error("Gemini AI failed:", aiError.message);
        return res.status(500).json({ error: "AI Generation failed and mock data is disabled." });
        // fallback to mock data
      }
    } else {
      console.log("No valid GEMINI_API_KEY configured");
      return res.status(500).json({ error: "No API Key configured." });
    }

    // fallback to mock data
    console.log("ai failed, using mock data");
    if (FALLBACK_MOCK_RESPONSES[disease]) {
      console.log("using mock response for " + disease);
      return res.json(FALLBACK_MOCK_RESPONSES[disease]);
    }

    // generic fallback
    console.log("using generic fallback");
    const fallbackResponse = {
      diseaseName: disease,
      healthTip:
        "Rest, stay hydrated, and eat light nutritious food. Practice deep breathing exercises.",
      homeRemedies: [
        {
          remedyName: "Warm Water & Rest",
          ingredients: ["Warm water", "Honey (optional)", "Lemon (optional)"],
          preparationSteps: [
            "Drink warm water throughout the day",
            "Add honey and lemon for taste",
            "Sleep at least 8 hours",
          ],
        },
      ],
      yoga: [
        {
          asanaName: "Pranayama (Deep Breathing)",
          howToDo: [
            "Sit comfortably with spine straight",
            "Inhale deeply through nose for 4 counts",
            "Hold for 4 counts",
            "Exhale slowly for 6 counts",
            "Repeat 10 times",
          ],
          duration: "5-10 min",
          imageKeyword: "pranayama deep breathing",
          youtubeSearchQuery: "Pranayama deep breathing exercise tutorial",
        },
        {
          asanaName: "Shavasana (Corpse Pose)",
          howToDo: [
            "Lie flat on back",
            "Close eyes",
            "Relax every muscle",
            "Breathe naturally",
          ],
          duration: "10-15 min",
          imageKeyword: "shavasana corpse pose",
          youtubeSearchQuery: "Shavasana corpse pose yoga tutorial",
        },
      ],
      doctorAdvice:
        "Consult a doctor if symptoms persist for more than 3 days or worsen.",
    };

    res.json(fallbackResponse);
  } catch (error) {
    console.error("server error:", error.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
