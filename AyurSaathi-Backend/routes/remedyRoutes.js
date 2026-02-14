const express = require('express');
const router = express.Router();
const Remedy = require('../models/Remedy');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const remediesCache = {};

const MOCK_RESPONSES = {
  cold: {
    diseaseName: 'cold',
    healthTip: 'Stay warm, drink warm liquids like ginger tea, and get plenty of rest. Avoid cold foods and drinks.',
    homeRemedies: [
      {
        remedyName: 'Ginger Honey Tea',
        ingredients: ['1 inch fresh ginger', '1 tbsp honey', '1 cup hot water', 'Few drops lemon'],
        preparationSteps: ['Boil water', 'Add grated ginger', 'Simmer for 5 minutes', 'Strain and add honey', 'Add lemon drops']
      },
      {
        remedyName: 'Turmeric Milk',
        ingredients: ['1 cup milk', '1/2 tsp turmeric', '1/4 tsp black pepper', '1 tsp honey'],
        preparationSteps: ['Warm the milk', 'Add turmeric and black pepper', 'Mix well', 'Add honey after it cools slightly']
      }
    ],
    yoga: [
      { asanaName: 'Bhujangasana', howToDo: ['Lie face down', 'Place palms under shoulders', 'Press up lifting chest', 'Hold 15-30 seconds'], duration: '5-10 min' },
      { asanaName: 'Kapalabhati', howToDo: ['Sit comfortably', 'Inhale deeply', 'Exhale forcefully through nose', 'Repeat 20-30 times'], duration: '2-3 min' }
    ],
    doctorAdvice: 'Consult a doctor if fever persists beyond 3 days or symptoms worsen.'
  },
  fever: {
    diseaseName: 'fever',
    healthTip: 'Rest, stay hydrated, and keep the room cool. Monitor temperature regularly.',
    homeRemedies: [
      {
        remedyName: 'Tulsi Ginger Tea',
        ingredients: ['10-12 tulsi leaves', '1 inch ginger', '5 black peppers', '1 cup water', 'Honey'],
        preparationSteps: ['Boil water with tulsi, ginger, and black pepper', 'Simmer for 10 minutes', 'Strain and add honey']
      }
    ],
    yoga: [
      { asanaName: 'Shavasana', howToDo: ['Lie flat on back', 'Close eyes', 'Relax all muscles', 'Breathe naturally'], duration: '15-20 min' }
    ],
    doctorAdvice: 'Seek medical attention if fever exceeds 103°F or lasts more than 3 days.'
  },
  headache: {
    diseaseName: 'headache',
    healthTip: 'Rest in a quiet dark room, stay hydrated, and avoid screen time.',
    homeRemedies: [
      {
        remedyName: 'Clove Paste',
        ingredients: ['4-5 cloves', 'Rock salt', 'Banana leaf or cloth'],
        preparationSteps: ['Grind cloves with rock salt', 'Apply paste on forehead', 'Leave for 15-20 minutes']
      }
    ],
    yoga: [
      {
        asanaName: 'Nadi Shodhana',
        howToDo: ['Sit in comfortable pose', 'Close right nostril', 'Inhale through left', 'Close left, exhale through right', 'Alternate nostrils'],
        duration: '5-10 min'
      }
    ],
    doctorAdvice: 'Consult a doctor for persistent or severe headaches.'
  }
};

// Helper: delay for retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateAIResponse = async (disease, retries = 2) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `You are an expert in Ayurveda, Yoga, and traditional Indian wellness practices.

A user is seeking Ayurvedic remedies and holistic wellness advice for: "${disease}"

Provide a comprehensive, authentic response with:
1. A practical health tip specific to this condition
2. At least 2-3 detailed home remedies with full ingredients and step-by-step preparation
3. At least 2 yoga asanas/pranayama exercises that help with this condition, with clear instructions
4. Professional doctor advice about when to seek medical help

Return ONLY valid JSON with this exact schema:
{
  "diseaseName": "${disease}",
  "healthTip": "A specific, actionable health tip for this condition",
  "homeRemedies": [
    {
      "remedyName": "Name of the remedy",
      "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
      "preparationSteps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "yoga": [
    {
      "asanaName": "Name of the asana or pranayama",
      "howToDo": ["Step 1", "Step 2", "Step 3"],
      "duration": "recommended duration"
    }
  ],
  "doctorAdvice": "When to consult a doctor for this condition"
}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      // Validate the response has the required fields
      if (!parsed.healthTip || !parsed.homeRemedies || !parsed.yoga || !parsed.doctorAdvice) {
        throw new Error('Incomplete AI response - missing required fields');
      }

      return parsed;
    } catch (err) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, err.message);
      if (attempt < retries && (err.message.includes('429') || err.message.includes('retry') || err.message.includes('RESOURCE_EXHAUSTED'))) {
        const waitTime = (attempt + 1) * 5000; // 5s, 10s
        console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await delay(waitTime);
      } else {
        throw err;
      }
    }
  }
};

