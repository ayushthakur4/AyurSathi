import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Platform, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { VERSION_API_URL } from '../config';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

export default function SettingsScreen({ navigation }) {
    const { theme } = useTheme();
    const s = useMemo(() => mk(theme), [theme]);

    const [checking, setChecking] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(null);
    const [showLangs, setShowLangs] = useState(false);
    const { language, setLanguage, langName, LANGUAGES } = useLanguage();

    const checkForUpdate = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setChecking(true);
        setUpdateStatus(null);

        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                setUpdateStatus('available');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                setUpdateStatus('latest');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
        } catch (e) {
            // Fallback: check backend version endpoint
            try {
                const res = await fetch(VERSION_API_URL);
                const data = await res.json();
                const latest = data.latestVersion || APP_VERSION;
                if (latest !== APP_VERSION && compareSemver(latest, APP_VERSION) > 0) {
                    setUpdateStatus('available');
                } else {
                    setUpdateStatus('latest');
                }
            } catch {
                Alert.alert('Error', 'Could not check for updates. Please try again later.');
            }
        } finally {
            setChecking(false);
        }
    }, []);

    const downloadUpdate = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setDownloading(true);
        try {
            const result = await Updates.fetchUpdateAsync();
            if (result.isNew) {
                setUpdateStatus('downloaded');
                setDownloading(false);
                Alert.alert(
                    'Update Ready!',
                    'The update has been downloaded. Restart the app to apply the changes.',
                    [
                        { text: 'Later', style: 'cancel' },
                        { text: 'Restart Now', onPress: () => Updates.reloadAsync() },
                    ]
                );
            }
        } catch (e) {
            setDownloading(false);
            Alert.alert('Update Failed', 'Could not download the update. Please try again.');
        }
    }, []);

    return (
        <View style={s.root}>
            <StatusBar style="dark" />

            {/* Nav */}
            <View style={s.nav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.navBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <Text style={s.navTitle}>Settings</Text>
                <View style={s.navBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* app info */}
                <View style={s.appCard}>
                    <LinearGradient colors={['#007AFF', '#5856D6']} style={s.appIcon}>
                        <Ionicons name="leaf" size={28} color="#FFF" />
                    </LinearGradient>
                    <Text style={s.appName}>AyurSathi</Text>
                    <Text style={s.appVersion}>Version {APP_VERSION}</Text>
                    <Text style={s.appTag}>Your Ayurvedic Companion</Text>
                </View>

                {/* update section */}
                <Text style={s.secLabel}>SOFTWARE UPDATE</Text>
                <View style={s.group}>
                    {/* show update status */}
                    {updateStatus === 'latest' && (
                        <View style={s.statusRow}>
                            <View style={s.statusIcon}>
                                <Ionicons name="checkmark-circle" size={22} color="#34C759" />
                            </View>
                            <View style={s.statusBody}>
                                <Text style={s.statusTitle}>AyurSathi is up to date</Text>
                                <Text style={s.statusSub}>v{APP_VERSION} is the latest version</Text>
                            </View>
                        </View>
                    )}

                    {updateStatus === 'available' && (
                        <View style={s.statusRow}>
                            <View style={s.statusIcon}>
                                <Ionicons name="arrow-up-circle" size={22} color="#007AFF" />
                            </View>
                            <View style={s.statusBody}>
                                <Text style={s.statusTitle}>Update Available</Text>
                                <Text style={s.statusSub}>A newer version is ready to install</Text>
                            </View>
                        </View>
                    )}

                    {updateStatus === 'downloaded' && (
                        <View style={s.statusRow}>
                            <View style={s.statusIcon}>
                                <Ionicons name="cloud-done" size={22} color="#34C759" />
                            </View>
                            <View style={s.statusBody}>
                                <Text style={s.statusTitle}>Update Downloaded</Text>
                                <Text style={s.statusSub}>Restart the app to apply</Text>
                            </View>
                        </View>
                    )}

                    {/* action buttons */}
                    {updateStatus === 'available' && !downloading ? (
                        <TouchableOpacity style={s.updateAction} onPress={downloadUpdate} activeOpacity={0.7}>
                            <LinearGradient colors={['#007AFF', '#5856D6']} style={s.updateBtnGrad}>
                                <Ionicons name="cloud-download-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={s.updateBtnText}>Download & Install</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : updateStatus === 'downloaded' ? (
                        <TouchableOpacity style={s.updateAction} onPress={() => Updates.reloadAsync()} activeOpacity={0.7}>
                            <LinearGradient colors={['#34C759', '#30D158']} style={s.updateBtnGrad}>
                                <Ionicons name="refresh" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={s.updateBtnText}>Restart Now</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[s.checkRow, checking && { opacity: 0.6 }]}
                            onPress={checkForUpdate}
                            disabled={checking}
                            activeOpacity={0.5}
                        >
                            {checking ? (
                                <ActivityIndicator size="small" color={theme.primary} style={{ marginRight: 10 }} />
                            ) : (
                                <Ionicons name="refresh-outline" size={20} color={theme.primary} style={{ marginRight: 10 }} />
                            )}
                            <Text style={s.checkText}>{checking ? 'Checking for Updates...' : 'Check for Updates'}</Text>
                        </TouchableOpacity>
                    )}

                    {/* download progress */}
                    {downloading && (
                        <View style={s.downloadingRow}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={s.downloadingText}>Downloading update...</Text>
                        </View>
                    )}
                </View>

                {/* language settings */}
                <Text style={s.secLabel}>LANGUAGE</Text>
                <View style={s.group}>
                    <TouchableOpacity
                        style={s.langCurrentRow}
                        onPress={() => { Haptics.selectionAsync(); setShowLangs(p => !p); }}
                        activeOpacity={0.5}
                    >
                        <View style={[s.settingsIcon, { backgroundColor: '#FF9500' }]}>
                            <Ionicons name="language-outline" size={16} color="#FFF" />
                        </View>
                        <Text style={s.settingsLabel}>App Language</Text>
                        <Text style={s.langCurrent}>{langName}</Text>
                        <Ionicons name={showLangs ? 'chevron-up' : 'chevron-down'} size={16} color="#C7C7CC" />
                    </TouchableOpacity>

                    {showLangs && LANGUAGES.map((lang, i) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[s.langRow, i < LANGUAGES.length - 1 && s.settingsRowBorder]}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setLanguage(lang.code);
                            }}
                            activeOpacity={0.5}
                        >
                            <Text style={s.langFlag}>{lang.flag}</Text>
                            <View style={s.langBody}>
                                <Text style={s.langName}>{lang.native}</Text>
                                <Text style={s.langSub}>{lang.label}</Text>
                            </View>
                            {language === lang.code && (
                                <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* general settings */}
                <Text style={s.secLabel}>GENERAL</Text>
                <View style={s.group}>
                    <SettingsRow icon="information-circle-outline" label="About AyurSathi" color="#007AFF" s={s}
                        onPress={() => Alert.alert('AyurSathi', 'AI-powered Ayurvedic health companion.\n\nBuilt with React Native & Expo.\n\nPowered by Gemini AI.')} />
                    <SettingsRow icon="shield-checkmark-outline" label="Privacy Policy" color="#34C759" s={s} last
                        onPress={() => Alert.alert('Privacy', 'AyurSathi does not collect or store any personal health data. All queries are processed in real-time and not saved.')} />
                </View>

                {/* support links */}
                <Text style={s.secLabel}>SUPPORT</Text>
                <View style={s.group}>
                    <SettingsRow icon="star-outline" label="Rate the App" color="#FF9500" s={s}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
                    <SettingsRow icon="chatbubble-outline" label="Send Feedback" color="#5856D6" s={s}
                        onPress={() => Linking.openURL('mailto:ayushthakur@example.com?subject=AyurSathi Feedback')} />
                    <SettingsRow icon="logo-github" label="View Source Code" color="#000" s={s} last
                        onPress={() => Linking.openURL('https://github.com/ayushthakur4')} />
                </View>

                {/* footer */}
                <View style={s.footer}>
                    <Text style={s.footerText}>Made with ❤️ by Ayush Thakur</Text>
                    <Text style={s.footerVersion}>AyurSathi v{APP_VERSION} • Expo SDK {Constants.expoConfig?.sdkVersion || '52'}</Text>
                </View>

            </ScrollView>
        </View>
    );
}

