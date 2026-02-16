// Theme Config: Professional Google-style Material Design
// Kept it clean and trustworthy with plenty of whitespace and blue accents.

export const PALETTES = {
    light: {
        background: {
            primary: '#FFFFFF', // Classic white background
            secondary: '#F8F9FA', // Almost white, good for subtle separation
            tertiary: '#F1F3F4', // Light grey for inputs/cards
        },
        text: {
            header: '#202124', // Almost black, easier on the eyes than #000
            body: '#3C4043',   // Standard reading grey
            subtext: '#5F6368', // Secondary info
            inverse: '#FFFFFF',
        },
        border: '#DADCE0', // Subtle borders
        glass: 'rgba(255, 255, 255, 0.9)', // Mostly solid, just a hint of transparency
        input: '#F1F3F4',
    },
    dark: {
        // keeping this just in case we ever want to switch back or offer it as a pro feature
        background: {
            primary: '#202124',
            secondary: '#303134',
            tertiary: '#3C4043',
        },
        text: {
            header: '#E8EAED',
            body: '#BDC1C6',
            subtext: '#9AA0A6',
            inverse: '#202124',
        },
        border: '#5F6368',
        glass: 'rgba(48, 49, 52, 0.9)',
        input: '#303134',
    },
};

export const COMMON_COLORS = {
    primary: '#1A73E8', // Google Blue
    primaryDark: '#174EA6', // Google Blue Dark
    secondary: '#188038', // Google Green
    success: '#1E8E3E',
    warning: '#F9AB00', // Google Yellow
    error: '#D93025', // Google Red
};

export const getTheme = (mode = 'light') => ({ // Default to light for professional feel
    ...COMMON_COLORS,
    ...PALETTES[mode],
    mode,
});

// Shared Styles Generator
export const getSharedStyles = (theme) => ({
    glassCard: {
        backgroundColor: theme.background.secondary, // Solid professional look, less glass
        borderColor: theme.border,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: 'rgba(60, 64, 67, 0.3)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    shadow: {
        shadowColor: 'rgba(60, 64, 67, 0.3)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});
