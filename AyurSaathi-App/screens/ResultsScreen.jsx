import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
  const rawRemedy = route.params.remedy;

  // Defensive: normalize yoga to always be an array
  const remedy = {
    ...rawRemedy,
    yoga: Array.isArray(rawRemedy.yoga) ? rawRemedy.yoga : rawRemedy.yoga ? [rawRemedy.yoga] : [],
    homeRemedies: Array.isArray(rawRemedy.homeRemedies) ? rawRemedy.homeRemedies : rawRemedy.homeRemedies ? [rawRemedy.homeRemedies] : [],
  };

  const handleRemedyPress = (remedyItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Recipe', { remedy: remedyItem });
  };

  const handleYogaPress = (yogaItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('YogaDetail', { yoga: yogaItem });
  };

  return (
    <LinearGradient colors={['#0D1F1C', '#1A3C34', '#0D1F1C']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.diseaseTitle}>{remedy.diseaseName}</Text>

        {remedy.healthTip && (
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <Ionicons name="heart" size={24} color="#4ADE80" />
            <Text style={styles.sectionTitle}>Health Tip</Text>
            <Text style={styles.cardText}>{remedy.healthTip}</Text>
          </BlurView>
        )}

        {remedy.doctorAdvice && (
          <BlurView intensity={60} tint="dark" style={[styles.card, styles.warningCard]}>
            <Ionicons name="medkit" size={24} color="#F97316" />
            <Text style={styles.sectionTitle}>Doctor Advice</Text>
            <Text style={styles.cardText}>{remedy.doctorAdvice}</Text>
          </BlurView>
        )}

        {remedy.yoga && remedy.yoga.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>🧘 Yoga Routine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {remedy.yoga.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleYogaPress(item)}>
                  <BlurView intensity={60} tint="dark" style={styles.yogaCard}>
                    <Image
                      source={{ uri: `https://picsum.photos/seed/${item.asanaName}/400/400` }}
                      style={styles.yogaImage}
                    />
                    <BlurView intensity={80} tint="dark" style={styles.yogaOverlay}>
                      <Text style={styles.yogaName}>{item.asanaName}</Text>
                      <Text style={styles.yogaDuration}>{item.duration}</Text>
                    </BlurView>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {remedy.homeRemedies && remedy.homeRemedies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>🧪 Home Remedies</Text>
            {remedy.homeRemedies.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleRemedyPress(item)}>
                <BlurView intensity={60} tint="dark" style={styles.remedyCard}>
                  <View style={styles.remedyContent}>
                    <Ionicons name="leaf" size={24} color="#4ADE80" />
                    <View style={styles.remedyTextContainer}>
                      <Text style={styles.remedyName}>{item.remedyName}</Text>
                      <Text style={styles.ingredientCount}>
                        {item.ingredients?.length || 0} ingredients
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 80 },
  diseaseTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20, textTransform: 'capitalize' },
  card: { padding: 20, borderRadius: 30, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  warningCard: { borderColor: 'rgba(249,115,22,0.3)', borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 10, marginBottom: 8 },
  cardText: { color: '#ddd', fontSize: 15, lineHeight: 22 },
  section: { marginBottom: 25 },
  sectionHeader: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  yogaCard: { width: 180, height: 250, borderRadius: 30, overflow: 'hidden', marginRight: 15 },
  yogaImage: { width: '100%', height: '60%' },
  yogaOverlay: { height: '40%', justifyContent: 'center', padding: 15 },
  yogaName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  yogaDuration: { color: '#4ADE80', fontSize: 14, marginTop: 5 },
  remedyCard: { borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  remedyContent: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  remedyTextContainer: { flex: 1, marginLeft: 15 },
  remedyName: { fontSize: 17, fontWeight: '600', color: '#fff' },
  ingredientCount: { color: '#888', fontSize: 13, marginTop: 3 },
});