// helper functions
function compareSemver(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if ((pa[i] || 0) > (pb[i] || 0)) return 1;
        if ((pa[i] || 0) < (pb[i] || 0)) return -1;
    }
    return 0;
}

const SettingsRow = ({ icon, label, color, s, last, onPress }) => (
    <TouchableOpacity style={[s.settingsRow, !last && s.settingsRowBorder]} onPress={onPress} activeOpacity={0.5}>
        <View style={[s.settingsIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={16} color="#FFF" />
        </View>
        <Text style={s.settingsLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </TouchableOpacity>
);

// styles
const mk = (t) => StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background.secondary },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    nav: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingHorizontal: 8, paddingBottom: 6,
        backgroundColor: t.background.secondary,
    },
    navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    navTitle: { fontSize: 17, fontWeight: '600', color: t.text.header },

    // App Card
    appCard: {
        alignItems: 'center', paddingVertical: 30, marginBottom: 10,
    },
    appIcon: {
        width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        ...Platform.select({
            ios: { shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
            android: { elevation: 6 },
        }),
    },
    appName: { fontSize: 24, fontWeight: '800', color: t.text.header },
    appVersion: { fontSize: 14, color: t.text.subtext, marginTop: 4, fontWeight: '500' },
    appTag: { fontSize: 12, color: t.text.subtext, marginTop: 2 },

    // Section Label
    secLabel: {
        fontSize: 13, fontWeight: '600', color: t.text.subtext,
        textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 20, marginBottom: 8, marginLeft: 4,
    },

    // iOS Grouped Card
    group: {
        backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6 },
            android: { elevation: 1 },
        }),
    },

    // Update Status
    statusRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.separator,
    },
    statusIcon: { marginRight: 12 },
    statusBody: { flex: 1 },
    statusTitle: { fontSize: 16, fontWeight: '600', color: t.text.header },
    statusSub: { fontSize: 13, color: t.text.subtext, marginTop: 2 },

    // Check Button Row
    checkRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16,
    },
    checkText: { fontSize: 16, color: t.primary, fontWeight: '600' },

    // Download/Restart Button
    updateAction: { margin: 12, borderRadius: 12, overflow: 'hidden' },
    updateBtnGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
    },
    updateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

    // Downloading
    downloadingRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingBottom: 16,
    },
    downloadingText: { fontSize: 14, color: t.text.subtext, fontWeight: '500' },

    // Settings Rows
    settingsRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16,
    },
    settingsRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.separator },
    settingsIcon: {
        width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    settingsLabel: { flex: 1, fontSize: 17, color: t.text.header },

    // Footer
    footer: { alignItems: 'center', marginTop: 30, paddingBottom: 10 },
    footerText: { fontSize: 12, color: t.text.subtext },
    footerVersion: { fontSize: 11, color: t.text.subtext + '80', marginTop: 4 },

    // Language Picker
    langCurrentRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.separator,
    },
    langCurrent: { fontSize: 15, color: t.text.subtext, marginRight: 6, fontWeight: '500' },
    langRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
    },
    langFlag: { fontSize: 20, marginRight: 12 },
    langBody: { flex: 1 },
    langName: { fontSize: 16, fontWeight: '500', color: t.text.header },
    langSub: { fontSize: 12, color: t.text.subtext, marginTop: 1 },
});
