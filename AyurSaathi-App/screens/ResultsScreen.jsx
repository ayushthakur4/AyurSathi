import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
  const { theme, mode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const rawRemedy = route.params.remedy;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const remedy = {
    ...rawRemedy,
    yoga: Array.isArray(rawRemedy.yoga) ? rawRemedy.yoga : rawRemedy.yoga ? [rawRemedy.yoga] : [],
    homeRemedies: Array.isArray(rawRemedy.homeRemedies) ? rawRemedy.homeRemedies : rawRemedy.homeRemedies ? [rawRemedy.homeRemedies] : [],
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRemedyPress = (remedyItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Recipe', { remedy: remedyItem });
  };

  const handleYogaPress = (yogaItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('YogaDetail', { yoga: yogaItem });
  };

  const AnimatedCard = ({ children, delay = 0, style }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(24)).current;
    useEffect(() => {
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
      ]).start();
    }, []);
    return (
      <Animated.View style={[style, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
        {children}
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={[theme.background.primary, theme.background.secondary, theme.background.primary]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ═══ HEADER ═══ */}
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.headerBadge}>
            <Ionicons name="medical" size={22} color={theme.background.primary} />
          </LinearGradient>
          <Text style={styles.diseaseTitle}>{remedy.diseaseName}</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.resultsSubtitle}>Ayurvedic treatment plan</Text>
        </Animated.View>

        {/* ═══ AYURVEDIC ANALYSIS ═══ */}
        {remedy.ayurvedicAnalysis && (
          <AnimatedCard delay={50} style={styles.cardWrapper}>
            <View style={[styles.card, { borderColor: theme.border }]}>
              <LinearGradient colors={['rgba(249, 115, 22, 0.08)', 'transparent']} style={StyleSheet.absoluteFill} />
              <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <Ionicons name="sparkles" size={20} color={theme.primary} />
                  </View>
                  <Text style={styles.cardTitle}>Ayurvedic Analysis</Text>
                </View>
                <Text style={[styles.cardText, { fontStyle: 'italic', color: theme.secondary }]}>
                  "{remedy.ayurvedicAnalysis}"
                </Text>
              </BlurView>
            </View>
          </AnimatedCard>
        )}

        {/* ═══ HEALTH TIP ═══ */}
        {remedy.healthTip && (
          <AnimatedCard delay={100} style={styles.cardWrapper}>
            <View style={styles.card}>
              <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <Ionicons name="heart" size={20} color={theme.primary} />
                  </View>
                  <Text style={styles.cardTitle}>Health Tip</Text>
                </View>
                <Text style={styles.cardText}>{remedy.healthTip}</Text>
              </BlurView>
            </View>
          </AnimatedCard>
        )}

        {/* ═══ DOCTOR ADVICE ═══ */}
        {remedy.doctorAdvice && (
          <AnimatedCard delay={200} style={styles.cardWrapper}>
            <View style={[styles.card, styles.warningCardBorder]}>
              <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                    <Ionicons name="medkit" size={20} color={theme.warning} />
                  </View>
                  <Text style={styles.cardTitle}>Doctor Advice</Text>
                  <View style={styles.importantBadge}>
                    <Text style={styles.importantText}>Important</Text>
                  </View>
                </View>
                <Text style={styles.cardText}>{remedy.doctorAdvice}</Text>
              </BlurView>
            </View>
          </AnimatedCard>
        )}

        {/* ═══ YOGA: Movement is medicine ═══ */}
        {remedy.yoga && remedy.yoga.length > 0 && (
          <AnimatedCard delay={300} style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="body" size={20} color={theme.primary} />
              <Text style={styles.sectionHeader}>Yoga Routine</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {remedy.yoga.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleYogaPress(item)} activeOpacity={0.8}>
                  <View style={styles.yogaCard}>
                    {/* Using Bing Thumbs for speed. Pollinations was too slow here. */}
                    <Image
                      source={{ uri: `https://tse4.mm.bing.net/th?q=${encodeURIComponent(item.asanaName + ' yoga pose')}&w=400&h=400&c=7&rs=1&p=0` }}
                      style={styles.yogaImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                      style={styles.yogaGradient}
                    />

                    {/* Centered Play Button */}
                    <View style={styles.yogaCenterOverlay}>
                      <View style={styles.playCircle}>
                        <Ionicons name="play" size={24} color="#1A73E8" style={{ marginLeft: 4 }} />
                      </View>
                    </View>

                    <View style={styles.yogaOverlay}>
                      <Text style={styles.yogaName}>{item.asanaName}</Text>
                      <View style={styles.yogaDurationRow}>
                        <Ionicons name="time" size={13} color="#FDBA74" />
                        <Text style={styles.yogaDuration}>{item.duration}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </AnimatedCard>
        )}

        {/* ═══ HOME REMEDIES ═══ */}
        {remedy.homeRemedies && remedy.homeRemedies.length > 0 && (
          <AnimatedCard delay={400} style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="flask" size={20} color={theme.primary} />
              <Text style={styles.sectionHeader}>Home Remedies</Text>
            </View>
            {remedy.homeRemedies.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleRemedyPress(item)} activeOpacity={0.7}>
                <View style={styles.remedyCard}>
                  <BlurView intensity={20} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.remedyBlur}>
                    <View style={styles.remedyRow}>
                      <LinearGradient colors={[theme.background.tertiary, theme.background.secondary]} style={styles.remedyIcon}>
                        <Ionicons name="leaf" size={18} color={theme.secondary} />
                      </LinearGradient>
                      <View style={styles.remedyTextContainer}>
                        <Text style={styles.remedyName}>{item.remedyName}</Text>
                        <Text style={styles.ingredientCount}>
                          {item.ingredients?.length || 0} ingredients • Tap to view
                        </Text>
                      </View>
                      <View style={styles.chevronCircle}>
                        <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                      </View>
                    </View>
                  </BlurView>
                </View>
              </TouchableOpacity>
            ))}
          </AnimatedCard>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 90, paddingBottom: 40 },

  // Header
  headerSection: { alignItems: 'center', marginBottom: 28 },
  headerBadge: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 16,
    elevation: 8,
  },
  diseaseTitle: {
    fontSize: 30, fontWeight: '800', color: theme.text.header,
    textTransform: 'capitalize', textAlign: 'center',
  },
  titleUnderline: { width: 40, height: 3, backgroundColor: theme.primary, borderRadius: 2, marginTop: 10, marginBottom: 8 },
  resultsSubtitle: { fontSize: 14, color: theme.secondary, fontWeight: '500', opacity: 0.8 },

  // Cards
  cardWrapper: { marginBottom: 16 },
  card: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.glass },
  warningCardBorder: { borderColor: 'rgba(251, 191, 36, 0.4)' },
  cardBlur: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(26, 115, 232, 0.1)', justifyContent: 'center', alignItems: 'center', // Google Blue tint
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: theme.text.header, marginLeft: 10, flex: 1 },
  // ... (keep existing)
  // Yoga
  yogaCard: {
    width: 200, height: 220, borderRadius: 22, overflow: 'hidden', marginRight: 14,
    borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.background.tertiary
  },
  yogaImage: { width: '100%', height: '100%' },
  yogaGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' },
  yogaOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, zIndex: 2 },
  yogaCenterOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 1,
  },
  playCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)', // Clean white
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  yogaName: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  yogaDurationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  yogaDuration: { color: '#FFF', fontSize: 13, marginLeft: 5, fontWeight: '600', opacity: 0.9 },
  // ...

  // Remedies
  remedyCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 10,
    borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.glass
  },
  remedyBlur: { padding: 0 },
  remedyRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  remedyIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  remedyTextContainer: { flex: 1, marginLeft: 14 },
  remedyName: { fontSize: 16, fontWeight: '600', color: theme.text.header },
  ingredientCount: { color: theme.text.subtext, fontSize: 12, marginTop: 3 },
  chevronCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(26, 115, 232, 0.1)', justifyContent: 'center', alignItems: 'center',
  },
});
