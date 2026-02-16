import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Keyboard, Alert, ScrollView, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// ─── Quick ailments data ───
const QUICK_AILMENTS = [
  { label: 'Headache', icon: '🤕' },
  { label: 'Cold & Flu', icon: '🤧' },
  { label: 'Stress', icon: '😰' },
  { label: 'Digestion', icon: '🫄' },
  { label: 'Back Pain', icon: '🦴' },
  { label: 'Insomnia', icon: '😴' },
  { label: 'Skin Care', icon: '✨' },
  { label: 'Joint Pain', icon: '🦵' },
];

export default function HomeScreen({ navigation }) {
  const { theme, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ─── Feature highlights (Dynamic) ───
  const FEATURES = useMemo(() => [
    {
      icon: 'leaf',
      title: 'Herbal Remedies',
      desc: 'Discover time-tested herbal formulations backed by ancient Ayurvedic texts.',
      gradient: [theme.background.secondary, theme.background.tertiary],
    },
    {
      icon: 'body',
      title: 'Yoga & Asanas',
      desc: 'Personalized yoga routines tailored to your specific health condition.',
      gradient: [theme.background.secondary, theme.background.tertiary],
    },
    {
      icon: 'medkit',
      title: 'Doctor Guidance',
      desc: 'Know when to seek professional help with intelligent medical advice.',
      gradient: [theme.background.secondary, theme.background.tertiary],
    },
  ], [theme]);

  // ─── How it works steps (Static data, dynamic styles) ───
  const STEPS = [
    { icon: 'chatbubble-ellipses', title: 'Describe', desc: 'Tell us your health concern in simple words' },
    { icon: 'sparkles', title: 'AI Analyzes', desc: 'Our AI references thousands of Ayurvedic texts' },
    { icon: 'heart-circle', title: 'Get Healed', desc: 'Receive remedies, yoga, diet tips & doctor advice' },
  ];

  // ─── Simple animations for the hero elements ───
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // A nice breathing effect for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Little haptic feedback feels good
    setLoading(true);

    try {
      const url = `${API_URL}/${encodeURIComponent(q)}`;
      console.log('Hitting API:', url);
      const response = await axios.get(url, { timeout: 45000 });
      console.log('Got data:', response.data);
      navigation.navigate('Results', { remedy: response.data });
    } catch (error) {
      console.error('API Error:', error.message);
      // ... error handling code ...
      // (truncated for brevity in this replace block, assuming rest is same logic)
      let message;
      // ... keeping logic same ...
      if (error.code === 'ECONNABORTED') {
        message = 'Taking too long. backend might be asleep.';
      } else if (error.message?.includes('Network Error')) {
        message = `Can't reach the server at ${API_URL}. Check network?`;
      } else {
        message = error.response?.data?.error || 'Server connection failed.';
      }
      Alert.alert('Connection Trouble', message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAilment = (label) => {
    setQuery(label);
    handleSearch(label);
  };

  // ────────────────────── UI RENDER ──────────────────────
  return (
    <View style={styles.container}>
      {/* Background gradient - gives it that nice depth */}
      <LinearGradient
        colors={[theme.background.primary, theme.background.secondary, theme.background.primary]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ HERO SECTION: The big welcome ═══ */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Subtle glow behind the logo */}
          <View style={styles.glowCircle} />
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.iconCircle}>
              <Image source={require('../assets/icon.png')} style={{ width: 56, height: 56, resizeMode: 'contain' }} />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.heroTitle}>AyurSathi</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.heroTagline}>Your Ayurvedic Health Companion</Text>
          <Text style={styles.heroQuote}>
            "When diet is wrong, medicine is of no use.{'\n'}When diet is correct, medicine is of no need."
          </Text>
          <Text style={styles.heroQuoteAuthor}>— Ayurvedic Proverb</Text>
        </Animated.View>

        {/* ═══ SEARCH: Main functional area ═══ */}
        <Animated.View style={[styles.searchSection, { opacity: fadeAnim }]}>
          <View style={styles.searchCard}>
            <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.searchBlur}>
              <Text style={styles.searchLabel}>What's troubling you?</Text>
              <View style={styles.searchInputRow}>
                <Ionicons name="search" size={20} color={theme.primary} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="e.g. headache, cold, back pain..."
                  placeholderTextColor={theme.text.subtext}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => handleSearch()}
                  returnKeyType="search"
                  selectionColor={theme.primary}
                />
              </View>
              <TouchableOpacity
                style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
                onPress={() => handleSearch()}
                disabled={!query.trim() || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? [theme.background.tertiary, theme.background.secondary] : [theme.primary, theme.primaryDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.searchButtonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <Ionicons name="sync" size={18} color={theme.text.body} style={{ marginRight: 8 }} />
                      <Text style={[styles.searchButtonText, { color: theme.text.body }]}>Analyzing Symptoms...</Text>
                    </View>
                  ) : (
                    <View style={styles.loadingRow}>
                      <Ionicons name="sparkles" size={18} color={theme.background.primary} />
                      <Text style={styles.searchButtonText}>  Find My Remedy</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Animated.View>

        {/* ═══ QUICK AILMENTS ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="flash-outline" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Common Ailments</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Tap to instantly search</Text>
          <View style={styles.ailmentsGrid}>
            {QUICK_AILMENTS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.ailmentChip}
                onPress={() => handleQuickAilment(item.label)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.glass, 'transparent']}
                  style={styles.ailmentChipInner}
                >
                  <Text style={styles.ailmentEmoji}>{item.icon}</Text>
                  <Text style={styles.ailmentLabel}>{item.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══ FEATURES ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="apps-outline" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>What We Offer</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <LinearGradient colors={f.gradient} style={styles.featureGradient}>
                  <View style={styles.featureIconCircle}>
                    <Ionicons name={f.icon} size={28} color={theme.primary} />
                  </View>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ═══ HOW IT WORKS ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="git-network-outline" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>How It Works</Text>
          </View>
          <View style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepTimeline}>
                  <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.stepDot}>
                    <Ionicons name={step.icon} size={20} color={theme.background.primary} />
                  </LinearGradient>
                  {i < STEPS.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepNumber}>STEP {i + 1}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ═══ AYURVEDA INFO ═══ */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <BlurView intensity={10} tint={mode === 'dark' ? 'light' : 'dark'} style={styles.infoBlur}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoEmoji}>🙏</Text>
                <Text style={styles.infoTitle}>The Wisdom of Ayurveda</Text>
              </View>
              <Text style={styles.infoText}>
                Ayurveda, the "Science of Life", is a 5,000-year-old system of natural healing originating
                in the Vedic culture of India. It emphasizes balance in body, mind, and spirit through diet,
                herbal remedies, yoga, and lifestyle practices.
              </Text>
              <View style={styles.infoBullets}>
                {[
                  { icon: 'time-outline', text: '5,000+ years of proven wisdom' },
                  { icon: 'globe-outline', text: 'Recognized by WHO as traditional medicine' },
                  { icon: 'fitness-outline', text: 'Holistic mind-body-spirit approach' },
                  { icon: 'leaf-outline', text: '100% natural herbal formulations' },
                ].map((b, i) => (
                  <View key={i} style={styles.infoBulletRow}>
                    <Ionicons name={b.icon} size={16} color={theme.secondary} />
                    <Text style={styles.infoBulletText}>{b.text}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Ionicons name="leaf-outline" size={20} color={theme.text.subtext} />
          <Text style={styles.footerText}>Made with ❤️ by Ayush Thakur</Text>
          <Text style={styles.footerSub}>AyurSathi v1.0 • Professional Edition</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────── STYLES GENERATOR ───────────────────────
const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  scrollContent: { paddingBottom: 40 },

  // ─ Theme Toggle
  themeToggle: {
    position: 'absolute', top: 52, right: 24, zIndex: 100,
    borderRadius: 20, overflow: 'hidden',
  },
  themeToggleInner: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // ─ Hero
  heroSection: { alignItems: 'center', paddingTop: 70, paddingBottom: 10, paddingHorizontal: 24 },
  glowCircle: {
    position: 'absolute', top: 50, width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(26, 115, 232, 0.04)', // Subtle Google Blue glow
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF', // White background for clean look
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
    elevation: 4,
    borderWidth: 1, borderColor: theme.border,
  },
  heroTitle: {
    fontSize: 44, fontWeight: '800', color: theme.text.header, marginTop: 16,
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 60, height: 3, backgroundColor: theme.primary, borderRadius: 2,
    marginTop: 8, marginBottom: 12,
  },
  heroTagline: { fontSize: 16, color: theme.text.body, fontWeight: '500', letterSpacing: 0.5 },
  heroQuote: {
    fontSize: 13, color: theme.text.subtext, fontStyle: 'italic',
    textAlign: 'center', marginTop: 20, lineHeight: 20, paddingHorizontal: 20,
  },
  heroQuoteAuthor: { fontSize: 12, color: theme.secondary, marginTop: 6 },

  // ─ Search
  searchSection: { paddingHorizontal: 24, marginTop: 30, marginBottom: 10 },
  searchCard: {
    borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.glass, // Dynamic glass
  },
  searchBlur: { padding: 20 },
  searchLabel: { fontSize: 14, color: theme.secondary, fontWeight: '600', marginBottom: 12, letterSpacing: 0.3 },
  searchInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.input, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  searchInput: { flex: 1, fontSize: 16, color: theme.text.header },
  searchButton: { marginTop: 14, borderRadius: 16, overflow: 'hidden' },
  searchButtonDisabled: { opacity: 0.6 },
  searchButtonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  searchButtonText: { color: theme.background.primary, fontSize: 16, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },

  // ─ Sections
  section: { paddingHorizontal: 24, marginTop: 36 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.text.header, marginLeft: 8 },
  sectionSubtitle: { fontSize: 13, color: theme.text.subtext, marginBottom: 16, marginLeft: 28 },

  // ─ Ailments Grid
  ailmentsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  ailmentChip: { width: (width - 64) / 2, marginBottom: 12 },
  ailmentChipInner: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 16, borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.background.tertiary,
  },
  ailmentEmoji: { fontSize: 20, marginRight: 10 },
  ailmentLabel: { fontSize: 14, color: theme.text.body, fontWeight: '500' },

  // ─ Features
  featureCard: { width: width * 0.62, marginRight: 14, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
  featureGradient: { padding: 22, borderRadius: 24, minHeight: 180, justifyContent: 'center' },
  featureIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1, borderColor: theme.border
  },
  featureTitle: { fontSize: 18, fontWeight: '700', color: theme.text.header, marginBottom: 6 },
  featureDesc: { fontSize: 13, color: theme.text.body, lineHeight: 19 },

  // ─ Steps
  stepsContainer: { marginTop: 12 },
  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepTimeline: { alignItems: 'center', width: 48 },
  stepDot: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.border
  },
  stepLine: { width: 2, flex: 1, backgroundColor: theme.border, marginVertical: 4 },
  stepContent: { flex: 1, paddingLeft: 14, paddingBottom: 28 },
  stepNumber: { fontSize: 11, color: theme.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: theme.text.header, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: theme.text.subtext, lineHeight: 19 },

  // ─ Info
  infoCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.glass },
  infoBlur: { padding: 22 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoEmoji: { fontSize: 24, marginRight: 10 },
  infoTitle: { fontSize: 18, fontWeight: '700', color: theme.text.header },
  infoText: { fontSize: 14, color: theme.text.body, lineHeight: 22, marginBottom: 16 },
  infoBullets: {},
  infoBulletRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoBulletText: { fontSize: 13, color: theme.secondary, marginLeft: 10 },

  // ─ Footer
  footer: { alignItems: 'center', marginTop: 44, paddingBottom: 20 },
  footerDivider: {
    width: 40, height: 2, backgroundColor: theme.border,
    borderRadius: 1, marginBottom: 16,
  },
  footerText: { fontSize: 13, color: theme.text.subtext, marginTop: 8 },
  footerSub: { fontSize: 11, color: theme.background.tertiary, marginTop: 4 }, // Subtle
});
