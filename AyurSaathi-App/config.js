import { Platform } from 'react-native';

// Use your computer's local network IP so physical devices can connect.
// If using Android Emulator, 10.0.2.2 maps to host localhost.
// If using a physical device via Expo Go, use the actual LAN IP.
const LOCAL_IP = '10.208.102.181';

const getApiUrl = () => {
    if (__DEV__) {
        // In development, use the local network IP for physical devices
        return `http://${LOCAL_IP}:5000/api/remedies`;
    }
    // For production, replace with your deployed server URL
    return 'http://localhost:5000/api/remedies';
};

export const API_URL = getApiUrl();
