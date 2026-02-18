// Theme — Apple Human Interface Guidelines inspired
// Clean, minimal, system-native feel with generous whitespace

export const PALETTES = {
    light: {
        background: {
            primary: '#FFFFFF',
            secondary: '#F2F2F7',   // iOS system grouped background
            tertiary: '#E5E5EA',    // iOS systemGray5
        },
        text: {
            header: '#000000',       // Pure black labels
            body: '#3C3C43',         // iOS secondaryLabel
            subtext: '#8E8E93',      // iOS systemGray
            inverse: '#FFFFFF',
        },
        border: 'rgba(60,60,67,0.08)', // Ultra-subtle separator
        glass: 'rgba(255,255,255,0.72)',
        input: '#F2F2F7',
        separator: 'rgba(60,60,67,0.12)',
    },
    dark: {
        background: {
            primary: '#000000',
            secondary: '#1C1C1E',
            tertiary: '#2C2C2E',
        },
        text: {
            header: '#FFFFFF',
            body: '#EBEBF5',
            subtext: '#8E8E93',
            inverse: '#000000',
        },
        border: 'rgba(84,84,88,0.36)',
        glass: 'rgba(28,28,30,0.72)',
        input: '#1C1C1E',
        separator: 'rgba(84,84,88,0.36)',
    },
};

export const COMMON_COLORS = {
    primary: '#007AFF',        // iOS Blue
    primaryDark: '#0056CC',
    secondary: '#34C759',      // iOS Green
    secondaryDark: '#248A3D',
    success: '#34C759',        // iOS Green
    warning: '#FF9500',        // iOS Orange
    error: '#FF3B30',          // iOS Red
    accent: '#AF52DE',         // iOS Purple
    teal: '#5AC8FA',           // iOS Light Blue
    pink: '#FF2D55',           // iOS Pink
    indigo: '#5856D6',         // iOS Indigo
};

export const getTheme = (mode = 'light') => ({
    ...COMMON_COLORS,
    ...PALETTES[mode],
    mode,
});

// Shared card style — Apple uses very soft shadows, no borders
export const getSharedStyles = (theme) => ({
    glassCard: {
        backgroundColor: theme.mode === 'light' ? '#FFFFFF' : '#1C1C1E',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
});
