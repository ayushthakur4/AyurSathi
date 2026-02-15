require('dotenv').config();

const listModels = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log(`Listing models for key starting with ${key.substring(0, 5)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.error("No models found or error:", data);
        }
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
};

listModels();
