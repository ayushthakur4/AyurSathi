<p align="center">
  <img src="AyurSaathi-App/assets/icon.png" alt="AyurSaathi Logo" width="120" height="120" style="border-radius: 20px;">
</p>

<h1 align="center">🌿 AyurSaathi</h1>
<p align="center"><strong>Ancient Wisdom × Modern Care</strong></p>
<p align="center">An AI-powered Ayurvedic health companion that provides personalized herbal remedies, yoga routines, and wellness advice using the power of Gemini AI.</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.76.5-61DAFB?logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Gemini%20AI-Powered-4285F4?logo=google&logoColor=white" alt="Gemini AI">
</p>

---

## 👨‍💻 Developer

**Ayush Thakur**

---

## 📖 About The Project

**AyurSaathi** (आयुर साथी — "Ayurvedic Companion") is a mobile application that bridges the gap between ancient Ayurvedic knowledge and modern technology. Users describe their health concerns in plain language, and the app leverages **Google Gemini AI** to analyze the condition and provide:

- 🌿 **Herbal Home Remedies** — Step-by-step preparation with ingredient lists
- 🧘 **Yoga & Pranayama Routines** — Personalized asanas with detailed instructions
- 💊 **Health Tips** — Condition-specific lifestyle and dietary advice
- 🏥 **Doctor Guidance** — When to seek professional medical help

The app draws from **5,000+ years of Ayurvedic wisdom** — a holistic system of natural healing recognized by the WHO as traditional medicine — and makes it accessible to everyone through an intuitive, beautifully designed mobile interface.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Describe any health concern in natural language |
| ⚡ **Quick Ailments** | One-tap search for 8 common conditions (Headache, Cold, Stress, etc.) |
| 🤖 **Gemini AI Integration** | AI-generated Ayurvedic treatment plans from Google's Gemini 2.0 Flash |
| 🧪 **Detailed Remedies** | Full ingredient lists with step-by-step preparation instructions |
| 🧘 **Yoga Routines** | Personalized yoga/pranayama with difficulty levels and durations |
| 💾 **Smart Caching** | In-memory + MongoDB caching for instant repeat lookups |
| 🎨 **Premium UI** | Dark theme with glassmorphism, animations, and gradient accents |
| 📴 **Offline Fallback** | Rich local data for common ailments when AI is unavailable |

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
| Technology | Purpose |
|-----------|---------|
| **React Native** (0.76.5) | Cross-platform mobile framework |
| **Expo** (SDK 52) | Development toolchain & build system |
| **React Navigation** (v7) | Screen navigation & routing |
| **Expo Linear Gradient** | Gradient backgrounds & buttons |
| **Expo Blur** | Glassmorphic card effects |
| **Expo Haptics** | Tactile feedback on interactions |
| **Expo Image** | Optimized image rendering |
| **Axios** | HTTP client for API communication |

### Backend (API Server)
| Technology | Purpose |
|-----------|---------|
| **Node.js** + **Express** | REST API server |
| **Google Gemini AI** (2.0 Flash) | AI-powered Ayurvedic content generation |
| **MongoDB** + **Mongoose** | Database for caching AI responses |
| **CORS** | Cross-origin request handling |
| **dotenv** | Environment variable management |

### Deployment
| Service | Purpose |
|---------|---------|
| **Render** | Backend hosting (free tier) |
| **MongoDB Atlas** | Cloud database (free 512MB) |
| **Expo EAS** | Cloud APK builds (free tier) |

---

## 📁 Project Structure

```
AyurSathi/
├── AyurSaathi-App/                 # React Native Frontend
│   ├── App.jsx                     # Root component & navigation setup
│   ├── config.js                   # API URL configuration (local/production)
│   ├── app.json                    # Expo configuration
│   ├── package.json                # Frontend dependencies
│   ├── assets/
│   │   ├── icon.png                # App icon
│   │   └── splash.jpg              # Splash screen
│   └── screens/
│       ├── HomeScreen.jsx          # Landing page with search & quick ailments
│       ├── ResultsScreen.jsx       # Treatment plan display
│       ├── RecipeScreen.jsx        # Detailed remedy preparation
│       └── YogaDetailScreen.jsx    # Yoga pose instructions
│
├── AyurSaathi-Backend/             # Node.js API Backend
│   ├── server.js                   # Express server & MongoDB connection
│   ├── render.yaml                 # Render deployment configuration
│   ├── .env                        # Environment variables (not committed)
│   ├── package.json                # Backend dependencies
│   ├── routes/
│   │   └── remedyRoutes.js         # API routes & Gemini AI integration
│   └── models/
│       └── Remedy.js               # MongoDB schema for remedies
│
└── README.md                       # This file
```

---

## 🖥️ Screens

