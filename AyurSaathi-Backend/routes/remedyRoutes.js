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
      { asanaName: 'Bhujangasana', howToDo: ['Lie face down', 'Place palms under shoulders', 'Press up lifting chest', 'Hold 15-30 seconds'], duration: '5-10 min', imageKeyword: 'cobra pose yoga', youtubeSearchQuery: 'Bhujangasana cobra pose yoga tutorial' },
      { asanaName: 'Kapalabhati', howToDo: ['Sit comfortably', 'Inhale deeply', 'Exhale forcefully through nose', 'Repeat 20-30 times'], duration: '2-3 min', imageKeyword: 'kapalabhati pranayama breathing', youtubeSearchQuery: 'Kapalabhati pranayama breathing exercise tutorial' }
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
      { asanaName: 'Shavasana', howToDo: ['Lie flat on back', 'Close eyes', 'Relax all muscles', 'Breathe naturally'], duration: '15-20 min', imageKeyword: 'shavasana corpse pose', youtubeSearchQuery: 'Shavasana corpse pose yoga tutorial' }
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
        duration: '5-10 min',
        imageKeyword: 'alternate nostril breathing yoga',
        youtubeSearchQuery: 'Nadi Shodhana alternate nostril breathing tutorial'
      }
    ],
    doctorAdvice: 'Consult a doctor for persistent or severe headaches.'
  }
};

