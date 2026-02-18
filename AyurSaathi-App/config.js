import { Platform } from 'react-native';

// ============================================================
// DEPLOYMENT CONFIG
// ============================================================
// After deploying to Render, replace this URL with your actual
// Render service URL (e.g. https://ayursaathi-backend.onrender.com)
const PRODUCTION_URL = 'https://ayursathi.onrender.com/api/remedies';

// For local development, set USE_LOCAL=true and update LOCAL_IP
const USE_LOCAL = false; // Set to true for local development
const LOCAL_IP = '192.168.137.146';

const getApiUrl = () => {
    if (USE_LOCAL && __DEV__) {
        // Use local backend (only for local dev/debugging)
        return `http://${LOCAL_IP}:5000/api/remedies`;
    }
    // Use cloud backend — works on ANY device, ANY network
    return PRODUCTION_URL;
};

export const API_URL = getApiUrl();

// Version check endpoint
const getVersionUrl = () => {
    if (USE_LOCAL && __DEV__) {
        return `http://${LOCAL_IP}:5000/api/version`;
    }
    return 'https://ayursathi.onrender.com/api/version';
};
export const VERSION_API_URL = getVersionUrl();
