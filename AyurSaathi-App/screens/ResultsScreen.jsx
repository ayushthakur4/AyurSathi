import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
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
    <LinearGradient colors={['#0A1A17', '#0D1F1C', '#122A24', '#0D1F1C']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ═══ HEADER ═══ */}
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.headerBadge}>
            <Ionicons name="medical" size={22} color="#0D1F1C" />
          </LinearGradient>
          <Text style={styles.diseaseTitle}>{remedy.diseaseName}</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.resultsSubtitle}>Ayurvedic treatment plan</Text>
        </Animated.View>

        {/* ═══ AYURVEDIC ANALYSIS ═══ */}
        {remedy.ayurvedicAnalysis && (
          <AnimatedCard delay={50} style={styles.cardWrapper}>
            <View style={[styles.card, { borderColor: 'rgba(74,222,128,0.3)' }]}>
              <LinearGradient colors={['rgba(74,222,128,0.05)', 'transparent']} style={StyleSheet.absoluteFill} />
              <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <Ionicons name="sparkles" size={20} color="#4ADE80" />
                  </View>
                  <Text style={styles.cardTitle}>Ayurvedic Analysis</Text>
                </View>
                <Text style={[styles.cardText, { fontStyle: 'italic', color: '#D1FAE5' }]}>
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
              <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <Ionicons name="heart" size={20} color="#4ADE80" />
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
              <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(249,115,22,0.15)' }]}>
                    <Ionicons name="medkit" size={20} color="#F97316" />
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

        {/* ═══ YOGA ═══ */}
        {remedy.yoga && remedy.yoga.length > 0 && (
          <AnimatedCard delay={300} style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="body" size={20} color="#4ADE80" />
              <Text style={styles.sectionHeader}>Yoga Routine</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {remedy.yoga.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleYogaPress(item)} activeOpacity={0.8}>
                  <View style={styles.yogaCard}>
                    <Image
                      source={{ uri: `https://source.unsplash.com/400x400/?yoga,${encodeURIComponent(item.imageKeyword || item.asanaName)}` }}
                      style={styles.yogaImage}
                      contentFit="cover"
                      transition={500}
                    />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.yogaGradient} />
                    <View style={styles.yogaOverlay}>
                      <Text style={styles.yogaName}>{item.asanaName}</Text>
                      <View style={styles.yogaDurationRow}>
                        <Ionicons name="time" size={13} color="#4ADE80" />
                        <Text style={styles.yogaDuration}>{item.duration}</Text>
                      </View>
                    </View>
                    {/* YouTube Button */}
                    <TouchableOpacity
                      style={styles.youtubeButton}
                      onPress={(e) => {
                        e.stopPropagation && e.stopPropagation();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const query = item.youtubeSearchQuery || `${item.asanaName} yoga tutorial`;
                        Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-youtube" size={18} color="#FF0000" />
                    </TouchableOpacity>
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
              <Ionicons name="flask" size={20} color="#4ADE80" />
              <Text style={styles.sectionHeader}>Home Remedies</Text>
            </View>
            {remedy.homeRemedies.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleRemedyPress(item)} activeOpacity={0.7}>
                <View style={styles.remedyCard}>
                  <BlurView intensity={30} tint="dark" style={styles.remedyBlur}>
                    <View style={styles.remedyRow}>
                      <LinearGradient colors={['#065F46', '#059669']} style={styles.remedyIcon}>
                        <Ionicons name="leaf" size={18} color="#fff" />
                      </LinearGradient>
                      <View style={styles.remedyTextContainer}>
                        <Text style={styles.remedyName}>{item.remedyName}</Text>
                        <Text style={styles.ingredientCount}>
                          {item.ingredients?.length || 0} ingredients • Tap to view
                        </Text>
                      </View>
                      <View style={styles.chevronCircle}>
                        <Ionicons name="chevron-forward" size={16} color="#4ADE80" />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 90, paddingBottom: 40 },

  // Header
  headerSection: { alignItems: 'center', marginBottom: 28 },
  headerBadge: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#4ADE80', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 16,
    elevation: 8,
  },
  diseaseTitle: {
    fontSize: 30, fontWeight: '800', color: '#fff',
    textTransform: 'capitalize', textAlign: 'center',
  },
  titleUnderline: { width: 40, height: 3, backgroundColor: '#4ADE80', borderRadius: 2, marginTop: 10, marginBottom: 8 },
  resultsSubtitle: { fontSize: 14, color: 'rgba(167,243,208,0.7)', fontWeight: '500' },

  // Cards
  cardWrapper: { marginBottom: 16 },
  card: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  warningCardBorder: { borderColor: 'rgba(249,115,22,0.25)' },
  cardBlur: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(74,222,128,0.12)', justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginLeft: 10, flex: 1 },
  cardText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 23 },
  importantBadge: {
    backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  importantText: { fontSize: 11, color: '#F97316', fontWeight: '600' },

  // Sections
  sectionWrapper: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionHeader: { fontSize: 20, fontWeight: '700', color: '#fff', marginLeft: 8 },

  // Yoga
  yogaCard: {
    width: 185, height: 260, borderRadius: 22, overflow: 'hidden', marginRight: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  yogaImage: { width: '100%', height: '100%' },
  yogaGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  yogaOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  yogaName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  yogaDurationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  yogaDuration: { color: '#4ADE80', fontSize: 13, marginLeft: 5, fontWeight: '500' },
  youtubeButton: {
    position: 'absolute', top: 10, right: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
    elevation: 5,
  },

  // Remedies
  remedyCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  remedyBlur: { padding: 0 },
  remedyRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  remedyIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  remedyTextContainer: { flex: 1, marginLeft: 14 },
  remedyName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  ingredientCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 },
  chevronCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(74,222,128,0.1)', justifyContent: 'center', alignItems: 'center',
  },
});
