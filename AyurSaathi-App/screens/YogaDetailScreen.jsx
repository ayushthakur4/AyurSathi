import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Linking, Share, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function YogaDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const s = useMemo(() => mk(theme), [theme]);
  const { yoga } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const openYouTube = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const q = yoga.youtubeSearchQuery || `${yoga.asanaName} yoga tutorial`;
    Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
  };

  const shareYoga = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${yoga.asanaName} \u2014 ${yoga.duration}\n\n${yoga.steps || ''}\n\nBenefits: ${yoga.benefits || ''}\n\n\u2014 AyurSathi`,
      });
    } catch (e) { }
  };

  return (
    <View style={s.root}>
      {/* Hero */}
      <View style={s.heroWrap}>
        <Image
          source={{ uri: `https://tse4.mm.bing.net/th?q=${encodeURIComponent(yoga.asanaName + ' yoga pose')}&w=800&h=600&c=7&rs=1&p=0` }}
          style={s.heroImg}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={s.heroGrad} />
      </View>

      {/* Nav Buttons */}
      <View style={s.topNav}>
        <TouchableOpacity style={s.topBtn} onPress={() => navigation.goBack()}>
          <BlurView intensity={60} tint="dark" style={s.topBtnInner}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
        <TouchableOpacity style={s.topBtn} onPress={shareYoga}>
          <BlurView intensity={60} tint="dark" style={s.topBtnInner}>
            <Ionicons name="share-outline" size={20} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.spacer} />

        <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Title */}
          <Text style={s.title}>{yoga.asanaName}</Text>
          <View style={s.meta}>
            <MetaPill icon="time-outline" label={yoga.duration} color="#007AFF" s={s} />
            <MetaPill icon="body-outline" label="Yoga Asana" color="#5856D6" s={s} />
          </View>

          {/* Instructions */}
          <Text style={s.secLabel}>HOW TO PERFORM</Text>
          <View style={s.group}>
            <Text style={s.bodyText}>
              {yoga.steps || 'Follow the video tutorial for step-by-step guidance. Maintain steady breathing throughout.'}
            </Text>
          </View>

          {/* Benefits */}
          <Text style={s.secLabel}>BENEFITS</Text>
          <View style={s.group}>
            <Text style={s.bodyText}>
              {yoga.benefits || 'Improves flexibility, reduces stress, and enhances mind-body balance.'}
            </Text>
          </View>

          {/* YouTube Button */}
          <TouchableOpacity style={s.ytBtn} onPress={openYouTube} activeOpacity={0.75}>
            <Ionicons name="logo-youtube" size={20} color="#FF3B30" />
            <Text style={s.ytText}>Watch Video Tutorial</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.text.subtext + '50'} />
          </TouchableOpacity>

          {/* Practice Button */}
          <TouchableOpacity
            style={s.practiceBtn}
            activeOpacity={0.75}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              alert('Awesome! Marked as practiced today \uD83C\uDF89');
            }}
          >
            <Text style={s.practiceBtnText}>Mark as Practiced</Text>
          </TouchableOpacity>

          {/* Tip */}
          <View style={s.tip}>
            <Ionicons name="lightbulb-outline" size={14} color="#FF9500" />
            <Text style={s.tipText}>Practice on an empty stomach for best results. Morning is ideal.</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const MetaPill = ({ icon, label, color, s }) => (
  <View style={s.pill}>
    <Ionicons name={icon} size={13} color={color} />
    <Text style={s.pillText}>{label}</Text>
  </View>
);

const mk = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background.secondary },

  heroWrap: { width, height: height * 0.40, position: 'absolute', top: 0 },
  heroImg: { width: '100%', height: '100%' },
  heroGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },

  topNav: {
    position: 'absolute', top: Platform.OS === 'ios' ? 52 : 40, left: 16, right: 16, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  topBtn: { borderRadius: 22, overflow: 'hidden' },
  topBtnInner: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  scroll: { paddingBottom: 40 },
  spacer: { height: height * 0.30 },

  card: {
    marginHorizontal: 16, borderRadius: 20, backgroundColor: t.background.secondary, padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },

  title: { fontSize: 28, fontWeight: '800', color: t.text.header, marginBottom: 10 },
  meta: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: t.background.tertiary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  pillText: { fontSize: 12, color: t.text.body, fontWeight: '500' },

  secLabel: {
    fontSize: 13, fontWeight: '600', color: t.text.subtext,
    letterSpacing: 0.4, marginBottom: 6, marginLeft: 4,
  },
  group: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  bodyText: { fontSize: 15, color: t.text.body, lineHeight: 24 },

  // YouTube row — iOS list style
  ytBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  ytText: { flex: 1, fontSize: 17, fontWeight: '500', color: t.text.header },

  // Practice Button — iOS prominent style
  practiceBtn: {
    backgroundColor: t.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  practiceBtnText: { color: '#FFF', fontSize: 17, fontWeight: '600' },

  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4 },
  tipText: { flex: 1, fontSize: 13, color: t.text.subtext, lineHeight: 18 },
});