// Helper: delay for retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateAIResponse = async (disease, retries = 3) => {
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
      "duration": "recommended duration",
      "imageKeyword": "short 2-3 word English keyword for this yoga pose suitable for image search e.g. cobra pose yoga",
      "youtubeSearchQuery": "YouTube search query for this yoga pose e.g. Bhujangasana cobra pose yoga tutorial"
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
      if (attempt < retries && (err.message.includes('429') || err.message.includes('retry') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('overloaded'))) {
        const waitTime = (attempt + 1) * 10000; // 10s, 20s, 30s
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
  'cold & flu': {
    diseaseName: 'cold & flu',
    healthTip: 'Stay warm, drink warm fluids like kadha and ginger tea. Avoid cold foods and get adequate rest.',
    homeRemedies: [
      {
        remedyName: 'Ayurvedic Kadha',
        ingredients: ['4-5 tulsi leaves', '1 inch ginger', '5 black peppercorns', '2 cloves', '1/2 tsp turmeric', '1 cinnamon stick', '2 cups water', 'Honey to taste'],
        preparationSteps: ['Boil water with all spices and tulsi', 'Simmer on low heat for 10 minutes', 'Strain into a cup', 'Add honey when slightly cooled', 'Drink warm, 2-3 times daily']
      },
      {
        remedyName: 'Steam Inhalation with Eucalyptus',
        ingredients: ['Hot water', '3-4 drops eucalyptus oil', 'Towel'],
        preparationSteps: ['Boil water and pour into a bowl', 'Add eucalyptus oil', 'Cover head with towel and inhale steam', 'Do for 5-10 minutes', 'Repeat 2-3 times daily']
      }
    ],
    yoga: [
      { asanaName: 'Bhujangasana (Cobra Pose)', howToDo: ['Lie face down on mat', 'Place palms under shoulders', 'Inhale and press up, lifting chest', 'Keep elbows slightly bent', 'Hold for 15-30 seconds'], duration: '5-10 min', imageKeyword: 'cobra pose yoga', youtubeSearchQuery: 'Bhujangasana cobra pose yoga tutorial' },
      { asanaName: 'Kapalabhati Pranayama', howToDo: ['Sit in comfortable position with straight spine', 'Take a deep breath in', 'Exhale forcefully through nose, pulling navel in', 'Let inhalation happen passively', 'Start with 20 rounds, increase gradually'], duration: '3-5 min', imageKeyword: 'kapalabhati pranayama breathing', youtubeSearchQuery: 'Kapalabhati pranayama breathing exercise tutorial' }
    ],
    doctorAdvice: 'Consult a doctor if fever exceeds 102°F, symptoms persist beyond 7 days, or you experience difficulty breathing.'
  },
  stress: {
    diseaseName: 'stress',
    healthTip: 'Follow a regular daily routine (Dinacharya). Practice mindfulness, limit screen time before bed, and include calming herbs in your diet.',
    homeRemedies: [
      {
        remedyName: 'Ashwagandha Milk',
        ingredients: ['1 cup warm milk', '1/2 tsp ashwagandha powder', '1/4 tsp cardamom powder', '1 tsp honey'],
        preparationSteps: ['Warm the milk on low heat', 'Add ashwagandha and cardamom powder', 'Stir well for 2 minutes', 'Remove from heat and add honey', 'Drink before bedtime for best results']
      },
      {
        remedyName: 'Brahmi Tea',
        ingredients: ['1 tsp dried brahmi leaves', '1 cup hot water', 'Honey to taste', 'Lemon (optional)'],
        preparationSteps: ['Boil water and add brahmi leaves', 'Steep for 5-7 minutes', 'Strain and add honey', 'Drink 1-2 cups daily for sustained benefits']
      },
      {
        remedyName: 'Jatamansi Relaxation Oil',
        ingredients: ['2 tbsp sesame oil', '5 drops jatamansi essential oil'],
        preparationSteps: ['Mix oils together', 'Warm slightly between palms', 'Massage gently on temples and forehead', 'Leave on for 20 minutes or overnight', 'Wash off with mild shampoo']
      }
    ],
    yoga: [
      { asanaName: 'Balasana (Child Pose)', howToDo: ['Kneel on mat with big toes touching', 'Sit back on heels', 'Bend forward, extending arms ahead', 'Rest forehead on mat', 'Breathe deeply, hold for 1-3 minutes'], duration: '5-10 min', imageKeyword: 'child pose yoga', youtubeSearchQuery: 'Balasana child pose yoga tutorial' },
      { asanaName: 'Nadi Shodhana (Alternate Nostril Breathing)', howToDo: ['Sit comfortably with spine straight', 'Close right nostril with thumb', 'Inhale through left nostril for 4 counts', 'Close left nostril, open right', 'Exhale through right for 4 counts', 'Inhale right, exhale left — one cycle'], duration: '5-10 min', imageKeyword: 'alternate nostril breathing yoga', youtubeSearchQuery: 'Nadi Shodhana alternate nostril breathing tutorial' },
      { asanaName: 'Shavasana (Corpse Pose)', howToDo: ['Lie flat on back', 'Arms at sides, palms up', 'Close eyes and relax every body part', 'Focus on slow deep breathing', 'Stay for at least 5 minutes'], duration: '10-15 min', imageKeyword: 'shavasana corpse pose', youtubeSearchQuery: 'Shavasana corpse pose yoga tutorial' }
    ],
    doctorAdvice: 'If stress is accompanied by persistent anxiety, insomnia, chest pain, or depression lasting more than 2 weeks, seek professional mental health support.'
  },
  digestion: {
    diseaseName: 'digestion',
    healthTip: 'Eat warm, freshly cooked food. Avoid cold drinks during meals. Chew food thoroughly and eat at regular times.',
    homeRemedies: [
      {
        remedyName: 'Jeera (Cumin) Water',
        ingredients: ['1 tsp cumin seeds', '1 glass water'],
        preparationSteps: ['Soak cumin seeds in water overnight', 'Alternatively, boil cumin in water for 5 minutes', 'Strain and drink on empty stomach', 'Can add a pinch of rock salt for taste']
      },
      {
        remedyName: 'Ajwain & Ginger Remedy',
        ingredients: ['1/2 tsp ajwain (carom seeds)', '1/2 inch fresh ginger', 'Pinch of rock salt', '1 cup warm water'],
        preparationSteps: ['Crush ajwain lightly', 'Grate the ginger', 'Add both to warm water with rock salt', 'Mix well and drink after heavy meals']
      },
      {
        remedyName: 'Triphala Drink',
        ingredients: ['1/2 tsp triphala powder', '1 cup warm water', 'Honey (optional)'],
        preparationSteps: ['Mix triphala powder in warm water', 'Stir well until dissolved', 'Add honey if needed', 'Drink before bedtime for best results']
      }
    ],
    yoga: [
      { asanaName: 'Vajrasana (Thunderbolt Pose)', howToDo: ['Kneel on mat', 'Sit back on your heels', 'Keep spine straight, hands on thighs', 'Breathe normally', 'Sit for 5-10 minutes after meals'], duration: '5-10 min', imageKeyword: 'vajrasana thunderbolt pose', youtubeSearchQuery: 'Vajrasana thunderbolt pose yoga tutorial' },
      { asanaName: 'Pawanmuktasana (Wind-Relieving Pose)', howToDo: ['Lie on back', 'Bring right knee to chest', 'Clasp hands around knee and press', 'Lift head towards knee', 'Hold 15-30 seconds, switch legs'], duration: '5 min', imageKeyword: 'wind relieving pose yoga', youtubeSearchQuery: 'Pawanmuktasana wind relieving pose yoga tutorial' }
    ],
    doctorAdvice: 'Consult a gastroenterologist if you experience persistent bloating, blood in stool, unexplained weight loss, or severe abdominal pain.'
  },
  'back pain': {
    diseaseName: 'back pain',
    healthTip: 'Maintain good posture. Avoid sitting for long periods. Sleep on a firm mattress and apply warm sesame oil to the affected area.',
    homeRemedies: [
      {
        remedyName: 'Warm Sesame Oil Massage',
        ingredients: ['3 tbsp sesame oil', '1/4 tsp camphor (optional)', 'Hot water bag'],
        preparationSteps: ['Warm the sesame oil slightly', 'Add camphor if using', 'Massage gently on the lower back in circular motions', 'Apply for 15-20 minutes', 'Follow with a hot water bag compress']
      },
      {
        remedyName: 'Turmeric & Ginger Anti-inflammatory Paste',
        ingredients: ['1 tsp turmeric powder', '1/2 tsp ginger powder', 'Warm water to make paste'],
        preparationSteps: ['Mix turmeric and ginger powder', 'Add warm water to make a thick paste', 'Apply on the painful area', 'Cover with a warm cloth', 'Leave for 20-30 minutes, then wash']
      }
    ],
    yoga: [
      { asanaName: 'Marjariasana (Cat-Cow Pose)', howToDo: ['Get on hands and knees (tabletop position)', 'Inhale: drop belly, lift head (cow)', 'Exhale: round spine, tuck chin (cat)', 'Move slowly with breath', 'Repeat 10-15 times'], duration: '5 min', imageKeyword: 'cat cow pose yoga', youtubeSearchQuery: 'Marjariasana cat cow pose yoga tutorial' },
      { asanaName: 'Bhujangasana (Cobra Pose)', howToDo: ['Lie face down', 'Place palms beside chest', 'Inhale and slowly lift upper body', 'Keep elbows slightly bent', 'Hold for 15-30 seconds'], duration: '5 min', imageKeyword: 'cobra pose yoga', youtubeSearchQuery: 'Bhujangasana cobra pose yoga tutorial' },
      { asanaName: 'Setu Bandhasana (Bridge Pose)', howToDo: ['Lie on back, bend knees', 'Place feet hip-width apart', 'Press feet down, lift hips up', 'Clasp hands under body', 'Hold for 30 seconds to 1 minute'], duration: '5 min', imageKeyword: 'bridge pose yoga', youtubeSearchQuery: 'Setu Bandhasana bridge pose yoga tutorial' }
    ],
    doctorAdvice: 'See a doctor if back pain is accompanied by numbness in legs, loss of bladder control, or persists beyond 2 weeks despite rest.'
  },
  insomnia: {
    diseaseName: 'insomnia',
    healthTip: 'Follow a fixed sleep schedule. Avoid screens 1 hour before bed. Massage warm oil on the soles of your feet before sleeping.',
    homeRemedies: [
      {
        remedyName: 'Warm Nutmeg Milk',
        ingredients: ['1 cup warm milk', '1/4 tsp nutmeg powder', '1/2 tsp honey'],
        preparationSteps: ['Warm the milk', 'Add nutmeg powder and stir well', 'Add honey when slightly cooled', 'Drink 30 minutes before bedtime']
      },
      {
        remedyName: 'Shankhpushpi Syrup',
        ingredients: ['1 tsp shankhpushpi powder', '1 cup warm water or milk'],
        preparationSteps: ['Mix shankhpushpi in warm water or milk', 'Stir well and drink', 'Take every evening, 1 hour before sleep']
      },
      {
        remedyName: 'Foot Oil Massage (Padabhyanga)',
        ingredients: ['2 tbsp warm sesame oil or ghee'],
        preparationSteps: ['Warm the oil slightly', 'Massage each foot sole for 5 minutes', 'Focus on the center of the sole', 'Wear cotton socks after massage', 'Do this every night before sleep']
      }
    ],
    yoga: [
      { asanaName: 'Viparita Karani (Legs Up the Wall)', howToDo: ['Sit with one side against a wall', 'Swing legs up the wall as you lie back', 'Rest arms at sides', 'Close eyes and breathe deeply', 'Stay for 5-10 minutes'], duration: '5-10 min', imageKeyword: 'legs up wall pose yoga', youtubeSearchQuery: 'Viparita Karani legs up the wall pose yoga tutorial' },
      { asanaName: 'Yoga Nidra (Yogic Sleep)', howToDo: ['Lie in Shavasana position', 'Close eyes, relax body part by part', 'Follow guided body scan meditation', 'Maintain awareness while deeply relaxed', 'Practice for 15-20 minutes'], duration: '15-20 min', imageKeyword: 'yoga nidra relaxation', youtubeSearchQuery: 'Yoga Nidra guided yogic sleep meditation' }
    ],
    doctorAdvice: 'Consult a sleep specialist if insomnia persists for more than 3 weeks, or if you experience daytime fatigue affecting daily activities.'
  },
  'skin care': {
    diseaseName: 'skin care',
    healthTip: 'Drink plenty of water. Eat fresh fruits and vegetables. Avoid processed foods and excessive sugar. Apply aloe vera regularly.',
    homeRemedies: [
      {
        remedyName: 'Turmeric & Sandalwood Face Pack',
        ingredients: ['1 tsp turmeric powder', '1 tsp sandalwood powder', '2 tsp rose water', '1/2 tsp honey'],
        preparationSteps: ['Mix turmeric and sandalwood powder', 'Add rose water to make a smooth paste', 'Add honey and mix well', 'Apply evenly on face, avoid eye area', 'Leave for 15-20 minutes', 'Wash with cool water']
      },
      {
        remedyName: 'Aloe Vera & Neem Gel',
        ingredients: ['2 tbsp fresh aloe vera gel', '5-6 crushed neem leaves', 'Few drops lemon juice'],
        preparationSteps: ['Extract fresh aloe vera gel', 'Crush neem leaves and extract juice', 'Mix aloe gel with neem juice and lemon', 'Apply on affected areas', 'Leave for 20 minutes, wash off']
      }
    ],
    yoga: [
      { asanaName: 'Sarvangasana (Shoulder Stand)', howToDo: ['Lie on back', 'Lift legs and hips overhead', 'Support back with hands', 'Keep body straight', 'Hold for 30 seconds to 2 minutes'], duration: '3-5 min', imageKeyword: 'shoulder stand yoga pose', youtubeSearchQuery: 'Sarvangasana shoulder stand yoga tutorial' },
      { asanaName: 'Matsyasana (Fish Pose)', howToDo: ['Lie on back', 'Place hands under hips', 'Lift chest and arch back', 'Rest crown of head on floor', 'Hold for 15-30 seconds'], duration: '3-5 min', imageKeyword: 'fish pose yoga', youtubeSearchQuery: 'Matsyasana fish pose yoga tutorial' }
    ],
    doctorAdvice: 'Consult a dermatologist for persistent skin issues, rashes that spread, or skin conditions not improving with home remedies after 2 weeks.'
  },
  'joint pain': {
    diseaseName: 'joint pain',
    healthTip: 'Keep joints warm. Apply warm mustard or sesame oil daily. Include anti-inflammatory foods like turmeric, ginger, and garlic in your diet.',
    homeRemedies: [
      {
        remedyName: 'Nirgundi Oil Massage',
        ingredients: ['3 tbsp nirgundi (vitex) oil', 'or 2 tbsp mustard oil with 1/4 tsp ajwain'],
        preparationSteps: ['Warm the oil slightly', 'Massage on affected joints in circular motion', 'Apply gentle pressure for 10-15 minutes', 'Cover with warm cloth after massage', 'Do this morning and evening']
      },
      {
        remedyName: 'Turmeric Golden Paste',
        ingredients: ['1/2 cup turmeric powder', '1 cup water', '1/3 cup coconut oil', '1 tsp black pepper'],
        preparationSteps: ['Cook turmeric and water on low heat, stirring until it forms a paste', 'Add coconut oil and black pepper', 'Mix well and cool', 'Store in glass jar in fridge', 'Take 1/2 tsp with warm milk daily']
      },
      {
        remedyName: 'Fenugreek Seed Water',
        ingredients: ['1 tsp fenugreek (methi) seeds', '1 glass water'],
        preparationSteps: ['Soak fenugreek seeds in water overnight', 'Strain and drink the water in the morning', 'You can chew the soaked seeds too', 'Repeat daily for best results']
      }
    ],
    yoga: [
      { asanaName: 'Trikonasana (Triangle Pose)', howToDo: ['Stand with feet wide apart', 'Turn right foot out 90 degrees', 'Extend arms at shoulder height', 'Bend to the right, touch right ankle', 'Look up at left hand, hold 30 seconds'], duration: '5 min', imageKeyword: 'triangle pose yoga', youtubeSearchQuery: 'Trikonasana triangle pose yoga tutorial' },
      { asanaName: 'Virabhadrasana (Warrior Pose)', howToDo: ['Stand with feet 3-4 feet apart', 'Turn right foot out, bend right knee', 'Keep left leg straight', 'Raise arms overhead', 'Hold for 30 seconds, switch sides'], duration: '5-10 min', imageKeyword: 'warrior pose yoga', youtubeSearchQuery: 'Virabhadrasana warrior pose yoga tutorial' }
    ],
    doctorAdvice: 'Consult an orthopedic specialist if joint pain is severe, accompanied by swelling, redness, or limits your mobility significantly.'
  },
  cough: {
    diseaseName: 'cough',
    healthTip: 'Keep your throat moist. Avoid cold water and dairy products at night. Gargle with warm salt water.',
    homeRemedies: [
      {
        remedyName: 'Honey & Black Pepper',
        ingredients: ['1 tbsp raw honey', '1/4 tsp freshly ground black pepper'],
        preparationSteps: ['Mix honey with black pepper', 'Take 1 teaspoon slowly, letting it coat the throat', 'Repeat 2-3 times daily', 'Best taken on empty stomach']
      },
      {
        remedyName: 'Mulethi (Licorice) Decoction',
        ingredients: ['1 small stick mulethi', '1 cup water', '1/2 tsp honey'],
        preparationSteps: ['Break mulethi into small pieces', 'Boil in water for 10 minutes', 'Strain and cool slightly', 'Add honey and sip slowly']
      }
    ],
    yoga: [
      { asanaName: 'Simhasana (Lion Pose)', howToDo: ['Kneel and sit on heels', 'Place palms on knees', 'Open mouth wide, stick tongue out', 'Exhale with a roaring sound', 'Repeat 5-6 times'], duration: '3-5 min', imageKeyword: 'lion pose yoga', youtubeSearchQuery: 'Simhasana lion pose yoga tutorial' },
      { asanaName: 'Ustrasana (Camel Pose)', howToDo: ['Kneel on mat, knees hip-width apart', 'Place hands on lower back', 'Slowly arch backwards', 'Reach for heels if comfortable', 'Hold 15-30 seconds'], duration: '3-5 min', imageKeyword: 'camel pose yoga', youtubeSearchQuery: 'Ustrasana camel pose yoga tutorial' }
    ],
    doctorAdvice: 'See a doctor if cough persists for more than 2 weeks, produces blood, or is accompanied by chest pain.'
  },
  acne: {
    diseaseName: 'acne',
    healthTip: 'Keep face clean, avoid oily and spicy foods, drink plenty of water, and never pop pimples.',
    homeRemedies: [
      {
        remedyName: 'Neem & Turmeric Paste',
        ingredients: ['Fresh neem leaves (handful)', '1/4 tsp turmeric', 'Rose water'],
        preparationSteps: ['Grind neem leaves into paste', 'Mix with turmeric and rose water', 'Apply on affected areas', 'Leave for 20 minutes', 'Wash with cool water']
      }
    ],
    yoga: [
      { asanaName: 'Sarvangasana (Shoulder Stand)', howToDo: ['Lie on back', 'Lift legs overhead with hand support on lower back', 'Keep body straight and hold', 'Improves blood circulation to face'], duration: '2-5 min', imageKeyword: 'shoulder stand yoga pose', youtubeSearchQuery: 'Sarvangasana shoulder stand yoga tutorial' }
    ],
    doctorAdvice: 'Consult a dermatologist for severe or cystic acne, or if over-the-counter remedies do not work after 4-6 weeks.'
  },
  anxiety: {
    diseaseName: 'anxiety',
    healthTip: 'Practice mindfulness daily. Reduce caffeine intake. Maintain a regular sleep schedule and spend time in nature.',
    homeRemedies: [
      {
        remedyName: 'Ashwagandha & Chamomile Tea',
        ingredients: ['1/2 tsp ashwagandha powder', '1 chamomile tea bag', '1 cup hot water', 'Honey'],
        preparationSteps: ['Steep chamomile bag in hot water for 5 mins', 'Add ashwagandha powder and stir', 'Add honey to taste', 'Drink warm in the evening']
      }
    ],
    yoga: [
      { asanaName: 'Balasana (Child Pose)', howToDo: ['Kneel on mat', 'Bend forward, extending arms', 'Rest forehead on mat', 'Breathe deeply for 1-3 minutes'], duration: '5-10 min', imageKeyword: 'child pose yoga', youtubeSearchQuery: 'Balasana child pose yoga tutorial' },
      { asanaName: 'Anulom Vilom (Alternate Nostril Breathing)', howToDo: ['Sit comfortably', 'Close right nostril, inhale left', 'Close left, exhale right', 'Inhale right, exhale left', 'Repeat for 10-15 cycles'], duration: '5-10 min', imageKeyword: 'anulom vilom pranayama', youtubeSearchQuery: 'Anulom Vilom alternate nostril breathing tutorial' }
    ],
    doctorAdvice: 'Professional therapy is recommended for chronic anxiety. Seek immediate help if anxiety causes panic attacks or interferes with daily life.'
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
        { asanaName: 'Pranayama (Deep Breathing)', howToDo: ['Sit comfortably with spine straight', 'Inhale deeply through nose for 4 counts', 'Hold for 4 counts', 'Exhale slowly for 6 counts', 'Repeat 10 times'], duration: '5-10 min', imageKeyword: 'pranayama deep breathing', youtubeSearchQuery: 'Pranayama deep breathing exercise tutorial' },
        { asanaName: 'Shavasana (Corpse Pose)', howToDo: ['Lie flat on back', 'Close eyes', 'Relax every muscle', 'Breathe naturally'], duration: '10-15 min', imageKeyword: 'shavasana corpse pose', youtubeSearchQuery: 'Shavasana corpse pose yoga tutorial' }
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
