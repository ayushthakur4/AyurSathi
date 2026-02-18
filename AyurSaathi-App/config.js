import { Platform } from 'react-native';

// backend url for production
const PRODUCTION_URL = 'https://ayursathi.onrender.com/api/remedies';

// set to true for local testing
const USE_LOCAL = false;
const LOCAL_IP = '192.168.137.146';

const getApiUrl = () => {
    if (USE_LOCAL && __DEV__) {
        // use local backend
        return `http://${LOCAL_IP}:5000/api/remedies`;
    }
    // use cloud backend
    return PRODUCTION_URL;
};

export const API_URL = getApiUrl();

// api to check app version
const getVersionUrl = () => {
    if (USE_LOCAL && __DEV__) {
        return `http://${LOCAL_IP}:5000/api/version`;
    }
    return 'https://ayursathi.onrender.com/api/version';
};
export const VERSION_API_URL = getVersionUrl();
