import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Keyboard, Alert, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

import { API_URL } from '../config';

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

// ─── Feature highlights ───
const FEATURES = [
  {
    icon: 'leaf',
    title: 'Herbal Remedies',
    desc: 'Discover time-tested herbal formulations backed by ancient Ayurvedic texts.',
    gradient: ['#065F46', '#059669'],
  },
  {
    icon: 'body',
    title: 'Yoga & Asanas',
    desc: 'Personalized yoga routines tailored to your specific health condition.',
    gradient: ['#1E3A5F', '#3B82F6'],
  },
  {
    icon: 'medkit',
    title: 'Doctor Guidance',
    desc: 'Know when to seek professional help with intelligent medical advice.',
    gradient: ['#7C2D12', '#EA580C'],
  },
];

// ─── How it works steps ───
const STEPS = [
  { icon: 'chatbubble-ellipses', title: 'Describe', desc: 'Tell us your health concern in simple words' },
  { icon: 'sparkles', title: 'AI Analyzes', desc: 'Our AI references thousands of Ayurvedic texts' },
  { icon: 'heart-circle', title: 'Get Healed', desc: 'Receive remedies, yoga, diet tips & doctor advice' },
];

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Subtle pulse on the leaf icon
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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const url = `${API_URL}/${encodeURIComponent(q)}`;
      console.log('Fetching:', url);
      const response = await axios.get(url, { timeout: 45000 });
      console.log('Response:', response.data);
      navigation.navigate('Results', { remedy: response.data });
    } catch (error) {
      console.error('Error:', error.message);
      let message;
      if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please check that the backend server is running.';
      } else if (error.message?.includes('Network Error')) {
        message = `Cannot connect to server at ${API_URL}. Make sure the backend is running and your device is on the same network.`;
      } else {
        message = error.response?.data?.error || 'Unable to connect to the server. Please ensure the backend is running.';
      }
      Alert.alert('Connection Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAilment = (label) => {
    setQuery(label);
    handleSearch(label);
  };

  // ────────────────────── RENDER ──────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0A1A17', '#0D1F1C', '#122A24', '#0D1F1C']} style={StyleSheet.absoluteFill} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ HERO SECTION ═══ */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Decorative glowing circle behind icon */}
          <View style={styles.glowCircle} />
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.iconCircle}>
              <Ionicons name="leaf" size={40} color="#0D1F1C" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.heroTitle}>AyurSaathi</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.heroTagline}>Your Ayurvedic Health Companion</Text>
          <Text style={styles.heroQuote}>
            "When diet is wrong, medicine is of no use.{'\n'}When diet is correct, medicine is of no need."
          </Text>
          <Text style={styles.heroQuoteAuthor}>— Ayurvedic Proverb</Text>
        </Animated.View>

        {/* ═══ SEARCH SECTION ═══ */}
        <Animated.View style={[styles.searchSection, { opacity: fadeAnim }]}>
          <View style={styles.searchCard}>
            <BlurView intensity={40} tint="dark" style={styles.searchBlur}>
              <Text style={styles.searchLabel}>What's troubling you?</Text>
              <View style={styles.searchInputRow}>
                <Ionicons name="search" size={20} color="#4ADE80" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="e.g. headache, cold, back pain..."
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => handleSearch()}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity
                style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
                onPress={() => handleSearch()}
                disabled={!query.trim() || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#166534', '#15803D'] : ['#4ADE80', '#22C55E']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.searchButtonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <Ionicons name="book" size={18} color="#0D1F1C" />
                      <Text style={styles.searchButtonText}>  Consulting Ancient Texts...</Text>
                    </View>
                  ) : (
                    <View style={styles.loadingRow}>
                      <Ionicons name="sparkles" size={18} color="#0D1F1C" />
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
            <Ionicons name="flash" size={20} color="#4ADE80" />
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
                  colors={['rgba(74,222,128,0.08)', 'rgba(74,222,128,0.02)']}
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
            <Ionicons name="apps" size={20} color="#4ADE80" />
            <Text style={styles.sectionTitle}>What We Offer</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <LinearGradient colors={f.gradient} style={styles.featureGradient}>
                  <View style={styles.featureIconCircle}>
                    <Ionicons name={f.icon} size={28} color="#fff" />
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
            <Ionicons name="git-network" size={20} color="#4ADE80" />
            <Text style={styles.sectionTitle}>How It Works</Text>
          </View>
          <View style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepTimeline}>
                  <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.stepDot}>
                    <Ionicons name={step.icon} size={20} color="#0D1F1C" />
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
            <BlurView intensity={30} tint="dark" style={styles.infoBlur}>
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
                  { icon: 'time', text: '5,000+ years of proven wisdom' },
                  { icon: 'globe', text: 'Recognized by WHO as traditional medicine' },
                  { icon: 'fitness', text: 'Holistic mind-body-spirit approach' },
                  { icon: 'leaf', text: '100% natural herbal formulations' },
                ].map((b, i) => (
                  <View key={i} style={styles.infoBulletRow}>
                    <Ionicons name={b.icon} size={16} color="#4ADE80" />
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
          <Ionicons name="leaf" size={20} color="rgba(74,222,128,0.3)" />
          <Text style={styles.footerText}>AyurSaathi v1.0</Text>
          <Text style={styles.footerSub}>Ancient Wisdom × Modern Care</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────── STYLES ───────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F1C' },
  scrollContent: { paddingBottom: 40 },

  // ─ Hero
  heroSection: { alignItems: 'center', paddingTop: 70, paddingBottom: 10, paddingHorizontal: 24 },
  glowCircle: {
    position: 'absolute', top: 50, width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(74,222,128,0.06)',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4ADE80', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 44, fontWeight: '800', color: '#fff', marginTop: 16,
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 60, height: 3, backgroundColor: '#4ADE80', borderRadius: 2,
    marginTop: 8, marginBottom: 12,
  },
  heroTagline: { fontSize: 16, color: '#A7F3D0', fontWeight: '500', letterSpacing: 0.5 },
  heroQuote: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic',
    textAlign: 'center', marginTop: 20, lineHeight: 20, paddingHorizontal: 20,
  },
  heroQuoteAuthor: { fontSize: 12, color: 'rgba(74,222,128,0.4)', marginTop: 6 },

  // ─ Search
  searchSection: { paddingHorizontal: 24, marginTop: 30, marginBottom: 10 },
  searchCard: {
    borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)',
  },
  searchBlur: { padding: 20 },
  searchLabel: { fontSize: 14, color: '#A7F3D0', fontWeight: '600', marginBottom: 12, letterSpacing: 0.3 },
  searchInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#fff' },
  searchButton: { marginTop: 14, borderRadius: 16, overflow: 'hidden' },
  searchButtonDisabled: { opacity: 0.45 },
  searchButtonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  searchButtonText: { color: '#0D1F1C', fontSize: 16, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },

  // ─ Sections
  section: { paddingHorizontal: 24, marginTop: 36 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginLeft: 8 },
  sectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16, marginLeft: 28 },

  // ─ Ailments Grid
  ailmentsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  ailmentChip: { width: (width - 64) / 2, marginBottom: 12 },
  ailmentChipInner: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(74,222,128,0.12)',
  },
  ailmentEmoji: { fontSize: 22, marginRight: 10 },
  ailmentLabel: { fontSize: 14, color: '#E5E7EB', fontWeight: '500' },

  // ─ Features
  featureCard: { width: width * 0.62, marginRight: 14, borderRadius: 24, overflow: 'hidden' },
  featureGradient: { padding: 22, borderRadius: 24, minHeight: 190 },
  featureIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  featureTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  featureDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },

  // ─ Steps
  stepsContainer: { marginTop: 12 },
  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepTimeline: { alignItems: 'center', width: 48 },
  stepDot: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  stepLine: { width: 2, flex: 1, backgroundColor: 'rgba(74,222,128,0.2)', marginVertical: 4 },
  stepContent: { flex: 1, paddingLeft: 14, paddingBottom: 28 },
  stepNumber: { fontSize: 11, color: '#4ADE80', fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 19 },

  // ─ Info
  infoCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(74,222,128,0.1)' },
  infoBlur: { padding: 22 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoEmoji: { fontSize: 24, marginRight: 10 },
  infoTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  infoText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 22, marginBottom: 16 },
  infoBullets: {},
  infoBulletRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoBulletText: { fontSize: 13, color: '#D1FAE5', marginLeft: 10 },

  // ─ Footer
  footer: { alignItems: 'center', marginTop: 44, paddingBottom: 20 },
  footerDivider: {
    width: 40, height: 2, backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: 1, marginBottom: 16,
  },
  footerText: { fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 8 },
  footerSub: { fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 4 },
});
