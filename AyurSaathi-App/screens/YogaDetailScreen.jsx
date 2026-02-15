import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function YogaDetailScreen({ route }) {
  const { yoga } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Hero image */}
      <Image
        source={{ uri: `https://picsum.photos/seed/${yoga.asanaName}/800/800` }}
        style={styles.heroImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(13,31,28,0.6)', '#0D1F1C']}
        style={styles.heroGradient}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.contentCard}>
            <BlurView intensity={60} tint="dark" style={styles.cardBlur}>

              {/* Title + Duration */}
              <Text style={styles.title}>{yoga.asanaName}</Text>
              <View style={styles.titleUnderline} />

              {yoga.duration && (
                <View style={styles.durationBadge}>
                  <Ionicons name="time" size={16} color="#0D1F1C" />
                  <Text style={styles.durationText}>{yoga.duration}</Text>
                </View>
              )}

              {/* Steps */}
              {yoga.howToDo && yoga.howToDo.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIconCircle}>
                      <Ionicons name="fitness" size={20} color="#4ADE80" />
                    </View>
                    <Text style={styles.sectionTitle}>How To Do</Text>
                  </View>
                  {yoga.howToDo.map((step, index) => (
                    <View key={index} style={styles.stepRow}>
                      <View style={styles.stepTimeline}>
                        <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.stepDot}>
                          <Text style={styles.stepDotText}>{index + 1}</Text>
                        </LinearGradient>
                        {index < yoga.howToDo.length - 1 && <View style={styles.stepLine} />}
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </BlurView>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F1C' },
  heroImage: { width: width, height: 380, position: 'absolute', top: 0 },
  heroGradient: { height: 380, position: 'absolute', top: 0, width: width },
  scrollContent: { paddingTop: 300, paddingHorizontal: 20, paddingBottom: 40 },

  contentCard: {
    borderRadius: 26, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.1)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16,
    elevation: 10,
  },
  cardBlur: { padding: 24 },

  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 10 },
  titleUnderline: { width: 40, height: 3, backgroundColor: '#4ADE80', borderRadius: 2, marginBottom: 16 },

  durationBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#4ADE80', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginBottom: 24,
  },
  durationText: { color: '#0D1F1C', fontSize: 14, fontWeight: '700', marginLeft: 6 },

  section: { marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  sectionIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(74,222,128,0.12)', justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: '#fff', marginLeft: 10 },

  stepRow: { flexDirection: 'row' },
  stepTimeline: { alignItems: 'center', width: 44 },
  stepDot: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotText: { color: '#0D1F1C', fontWeight: '700', fontSize: 15 },
  stepLine: { width: 2, flex: 1, backgroundColor: 'rgba(74,222,128,0.2)', marginVertical: 4 },
  stepContent: { flex: 1, paddingLeft: 14, paddingBottom: 24 },
  stepText: { flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 25 },
});
