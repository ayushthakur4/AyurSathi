import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Linking } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function YogaDetailScreen({ route, navigation }) {
  const { theme, mode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { yoga } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const openYouTube = () => {
    const query = yoga.youtubeSearchQuery || `${yoga.asanaName} yoga tutorial`;
    Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
  };

  return (
    <View style={styles.container}>
      {/* Background Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `https://tse4.mm.bing.net/th?q=${encodeURIComponent(yoga.asanaName + ' yoga pose')}&w=800&h=600&c=7&rs=1&p=0` }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          style={styles.heroGradient}
        />
      </View>

      {/* Content wrapper - scrolling enabled */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.spacer} />

        <Animated.View style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* 
            Glassmorphism sheet effect.
            Using 90 intensity for a solid, premium feel. 
          */}
          <BlurView intensity={90} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.blurContainer}>

            {/* Header: Title + Duration */}
            <View style={styles.headerBar}>
              <View style={styles.pill}>
                <Ionicons name="body" size={14} color={theme.primary} />
                <Text style={styles.pillText}>Yoga Asana</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="time-outline" size={16} color={theme.text.subtext} />
                <Text style={styles.durationText}>{yoga.duration}</Text>
              </View>
            </View>

            <Text style={styles.title}>{yoga.asanaName}</Text>
            <View style={styles.divider} />

            {/* Steps Section */}
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.description}>
              {yoga.steps || "Follow the video guidance for best results."}
            </Text>

            {/* Benefits Section */}
            <Text style={styles.sectionTitle}>Benefits</Text>
            <Text style={styles.description}>
              {yoga.benefits || "Promotes flexibility and mindfulness."}
            </Text>

            {/* Watch Video Button */}
            <TouchableOpacity style={styles.watchButton} onPress={openYouTube} activeOpacity={0.7}>
              <Ionicons name="logo-youtube" size={24} color="#FF0000" />
              <Text style={styles.watchButtonText}>Watch Tutorial</Text>
            </TouchableOpacity>

            {/* Practice Button - The main call to action */}
            <TouchableOpacity style={styles.practiceButton} activeOpacity={0.8} onPress={() => alert("Marked as practiced!")}>
              <LinearGradient
                colors={[theme.primary, theme.primaryDark]}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Start Practice</Text>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

          </BlurView>
        </Animated.View>
      </ScrollView>

      {/* Back Button (Absolute) */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <BlurView intensity={50} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.backButtonBlur}>
          <Ionicons name="arrow-back" size={24} color={theme.text.header} />
        </BlurView>
      </TouchableOpacity>
    </View >
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  imageContainer: { width: width, height: height * 0.5, position: 'absolute', top: 0 },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },

  scrollContent: { paddingBottom: 40 },
  spacer: { height: height * 0.35 },

  contentCard: {
    marginHorizontal: 20,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.glass,
  },
  blurContainer: { padding: 24 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  asanaName: { fontSize: 28, fontWeight: '800', color: theme.text.header, marginBottom: 8 },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(94, 234, 212, 0.1)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  durationText: { color: theme.primary, fontWeight: '600', fontSize: 13, marginLeft: 6 },

  playButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: theme.error, // YouTube Red or Accent
    justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10,
    elevation: 8,
  },

  divider: { height: 1, backgroundColor: theme.border, marginBottom: 20 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.text.header, marginBottom: 12 },
  description: { fontSize: 16, color: theme.text.body, lineHeight: 26, marginBottom: 24 },

  benefitBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.border,
  },
  benefitText: { color: theme.secondary, fontSize: 14, fontStyle: 'italic' },

  backButton: { position: 'absolute', top: 50, left: 20, borderRadius: 20, overflow: 'hidden' },
  backButtonBlur: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  practiceButton: {
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 10,
  },
  watchButtonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
