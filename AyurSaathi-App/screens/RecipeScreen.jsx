import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function RecipeScreen({ route }) {
  const { remedy } = route.params;

  return (
    <LinearGradient colors={['#0D1F1C', '#1A3C34', '#0D1F1C']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{remedy.remedyName}</Text>

        {remedy.ingredients && remedy.ingredients.length > 0 && (
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <View style={styles.headerRow}>
              <Ionicons name="list" size={24} color="#4ADE80" />
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>
            {remedy.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.itemText}>{ingredient}</Text>
              </View>
            ))}
          </BlurView>
        )}

        {remedy.preparationSteps && remedy.preparationSteps.length > 0 && (
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <View style={styles.headerRow}>
              <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
              <Text style={styles.sectionTitle}>Preparation Steps</Text>
            </View>
            {remedy.preparationSteps.map((step, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.itemText}>{step}</Text>
              </View>
            ))}
          </BlurView>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 80 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 25 },
  card: { padding: 20, borderRadius: 30, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginTop: 8, marginRight: 12 },
  itemText: { flex: 1, color: '#ddd', fontSize: 16, lineHeight: 24 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#4ADE80', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNumberText: { color: '#0D1F1C', fontWeight: 'bold', fontSize: 14 },
});
