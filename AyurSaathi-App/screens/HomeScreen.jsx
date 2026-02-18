import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Keyboard, Alert, ScrollView, Dimensions, Image, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: 'sunny-outline' };
  if (h < 17) return { text: 'Good Afternoon', icon: 'partly-sunny-outline' };
  if (h < 21) return { text: 'Good Evening', icon: 'moon-outline' };
  return { text: 'Good Night', icon: 'cloudy-night-outline' };
};

const AILMENTS = [
  { label: 'Headache', icon: '🤕' },
  { label: 'Cold & Flu', icon: '🤧' },
  { label: 'Stress', icon: '😰' },
  { label: 'Digestion', icon: '🫄' },
  { label: 'Back Pain', icon: '🦴' },
  { label: 'Insomnia', icon: '😴' },
  { label: 'Skin Care', icon: '✨' },
  { label: 'Joint Pain', icon: '🦵' },
  { label: 'Anxiety', icon: '😥' },
  { label: 'Migraine', icon: '🧠' },
];

const TIPS = [
  { emoji: '🍋', tip: 'Start your morning with warm lemon water to ignite your digestive fire and flush toxins.', tag: 'Morning Ritual' },
  { emoji: '🧘', tip: '5 minutes of Pranayama daily can balance your doshas and reduce stress levels.', tag: 'Breathwork' },
  { emoji: '🌿', tip: 'Tulsi tea is a powerful adaptogen \u2014 it boosts immunity and calms anxiety naturally.', tag: 'Herbal' },
  { emoji: '🛌', tip: 'Ayurveda recommends sleeping by 10 PM for optimal detoxification and recovery.', tag: 'Sleep' },
  { emoji: '💧', tip: 'Sip warm water throughout the day. Cold water dampens Agni and slows digestion.', tag: 'Hydration' },
  { emoji: '🍯', tip: 'Raw honey with warm water on an empty stomach supports immunity and digestion.', tag: 'Diet' },
];

