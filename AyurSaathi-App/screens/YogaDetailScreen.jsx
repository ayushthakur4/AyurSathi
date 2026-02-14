import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function YogaDetailScreen({ route }) {
  const { yoga } = route.params;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `https://picsum.photos/seed/${yoga.asanaName}/800/800` }}
        style={styles.heroImage}
      />
      <LinearGradient
        colors={['transparent', '#0D1F1C', '#0D1F1C']}
        style={styles.gradient}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={80} tint="dark" style={styles.contentCard}>
          <Text style={styles.title}>{yoga.asanaName}</Text>
          
          {yoga.duration && (
            <View style={styles.durationContainer}>
              <Ionicons name="time" size={20} color="#4ADE80" />
              <Text style={styles.duration}>{yoga.duration}</Text>
            </View>
          )}

          {yoga.howToDo && yoga.howToDo.length > 0 && (
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Ionicons name="fitness" size={24} color="#4ADE80" />
                <Text style={styles.sectionTitle}>How To Do</Text>
              </View>
              {yoga.howToDo.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </BlurView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F1C' },
  heroImage: { width: width, height: 400, position: 'absolute', top: 0 },
  gradient: { height: 400, position: 'absolute', top: 0, width: width },
  scrollContent: { paddingTop: 340, paddingHorizontal: 20, paddingBottom: 40 },
  contentCard: { padding: 25, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 34, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  durationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  duration: { color: '#4ADE80', fontSize: 18, marginLeft: 8 },
  section: { marginTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4ADE80', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNumberText: { color: '#0D1F1C', fontWeight: 'bold', fontSize: 16 },
  stepText: { flex: 1, color: '#ddd', fontSize: 16, lineHeight: 24 },
});
