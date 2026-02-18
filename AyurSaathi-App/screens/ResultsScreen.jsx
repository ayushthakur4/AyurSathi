import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Animated, Share, Platform, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const TABS = ['Overview', 'Remedies', 'Yoga'];

export default function ResultsScreen({ route, navigation }) {
  const { theme } = useTheme();
  const s = useMemo(() => mk(theme), [theme]);

  const raw = route.params.remedy;
  const [tab, setTab] = useState('Overview');
  const [bookmarked, setBookmarked] = useState(false);
  const [helpful, setHelpful] = useState(null); // null | 'yes' | 'no'
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const contentFade = useRef(new Animated.Value(1)).current;

  const remedy = useMemo(() => ({
    ...raw,
    yoga: Array.isArray(raw.yoga) ? raw.yoga : raw.yoga ? [raw.yoga] : [],
    homeRemedies: Array.isArray(raw.homeRemedies) ? raw.homeRemedies : raw.homeRemedies ? [raw.homeRemedies] : [],
  }), [raw]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const switchTab = useCallback((t) => {
    if (tab === t) return;
    Haptics.selectionAsync();
    Animated.timing(contentFade, { toValue: 0, duration: 80, useNativeDriver: true }).start(() => {
      setTab(t);
      Animated.timing(contentFade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  }, [tab]);

  const shareResults = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `\uD83C\uDF3F ${remedy.diseaseName}\n\n${remedy.ayurvedicAnalysis || ''}\n\nRemedies: ${remedy.homeRemedies.map(r => r.remedyName).join(', ')}\n\n\u2014 AyurSathi`,
      });
    } catch (e) { }
  }, [remedy]);

  const toggleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBookmarked(p => !p);
  };

  const setFeedback = (val) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHelpful(val);
  };

  // ─── OVERVIEW ───
  const renderOverview = () => (
    <>
      {/* Stats Banner */}
      <View style={s.statsBanner}>
        <StatBubble val={remedy.homeRemedies.length} label="Remedies" gradient={['#34C759', '#30D158']} s={s} />
        <View style={s.statDivider} />
        <StatBubble val={remedy.yoga.length} label="Yoga" gradient={['#5856D6', '#AF52DE']} s={s} />
        <View style={s.statDivider} />
        <StatBubble val="AI" label="Verified" gradient={['#007AFF', '#5AC8FA']} s={s} />
      </View>

      {/* Ayurvedic Analysis */}
      {remedy.ayurvedicAnalysis && (
        <FeatureCard
          icon="sparkles" gradient={['#007AFF', '#5AC8FA']}
          title="Ayurvedic Analysis" text={remedy.ayurvedicAnalysis}
          accent="#007AFF" s={s}
        />
      )}

      {/* Dosha Impact */}
      <View style={s.doshaSection}>
        <Text style={s.doshaTitle}>Dosha Impact</Text>
        <View style={s.doshaRow}>
          {[
            { name: 'Vata', emoji: '\uD83C\uDF2C\uFE0F', color: '#5AC8FA', desc: 'Air & Space' },
            { name: 'Pitta', emoji: '\uD83D\uDD25', color: '#FF9500', desc: 'Fire & Water' },
            { name: 'Kapha', emoji: '\uD83C\uDF0D', color: '#34C759', desc: 'Earth & Water' },
          ].map(d => (
            <View key={d.name} style={s.doshaItem}>
              <View style={[s.doshaCircle, { borderColor: d.color + '40' }]}>
                <Text style={{ fontSize: 24 }}>{d.emoji}</Text>
              </View>
              <Text style={s.doshaName}>{d.name}</Text>
              <Text style={s.doshaDesc}>{d.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Health Tip */}
      {remedy.healthTip && (
        <FeatureCard
          icon="leaf" gradient={['#34C759', '#30D158']}
          title="Health Tip" text={remedy.healthTip}
          accent="#34C759" s={s}
        />
      )}

      {/* Lifestyle Tips */}
      <View style={s.lifestyleCard}>
        <View style={s.lifestyleHeader}>
          <LinearGradient colors={['#AF52DE', '#5856D6']} style={s.lifestyleIcon}>
            <Ionicons name="heart" size={18} color="#FFF" />
          </LinearGradient>
          <Text style={s.lifestyleTitle}>Lifestyle Tips</Text>
        </View>
        {[
          { icon: 'water-outline', text: 'Stay well hydrated \u2014 drink warm water throughout the day', color: '#5AC8FA' },
          { icon: 'bed-outline', text: 'Sleep by 10 PM for optimal recovery and detox', color: '#5856D6' },
          { icon: 'fitness-outline', text: 'Light exercise or walking for 20 minutes daily', color: '#FF2D55' },
          { icon: 'restaurant-outline', text: 'Eat fresh, seasonal, warm foods \u2014 avoid processed snacks', color: '#FF9500' },
        ].map((tip, i) => (
          <View key={i} style={[s.lifestyleTip, i < 3 && s.lifestyleTipBorder]}>
            <View style={[s.lifestyleTipIcon, { backgroundColor: tip.color + '12' }]}>
              <Ionicons name={tip.icon} size={16} color={tip.color} />
            </View>
            <Text style={s.lifestyleTipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* Doctor Advice */}
      {remedy.doctorAdvice && (
        <FeatureCard
          icon="medkit" gradient={['#FF9500', '#FF6B00']}
          title="When to See a Doctor" text={remedy.doctorAdvice}
          accent="#FF9500" s={s}
        />
      )}

      {/* Disclaimer */}
      <View style={s.disclaimerCard}>
        <Ionicons name="shield-checkmark" size={16} color="#FF9500" />
        <Text style={s.disclaimerText}>
          This information is AI-generated for educational purposes. Consult a qualified Ayurvedic practitioner for diagnosis.
        </Text>
      </View>

      {/* Feedback */}
      <View style={s.feedbackCard}>
        <Text style={s.feedbackTitle}>Was this helpful?</Text>
        <Text style={s.feedbackSub}>Your feedback improves our recommendations</Text>
        <View style={s.feedbackRow}>
          <TouchableOpacity
            style={[s.feedbackBtn, helpful === 'yes' && s.feedbackBtnActive]}
            onPress={() => setFeedback('yes')}
          >
            <Ionicons name={helpful === 'yes' ? 'thumbs-up' : 'thumbs-up-outline'} size={20} color={helpful === 'yes' ? '#FFF' : '#34C759'} />
            <Text style={[s.feedbackBtnText, helpful === 'yes' && { color: '#FFF' }]}>Helpful</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.feedbackBtn, helpful === 'no' && s.feedbackBtnActiveNo]}
            onPress={() => setFeedback('no')}
          >
            <Ionicons name={helpful === 'no' ? 'thumbs-down' : 'thumbs-down-outline'} size={20} color={helpful === 'no' ? '#FFF' : '#FF3B30'} />
            <Text style={[s.feedbackBtnText, helpful === 'no' && { color: '#FFF' }]}>Not Really</Text>
          </TouchableOpacity>
        </View>
        {helpful && (
          <Text style={s.feedbackThanks}>
            {helpful === 'yes' ? 'Glad we could help! \uD83D\uDE4F' : 'Thanks! We\'ll work on improving. \uD83D\uDCAA'}
          </Text>
        )}
      </View>
    </>
  );

  // ─── REMEDIES ───
  const renderRemedies = () => (
    <>
      {remedy.homeRemedies.length === 0 ? (
        <Empty icon="leaf-outline" text="No remedies found." s={s} theme={theme} />
      ) : (
        remedy.homeRemedies.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={s.remedyCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); navigation.navigate('Recipe', { remedy: item }); }}
            activeOpacity={0.85}
          >
            <View style={s.remedyTop}>
              <LinearGradient colors={['#34C759', '#30D158']} style={s.remedyIconBox}>
                <Ionicons name="nutrition" size={24} color="#FFF" />
              </LinearGradient>
              <View style={s.remedyBody}>
                <Text style={s.remedyName} numberOfLines={2}>{item.remedyName}</Text>
                <Text style={s.remedySub}>{item.ingredients?.length || 0} natural ingredients</Text>
              </View>
              <View style={s.arrowCircle}>
                <Ionicons name="chevron-forward" size={18} color={theme.text.subtext} />
              </View>
            </View>
            {item.ingredients?.length > 0 && (
              <View style={s.chipRow}>
                {item.ingredients.slice(0, 4).map((ing, j) => (
                  <View key={j} style={s.chip}>
                    <Text style={s.chipText} numberOfLines={1}>{ing}</Text>
                  </View>
                ))}
                {item.ingredients.length > 4 && (
                  <View style={[s.chip, { backgroundColor: theme.primary + '12' }]}>
                    <Text style={[s.chipText, { color: theme.primary }]}>+{item.ingredients.length - 4}</Text>
                  </View>
                )}
              </View>
            )}
            <View style={s.remedyFooter}>
              <View style={s.remedyTag}>
                <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                <Text style={s.remedyTagText}>Ayurvedic</Text>
              </View>
              <View style={s.remedyTag}>
                <Ionicons name="leaf" size={12} color="#FF9500" />
                <Text style={s.remedyTagText}>Natural</Text>
              </View>
              <Text style={s.viewDetails}>View Details \u2192</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </>
  );

  // ─── YOGA ───
  const renderYoga = () => (
    <>
      {remedy.yoga.length === 0 ? (
        <Empty icon="body-outline" text="No yoga recommended." s={s} theme={theme} />
      ) : (
        remedy.yoga.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={s.yogaCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); navigation.navigate('YogaDetail', { yoga: item }); }}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: `https://tse4.mm.bing.net/th?q=${encodeURIComponent(item.asanaName + ' yoga pose')}&w=800&h=500&c=7&rs=1&p=0` }}
              style={s.yogaImg}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={s.yogaGrad} />
            <View style={s.yogaInfo}>
              <View style={s.yogaBadgeRow}>
                <View style={s.yogaBadge}>
                  <Ionicons name="time-outline" size={11} color="#FFF" />
                  <Text style={s.yogaBadgeText}>{item.duration}</Text>
                </View>
                <View style={[s.yogaBadge, { backgroundColor: 'rgba(52,199,89,0.4)' }]}>
                  <Ionicons name="body-outline" size={11} color="#FFF" />
                  <Text style={s.yogaBadgeText}>Yoga</Text>
                </View>
              </View>
              <Text style={s.yogaName}>{item.asanaName}</Text>
              <Text style={s.yogaHint}>Tap for instructions, benefits & video \u2192</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </>
  );

  return (
    <View style={s.root}>
      {/* Hero Gradient Banner */}
      <LinearGradient colors={['#007AFF', '#5856D6']} style={s.heroBanner}>
        {/* Nav over gradient */}
        <View style={s.heroNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.heroNavBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={s.heroNavActions}>
            <TouchableOpacity onPress={toggleBookmark} style={s.heroNavBtn}>
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={shareResults} style={s.heroNavBtn}>
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={[s.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#007AFF" />
            <Text style={s.heroBadgeText}>AI-Powered Analysis</Text>
          </View>
          <Text style={s.heroTitle}>{remedy.diseaseName}</Text>
          <Text style={s.heroSub}>Your Personalized Healing Plan</Text>

          {/* Quick Action Pills */}
          <View style={s.quickActions}>
            <View style={s.qaPill}>
              <Ionicons name="leaf" size={13} color="#FFF" />
              <Text style={s.qaPillText}>{remedy.homeRemedies.length} Remedies</Text>
            </View>
            <View style={s.qaPill}>
              <Ionicons name="body" size={13} color="#FFF" />
              <Text style={s.qaPillText}>{remedy.yoga.length} Yoga</Text>
            </View>
            <View style={s.qaPill}>
              <Ionicons name="shield-checkmark" size={13} color="#FFF" />
              <Text style={s.qaPillText}>Verified</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        style={s.scrollBody}
      >
        {/* Segmented Control */}
        <View style={s.segWrap}>
          <View style={s.segBar}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => switchTab(t)}
                style={[s.segItem, tab === t && s.segItemOn]}
                activeOpacity={0.6}
              >
                <Ionicons
                  name={t === 'Overview' ? 'grid-outline' : t === 'Remedies' ? 'leaf-outline' : 'body-outline'}
                  size={14}
                  color={tab === t ? theme.primary : theme.text.subtext}
                  style={{ marginRight: 4 }}
                />
                <Text style={[s.segText, tab === t && s.segTextOn]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <Animated.View style={[s.content, { opacity: contentFade }]}>
          {tab === 'Overview' && renderOverview()}
          {tab === 'Remedies' && renderRemedies()}
          {tab === 'Yoga' && renderYoga()}
        </Animated.View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════
// Sub-Components
// ══════════════════════════════

const StatBubble = ({ val, label, gradient, s }) => (
  <View style={s.statItem}>
    <LinearGradient colors={gradient} style={s.statCircle}>
      {typeof val === 'number' ? (
        <Text style={s.statNum}>{val}</Text>
      ) : (
        <Ionicons name="sparkles" size={18} color="#FFF" />
      )}
    </LinearGradient>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const FeatureCard = ({ icon, gradient, title, text, accent, s }) => (
  <View style={s.featureCard}>
    <View style={s.featureHeader}>
      <LinearGradient colors={gradient} style={s.featureIcon}>
        <Ionicons name={icon} size={18} color="#FFF" />
      </LinearGradient>
      <Text style={s.featureTitle}>{title}</Text>
    </View>
    <View style={[s.featureAccent, { backgroundColor: accent }]} />
    <Text style={s.featureText}>{text}</Text>
  </View>
);

const Empty = ({ icon, text, s, theme }) => (
  <View style={s.empty}>
    <View style={s.emptyCircle}>
      <Ionicons name={icon} size={36} color={theme.text.subtext + '40'} />
    </View>
    <Text style={s.emptyText}>{text}</Text>
  </View>
);

// ══════════════════════════════
// Styles
// ══════════════════════════════
const mk = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background.secondary },

  // ─── Hero Gradient Banner ───
  heroBanner: {
    paddingBottom: 28,
  },
  heroNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 42, paddingHorizontal: 12,
  },
  heroNavBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  heroNavActions: { flexDirection: 'row', gap: 2 },

  heroContent: { paddingHorizontal: 24, paddingTop: 6 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10,
  },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: '#007AFF' },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#FFF', textTransform: 'capitalize' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  quickActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  qaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  qaPillText: { fontSize: 12, fontWeight: '600', color: '#FFF' },

  // ─── Scroll Body ───
  scrollBody: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, backgroundColor: t.background.secondary },

  // ─── Segmented Control ───
  segWrap: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, backgroundColor: t.background.secondary, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  segBar: { flexDirection: 'row', backgroundColor: t.background.tertiary, borderRadius: 12, padding: 3 },
  segItem: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segItemOn: {
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  segText: { fontSize: 13, fontWeight: '500', color: t.text.subtext },
  segTextOn: { color: t.primary, fontWeight: '700' },

  content: { paddingHorizontal: 20, minHeight: 300, paddingTop: 4 },

  // ─── Stats Banner ───
  statsBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly',
    backgroundColor: '#FFF', borderRadius: 22, paddingVertical: 24, marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14 },
      android: { elevation: 3 },
    }),
  },
  statItem: { alignItems: 'center', flex: 1 },
  statCircle: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNum: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, color: t.text.subtext, fontWeight: '600' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 44, backgroundColor: t.separator },

  // ─── Feature Cards ───
  featureCard: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 22, marginBottom: 16, overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  featureHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureTitle: { fontSize: 19, fontWeight: '700', color: t.text.header },
  featureAccent: { height: 3, width: 44, borderRadius: 2, marginBottom: 14 },
  featureText: { fontSize: 16, color: t.text.body, lineHeight: 26 },

  // ─── Dosha Section ───
  doshaSection: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 22, marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  doshaTitle: { fontSize: 19, fontWeight: '700', color: t.text.header, marginBottom: 18 },
  doshaRow: { flexDirection: 'row', justifyContent: 'space-around' },
  doshaItem: { alignItems: 'center', flex: 1 },
  doshaCircle: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  doshaName: { fontSize: 15, fontWeight: '700', color: t.text.header },
  doshaDesc: { fontSize: 11, color: t.text.subtext, marginTop: 2 },

  // ─── Lifestyle Card ───
  lifestyleCard: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 22, marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  lifestyleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  lifestyleIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  lifestyleTitle: { fontSize: 19, fontWeight: '700', color: t.text.header },
  lifestyleTip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  lifestyleTipBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.separator },
  lifestyleTipIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  lifestyleTipText: { flex: 1, fontSize: 14, color: t.text.body, lineHeight: 20 },

  // ─── Disclaimer ───
  disclaimerCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#FFF5E6', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#FFE0B2',
  },
  disclaimerText: { flex: 1, fontSize: 13, color: '#7A5800', lineHeight: 19 },

  // ─── Feedback ───
  feedbackCard: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 24, marginBottom: 16, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  feedbackTitle: { fontSize: 19, fontWeight: '700', color: t.text.header },
  feedbackSub: { fontSize: 13, color: t.text.subtext, marginTop: 4, marginBottom: 18 },
  feedbackRow: { flexDirection: 'row', gap: 12 },
  feedbackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: t.separator,
  },
  feedbackBtnActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
  feedbackBtnActiveNo: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  feedbackBtnText: { fontSize: 15, fontWeight: '600', color: t.text.body },
  feedbackThanks: { fontSize: 14, color: t.text.subtext, marginTop: 14, fontWeight: '500' },

  // ─── Remedy Cards ───
  remedyCard: {
    backgroundColor: '#FFF', borderRadius: 22, padding: 20, marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  remedyTop: { flexDirection: 'row', alignItems: 'center' },
  remedyIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  remedyBody: { flex: 1 },
  remedyName: { fontSize: 18, fontWeight: '700', color: t.text.header, lineHeight: 24 },
  remedySub: { fontSize: 13, color: t.text.subtext, marginTop: 3 },
  arrowCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: t.background.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  chip: { backgroundColor: t.background.secondary, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10 },
  chipText: { fontSize: 12, color: t.text.body, fontWeight: '500' },
  remedyFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  remedyTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  remedyTagText: { fontSize: 11, color: t.text.subtext, fontWeight: '500' },
  viewDetails: { fontSize: 13, color: t.primary, fontWeight: '600', marginLeft: 'auto' },

  // ─── Yoga Cards ───
  yogaCard: {
    height: 240, borderRadius: 24, overflow: 'hidden', marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  yogaImg: { width: '100%', height: '100%' },
  yogaGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%' },
  yogaInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22 },
  yogaBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  yogaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  yogaBadgeText: { fontSize: 11, color: '#FFF', fontWeight: '600' },
  yogaName: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  yogaHint: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '500' },

  // ─── Empty ───
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: t.background.tertiary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyText: { fontSize: 16, color: t.text.subtext, fontWeight: '500' },
});