### 1. Home Screen (Landing Page)
- Animated hero section with pulsing leaf icon
- Glassmorphic search card with gradient button
- Quick ailments grid (8 common conditions with emoji icons)
- Feature highlights (Herbal Remedies, Yoga, Doctor Guidance)
- "How It Works" 3-step timeline
- Ayurveda information section

### 2. Results Screen
- Disease name header with animated badge
- Health tip card
- Doctor advice card with "Important" badge
- Horizontal-scroll yoga cards with image previews
- Home remedies list with ingredient count

### 3. Recipe Screen
- Detailed ingredient list with gradient dots
- Step-by-step preparation with timeline visual
- Ingredient count badge

### 4. Yoga Detail Screen
- Hero image with gradient overlay
- Duration badge
- Step-by-step instructions with connecting timeline

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **npm** or **yarn**
- **Expo Go** app on your phone (for development)
- **MongoDB** (local or Atlas)
- **Gemini API Key** (free from [Google AI Studio](https://aistudio.google.com/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/AyushThakur/AyurSathi.git
cd AyurSathi
```

### 2. Setup Backend
```bash
cd AyurSaathi-Backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ayursaathi
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:
```bash
npm start
```
> Server will run on `http://localhost:5000`

### 3. Setup Frontend
```bash
cd AyurSaathi-App
npm install
```

Update `config.js` with your machine's IP:
```javascript
const LOCAL_IP = 'YOUR_MACHINE_IP'; // Find via ipconfig/ifconfig
```

Start the app:
```bash
npx expo start
```
> Scan QR code with Expo Go to open on your phone

---

## 🔌 API Reference

### Base URL
```
http://localhost:5000/api/remedies
```

### Endpoints

#### `GET /api/remedies/:disease`

Returns an Ayurvedic treatment plan for the specified condition.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `disease` | `string` | Health condition name (e.g., "headache", "stress") |

**Response Schema:**
```json
{
  "diseaseName": "headache",
  "healthTip": "Rest in a quiet dark room...",
  "homeRemedies": [
    {
      "remedyName": "Clove Paste",
      "ingredients": ["4-5 cloves", "Rock salt"],
      "preparationSteps": ["Grind cloves...", "Apply paste..."]
    }
  ],
  "yoga": [
    {
      "asanaName": "Nadi Shodhana",
      "howToDo": ["Sit comfortably...", "Close right nostril..."],
      "duration": "5-10 min"
    }
  ],
  "doctorAdvice": "Consult a doctor for persistent headaches."
}
```

**Data Resolution Order:**
1. In-memory cache (instant)
2. MongoDB database
3. Gemini AI generation (live)
4. Fallback mock data (offline-safe)

---

## 🧠 Architecture

```
┌─────────────────┐        ┌─────────────────────┐        ┌──────────────┐
│   React Native  │  HTTP  │   Express.js API     │        │  Gemini AI   │
│   (Expo App)    │───────▶│   /api/remedies/:id  │───────▶│  (2.0 Flash) │
│                 │◀───────│                      │◀───────│              │
└─────────────────┘  JSON  │  ┌───────────────┐   │  JSON  └──────────────┘
                           │  │  Cache Layer   │  │
                           │  │  ┌──────────┐  │  │
                           │  │  │ In-Memory │  │  │
                           │  │  └──────────┘  │  │
                           │  │  ┌──────────┐  │  │
                           │  │  │ MongoDB  │  │  │
                           │  │  └──────────┘  │  │
                           │  └───────────────┘   │
                           └─────────────────────┘
```

**Flow:**
1. User describes a health concern in the app
2. App sends GET request to backend API
3. Backend checks in-memory cache → MongoDB → Gemini AI (in order)
4. If Gemini responds, result is cached in MongoDB for future use
5. If Gemini is unavailable, falls back to comprehensive local data
6. App displays the treatment plan with remedies, yoga, and advice

---

## 🎨 Design Philosophy

- **Dark Theme** — Deep forest green (#0D1F1C) base for comfortable viewing
- **Glassmorphism** — Frosted glass card effects using `expo-blur`
- **Gradient Accents** — Green gradient (#4ADE80 → #22C55E) for CTAs
- **Micro-Animations** — Pulsing icons, fade-in cards, animated transitions
- **Timeline Visuals** — Connected step indicators for recipes and yoga

---

## 📜 License

This project is for educational and personal use.

---

## 🙏 Acknowledgments

- Ancient Ayurvedic texts and practitioners
- Google Gemini AI for intelligent content generation
- React Native & Expo communities
- The open-source ecosystem

---

<p align="center">
  <strong>Built with ❤️ by Ayush Thakur</strong><br>
  <em>Ancient Wisdom × Modern Care</em>
</p>