// Mock Data kept ONLY as fallback when AI is unavailable
const FALLBACK_MOCK_RESPONSES = {
  ...MOCK_RESPONSES,
  cough: {
    diseaseName: 'cough',
    healthTip: 'Keep your throat moist. Avoid cold water and dairy products at night.',
    homeRemedies: [
      {
        remedyName: 'Honey and Pepper',
        ingredients: ['1 tbsp honey', '1 pinch black pepper'],
        preparationSteps: ['Mix honey and pepper', 'Lick slowly']
      },
      {
        remedyName: 'Ginger Tea',
        ingredients: ['Ginger', 'Water', 'Honey'],
        preparationSteps: ['Boil ginger in water', 'Strain', 'Add honey']
      }
    ],
    yoga: [
      { asanaName: 'Ustrasana (Camel Pose)', howToDo: ['Kneel on mat', 'Arch back', 'Hold heels'], duration: '3-5 min' }
    ],
    doctorAdvice: 'See a doctor if cough persists for more than 2 weeks.'
  },
  acne: {
    diseaseName: 'acne',
    healthTip: 'Keep face clean, avoid oily foods, and drink plenty of water.',
    homeRemedies: [
      {
        remedyName: 'Neem Paste',
        ingredients: ['Neem leaves', 'Water'],
        preparationSteps: ['Grind neem leaves with water', 'Apply to face', 'Wash after 20 mins']
      }
    ],
    yoga: [
      { asanaName: 'Sarvangasana', howToDo: ['Shoulder stand', 'Keep legs straight up'], duration: '2-5 min' }
    ],
    doctorAdvice: 'Consult a dermatologist for severe acne.'
  },
  anxiety: {
    diseaseName: 'anxiety',
    healthTip: 'Practice mindfulness, reduce caffeine, and maintain a regular sleep schedule.',
    homeRemedies: [
      {
        remedyName: 'Chamomile Tea',
        ingredients: ['Chamomile flowers/bag', 'Hot water'],
        preparationSteps: ['Steep chamomile in hot water for 5 mins', 'Drink warm']
      }
    ],
    yoga: [
      { asanaName: 'Balasana (Child Pose)', howToDo: ['Kneel', 'Bend forward', 'Rest forehead on mat'], duration: '5-10 min' }
    ],
    doctorAdvice: 'Professional therapy is recommended for chronic anxiety.'
  }
};

router.get('/:disease', async (req, res) => {
  try {
    const disease = req.params.disease.toLowerCase().trim();
    console.log('Searching for:', disease);

    // 1. Check in-memory cache first (instant)
    if (remediesCache[disease]) {
      console.log('Found in cache');
      return res.json(remediesCache[disease]);
    }

    // 2. Check MongoDB
    let remedy = await Remedy.findOne({ diseaseName: disease });
    if (remedy) {
      console.log('Found in MongoDB');
      remediesCache[disease] = remedy; // cache it
      return res.json(remedy);
    }

    // 3. Try Gemini AI FIRST (primary source for all diseases)
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        console.log('Querying Gemini AI for:', disease);
        const aiResponse = await generateAIResponse(disease);
        aiResponse.diseaseName = disease;

        // Save to MongoDB for future use
        try {
          const newRemedy = new Remedy(aiResponse);
          await newRemedy.save();
          console.log('Saved AI response to MongoDB');
        } catch (saveErr) {
          console.error('Failed to save to MongoDB (non-fatal):', saveErr.message);
        }

        // Cache it
        remediesCache[disease] = aiResponse;

        return res.json(aiResponse);
      } catch (aiError) {
        console.error('Gemini AI failed:', aiError.message);
        // Fall through to mock fallback
      }
    } else {
      console.log('No valid GEMINI_API_KEY configured');
    }

    // 4. Fallback: Check Mock Data (only used when AI fails)
    if (FALLBACK_MOCK_RESPONSES[disease]) {
      console.log('AI unavailable, returning mock fallback for:', disease);
      return res.json(FALLBACK_MOCK_RESPONSES[disease]);
    }

    // 5. Generic Fallback (when AI fails and no mock data exists)
    console.log('Using generic fallback for:', disease);
    const fallbackResponse = {
      diseaseName: disease,
      healthTip: 'Rest, stay hydrated, and eat light nutritious food. Practice deep breathing exercises.',
      homeRemedies: [
        {
          remedyName: 'Warm Water & Rest',
          ingredients: ['Warm water', 'Honey (optional)', 'Lemon (optional)'],
          preparationSteps: ['Drink warm water throughout the day', 'Add honey and lemon for taste', 'Sleep at least 8 hours']
        }
      ],
      yoga: [
        { asanaName: 'Pranayama (Deep Breathing)', howToDo: ['Sit comfortably with spine straight', 'Inhale deeply through nose for 4 counts', 'Hold for 4 counts', 'Exhale slowly for 6 counts', 'Repeat 10 times'], duration: '5-10 min' },
        { asanaName: 'Shavasana (Corpse Pose)', howToDo: ['Lie flat on back', 'Close eyes', 'Relax every muscle', 'Breathe naturally'], duration: '10-15 min' }
      ],
      doctorAdvice: 'Consult a doctor if symptoms persist for more than 3 days or worsen.'
    };

    res.json(fallbackResponse);

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
