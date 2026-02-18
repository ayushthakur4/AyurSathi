import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'ur', label: 'Urdu', native: 'اردو', flag: '🇮🇳' },
    { code: 'as', label: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
    { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳' },
];

// Static UI strings (lightweight i18n)
const STRINGS = {
    en: {
        greeting: 'Good',
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        searchTitle: "What's troubling you?",
        searchPlaceholder: 'e.g., headache, cold, stress...',
        searchButton: 'Find My Remedy',
        searchSub: 'Describe your symptoms and let AI find Ayurvedic remedies for you',
        try: 'Try:',
        settings: 'Settings',
        update: 'Software Update',
        checkUpdate: 'Check for Updates',
        language: 'Language',
        about: 'About',
        general: 'General',
        support: 'Support',
        quickHeal: 'Quick Heal',
        dailyTip: 'Daily Tip',
    },
    hi: {
        greeting: 'शुभ',
        morning: 'प्रभात',
        afternoon: 'दोपहर',
        evening: 'संध्या',
        searchTitle: 'आपको क्या परेशानी है?',
        searchPlaceholder: 'जैसे सिरदर्द, सर्दी, तनाव...',
        searchButton: 'उपचार खोजें',
        searchSub: 'अपने लक्षण बताएं और AI आयुर्वेदिक उपचार खोजेगा',
        try: 'आज़माएं:',
        settings: 'सेटिंग्स',
        update: 'सॉफ्टवेयर अपडेट',
        checkUpdate: 'अपडेट जांचें',
        language: 'भाषा',
        about: 'परिचय',
        general: 'सामान्य',
        support: 'सहायता',
        quickHeal: 'त्वरित उपचार',
        dailyTip: 'दैनिक सुझाव',
    },
    bn: {
        greeting: 'শুভ',
        morning: 'সকাল',
        afternoon: 'দুপুর',
        evening: 'সন্ধ্যা',
        searchTitle: 'আপনার সমস্যা কী?',
        searchPlaceholder: 'যেমন মাথাব্যথা, সর্দি...',
        searchButton: 'প্রতিকার খুঁজুন',
        searchSub: 'আপনার লক্ষণ বর্ণনা করুন',
        try: 'চেষ্টা করুন:',
        settings: 'সেটিংস',
        update: 'আপডেট',
        checkUpdate: 'আপডেট চেক করুন',
        language: 'ভাষা',
        about: 'সম্পর্কে',
        general: 'সাধারণ',
        support: 'সাহায্য',
        quickHeal: 'দ্রুত চিকিৎসা',
        dailyTip: 'দৈনিক টিপস',
    },
};

// Returns English fallback for unsupported languages
const getStrings = (langCode) => STRINGS[langCode] || STRINGS.en;

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState('en');

    useEffect(() => {
        AsyncStorage.getItem('app_language').then(saved => {
            if (saved) setLanguageState(saved);
        });
    }, []);

    const setLanguage = useCallback((code) => {
        setLanguageState(code);
        AsyncStorage.setItem('app_language', code);
    }, []);

    const strings = getStrings(language);
    const langName = LANGUAGES.find(l => l.code === language)?.native || 'English';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, strings, langName, LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