const DOSHAS = [
  { name: 'Vata', emoji: '🌬️', element: 'Air + Space', color: '#5AC8FA', traits: ['Creative', 'Quick', 'Energetic'] },
  { name: 'Pitta', emoji: '🔥', element: 'Fire + Water', color: '#FF9500', traits: ['Focused', 'Sharp', 'Athletic'] },
  { name: 'Kapha', emoji: '🌍', element: 'Earth + Water', color: '#34C759', traits: ['Calm', 'Strong', 'Steady'] },
];

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { language, strings } = useLanguage();
  const s = useMemo(() => mk(theme), [theme]);
  const greeting = useMemo(() => getGreeting(), []);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => setTipIdx(p => (p + 1) % TIPS.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const search = useCallback(async (q) => {
    const val = q || query;
    if (!val.trim()) return;
    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${encodeURIComponent(val)}`, { params: { lang: language }, timeout: 45000 });
      navigation.navigate('Results', { remedy: res.data });
    } catch (err) {
      let msg = 'Something went wrong. Please try again.';
      if (err.code === 'ECONNABORTED') msg = 'Server is taking too long. Try again.';
      else if (err.message?.includes('Network Error')) msg = 'Cannot reach server. Check your connection.';
      else if (err.response?.data?.error) msg = err.response.data.error;
      Alert.alert('Oops', msg);
    } finally {
      setLoading(false);
    }
  }, [query, navigation]);

  const tip = TIPS[tipIdx];

  return (
    <View style={s.root}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* header section */}
        <Animated.View style={[s.header, { opacity: fadeAnim }]}>
          <View>
            <View style={s.greetRow}>
              <Ionicons name={greeting.icon} size={16} color={theme.text.subtext} />
              <Text style={s.greetText}>{greeting.text}</Text>
            </View>
            <Text style={s.largeTitle}>AyurSathi</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.background.tertiary, alignItems: 'center', justifyContent: 'center' }}
              activeOpacity={0.6}
            >
              <Ionicons name="settings-outline" size={20} color={theme.text.subtext} />
            </TouchableOpacity>
            <Image source={require('../assets/icon.png')} style={s.avatar} />
          </View>
        </Animated.View>

        {/* ai search area */}
        <View style={s.searchHero}>
          {/* ai label */}
          <View style={s.aiBadge}>
            <Ionicons name="sparkles" size={14} color="#FFF" />
            <Text style={s.aiBadgeText}>AI-Powered Ayurvedic Search</Text>
          </View>

          <Text style={s.searchTitle}>What's troubling you?</Text>
          <Text style={s.searchSub}>Describe your symptoms and our AI will find personalized Ayurvedic remedies, yoga, and lifestyle tips.</Text>

          {/* main search box */}
          <View style={[s.searchInputWrap, query.length > 0 && s.searchInputActive]}>
            <Ionicons name="search" size={20} color={query.length > 0 ? theme.primary : theme.text.subtext} />
            <TextInput
              style={s.searchInput}
              placeholder="e.g. headache, stress, poor digestion..."
              placeholderTextColor={theme.text.subtext + '90'}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => search()}
              returnKeyType="search"
              selectionColor={theme.primary}
              multiline={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close-circle" size={20} color={theme.text.subtext} />
              </TouchableOpacity>
            )}
          </View>

          {/* search button */}
          <TouchableOpacity
            style={[s.ctaBtn, (!query.trim() || loading) && { opacity: 0.4 }]}
            onPress={() => search()}
            disabled={!query.trim() || loading}
            activeOpacity={0.75}
          >
            {loading ? (
              <Text style={s.ctaBtnText}>Consulting ancient wisdom...</Text>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={s.ctaBtnText}>Find My Remedy</Text>
              </>
            )}
          </TouchableOpacity>

          {/* suggestion chips */}
          <View style={s.suggestRow}>
            <Text style={s.suggestLabel}>Try:</Text>
            {['Headache', 'Stress', 'Cold'].map(q => (
              <TouchableOpacity key={q} style={s.suggestChip} onPress={() => { setQuery(q); search(q); }} activeOpacity={0.6}>
                <Text style={s.suggestText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* quick fix list */}
        <SectionLabel label="Quick Heal" theme={theme} s={s} />
        <View style={s.iosGroup}>
          {AILMENTS.map((a, i) => (
            <TouchableOpacity
              key={a.label}
              style={[s.listRow, i < AILMENTS.length - 1 && s.listRowBorder]}
              onPress={() => { setQuery(a.label); search(a.label); }}
              activeOpacity={0.5}
            >
              <Text style={s.listEmoji}>{a.icon}</Text>
              <Text style={s.listLabel}>{a.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.text.subtext + '60'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* daily wellness tip */}
        <SectionLabel label="Daily Wellness" theme={theme} s={s} />
        <View style={s.iosGroup}>
          <View style={s.tipRow}>
            <Text style={{ fontSize: 32 }}>{tip.emoji}</Text>
            <View style={s.tipBody}>
              <Text style={s.tipTag}>{tip.tag}</Text>
              <Text style={s.tipText}>{tip.tip}</Text>
              <View style={s.dots}>
                {TIPS.map((_, i) => (
                  <View key={i} style={[s.dot, i === tipIdx && s.dotOn]} />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* dosha information */}
        <SectionLabel label="Know Your Dosha" theme={theme} s={s} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {DOSHAS.map((d) => (
            <View key={d.name} style={s.doshaCard}>
              <Text style={{ fontSize: 34, marginBottom: 8 }}>{d.emoji}</Text>
              <Text style={s.doshaName}>{d.name}</Text>
              <Text style={s.doshaEl}>{d.element}</Text>
              <View style={[s.doshaDivider, { backgroundColor: theme.separator }]} />
              {d.traits.map((t, i) => (
                <View key={i} style={s.traitRow}>
                  <View style={[s.traitDot, { backgroundColor: d.color }]} />
                  <Text style={s.traitText}>{t}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* explanation steps */}
        <SectionLabel label="How It Works" theme={theme} s={s} />
        <View style={s.iosGroup}>
          {[
            { num: '1', icon: 'chatbubble', title: 'Describe', sub: 'Tell us your health concern' },
            { num: '2', icon: 'sparkles', title: 'AI Analyzes', sub: 'We scan Ayurvedic knowledge' },
            { num: '3', icon: 'heart-circle', title: 'Get Healed', sub: 'Receive personalized remedies' },
          ].map((step, i, arr) => (
            <View key={i} style={[s.stepRow, i < arr.length - 1 && s.listRowBorder]}>
              <View style={[s.stepBadge, { backgroundColor: theme.primary }]}>
                <Text style={s.stepNum}>{step.num}</Text>
              </View>
              <View style={s.stepBody}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepSub}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* medical disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.warning} />
          <Text style={s.disclaimerText}>
            AyurSathi provides wellness information only. Always consult a healthcare professional.
          </Text>
        </View>

        {/* footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Made with ❤️ by Ayush Thakur</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const SectionLabel = ({ label, theme, s }) => (
  <Text style={s.sectionLabel}>{label}</Text>
);

const mk = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background.secondary },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },

  // header style
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 64 : 48, marginBottom: 16,
  },
  greetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  greetText: { fontSize: 13, color: t.text.subtext, marginLeft: 5, fontWeight: '500' },
  largeTitle: { fontSize: 34, fontWeight: '800', color: t.text.header, letterSpacing: 0.4 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginTop: 4, backgroundColor: t.background.tertiary },

  // ai search card
  searchHero: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16 },
      android: { elevation: 4 },
    }),
  },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
    backgroundColor: t.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14,
  },
  aiBadgeText: { fontSize: 12, fontWeight: '600', color: '#FFF', letterSpacing: 0.2 },
  searchTitle: { fontSize: 22, fontWeight: '700', color: t.text.header, marginBottom: 6 },
  searchSub: { fontSize: 14, color: t.text.subtext, lineHeight: 20, marginBottom: 18 },

  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: t.background.secondary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 2, borderColor: 'transparent', marginBottom: 12,
  },
  searchInputActive: { borderColor: t.primary + '30', backgroundColor: t.primary + '04' },
  searchInput: { flex: 1, fontSize: 17, color: t.text.header, paddingVertical: 0 },

  ctaBtn: {
    backgroundColor: t.primary, borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  ctaBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  suggestRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  suggestLabel: { fontSize: 13, color: t.text.subtext, fontWeight: '500' },
  suggestChip: {
    backgroundColor: t.background.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  suggestText: { fontSize: 13, color: t.primary, fontWeight: '600' },

  // section headers
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: t.text.subtext,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 28, marginBottom: 8, marginLeft: 4,
  },

  // iOS grouped card (like Settings rows)
  iosGroup: {
    backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },

  // list item style
  listRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.separator,
  },
  listEmoji: { fontSize: 22, marginRight: 14, width: 28, textAlign: 'center' },
  listLabel: { flex: 1, fontSize: 17, color: t.text.header },

  // wellness tip style
  tipRow: { flexDirection: 'row', padding: 16, alignItems: 'flex-start' },
  tipBody: { flex: 1, marginLeft: 14 },
  tipTag: { fontSize: 11, fontWeight: '600', color: t.primary, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  tipText: { fontSize: 15, color: t.text.body, lineHeight: 22 },
  dots: { flexDirection: 'row', marginTop: 12, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.background.tertiary },
  dotOn: { width: 20, backgroundColor: t.primary, borderRadius: 3 },

  // dosha card style
  doshaCard: {
    width: 150, marginRight: 10, borderRadius: 16, padding: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  doshaName: { fontSize: 20, fontWeight: '700', color: t.text.header },
  doshaEl: { fontSize: 12, color: t.text.subtext, marginTop: 1 },
  doshaDivider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  traitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  traitDot: { width: 5, height: 5, borderRadius: 3, marginRight: 8 },
  traitText: { fontSize: 13, color: t.text.body },

  // step by step guide
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  stepNum: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 17, fontWeight: '600', color: t.text.header },
  stepSub: { fontSize: 13, color: t.text.subtext, marginTop: 1 },

  // disclaimer text
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginTop: 28, paddingHorizontal: 4,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: t.text.subtext, lineHeight: 17 },

  // footer style
  footer: { alignItems: 'center', marginTop: 24, paddingBottom: 10 },
  footerText: { fontSize: 12, color: t.text.subtext },
});
