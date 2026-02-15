import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function RecipeScreen({ route }) {
  const { remedy } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0A1A17', '#0D1F1C', '#122A24', '#0D1F1C']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.headerBadge}>
            <Ionicons name="flask" size={22} color="#0D1F1C" />
          </LinearGradient>
          <Text style={styles.title}>{remedy.remedyName}</Text>
          <View style={styles.titleUnderline} />
        </Animated.View>

        {/* Ingredients */}
        {remedy.ingredients && remedy.ingredients.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.card}>
              <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <Ionicons name="list" size={20} color="#4ADE80" />
                  </View>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{remedy.ingredients.length}</Text>
                  </View>
                </View>
                {remedy.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientRow}>
                    <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.ingredientDot} />
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </BlurView>
            </View>
          </Animated.View>
        )}

        {/* Preparation Steps */}
        {remedy.preparationSteps && remedy.preparationSteps.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.card}>
              <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
                  </View>
                  <Text style={styles.sectionTitle}>Preparation</Text>
                </View>
                {remedy.preparationSteps.map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <View style={styles.stepTimeline}>
                      <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </LinearGradient>
                      {index < remedy.preparationSteps.length - 1 && <View style={styles.stepLine} />}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  </View>
                ))}
              </BlurView>
            </View>
          </Animated.View>
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
  title: {
    fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center',
  },
  titleUnderline: { width: 40, height: 3, backgroundColor: '#4ADE80', borderRadius: 2, marginTop: 10 },

  // Cards
  card: {
    borderRadius: 22, overflow: 'hidden', marginBottom: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardBlur: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  cardIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(74,222,128,0.12)', justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 10, flex: 1 },
  countBadge: {
    backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  countText: { fontSize: 12, color: '#4ADE80', fontWeight: '700' },

  // Ingredients
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ingredientDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  ingredientText: { flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 22 },

  // Steps (timeline style)
  stepRow: { flexDirection: 'row' },
  stepTimeline: { alignItems: 'center', width: 42 },
  stepNumber: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumberText: { color: '#0D1F1C', fontWeight: '700', fontSize: 14 },
  stepLine: { width: 2, flex: 1, backgroundColor: 'rgba(74,222,128,0.2)', marginVertical: 4 },
  stepContent: { flex: 1, paddingLeft: 12, paddingBottom: 22 },
  stepText: { color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 23 },
});
