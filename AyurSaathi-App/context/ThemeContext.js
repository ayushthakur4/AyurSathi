import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTheme, getSharedStyles } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');
    const theme = getTheme(mode);
    const sharedStyles = getSharedStyles(theme);

    const toggleTheme = () => {
        // Theme is locked to Light Mode as per professional requirements
        setMode('light');
    };

    const value = {
        theme,
        mode,
        toggleTheme,
        styles: sharedStyles,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
