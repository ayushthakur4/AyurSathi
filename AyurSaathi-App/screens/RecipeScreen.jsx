import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export default function RecipeScreen({ route, navigation }) {
  const { theme } = useTheme();
  const s = useMemo(() => mk(theme), [theme]);
  const { remedy } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const shareRecipe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ings = remedy.ingredients?.join(', ') || '';
    const steps = remedy.preparationSteps?.map((x, i) => `${i + 1}. ${x}`).join('\n') || '';
    try {
      await Share.share({ message: `${remedy.remedyName}\n\nIngredients: ${ings}\n\n${steps}\n\n\u2014 AyurSathi` });
    } catch (e) { }
  };

  return (
    <View style={s.root}>
      {/* Nav */}
      <View style={s.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.navBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Remedy Detail</Text>
        <TouchableOpacity onPress={shareRecipe} style={s.navBtn}>
          <Ionicons name="share-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Title */}
        <Animated.View style={[s.titleBlock, { opacity: fadeAnim }]}>
          <Text style={s.title}>{remedy.remedyName}</Text>
          <View style={s.meta}>
            <MetaPill icon="leaf-outline" label="Natural" color="#34C759" s={s} />
            <MetaPill icon="flask-outline" label={`${remedy.ingredients?.length || 0} Items`} color="#007AFF" s={s} />
          </View>
        </Animated.View>

        {/* Ingredients */}
        {remedy.ingredients?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.secLabel}>INGREDIENTS</Text>
            <View style={s.group}>
              {remedy.ingredients.map((ing, i) => (
                <View key={i} style={[s.ingRow, i < remedy.ingredients.length - 1 && s.rowBorder]}>
                  <View style={s.ingDot} />
                  <Text style={s.ingText}>{ing}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Preparation */}
        {remedy.preparationSteps?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.secLabel}>PREPARATION</Text>
            <View style={s.group}>
              {remedy.preparationSteps.map((step, i) => (
                <View key={i} style={[s.stepRow, i < remedy.preparationSteps.length - 1 && s.rowBorder]}>
                  <View style={s.stepNum}>
                    <Text style={s.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Tip */}
        <View style={s.tip}>
          <Ionicons name="lightbulb-outline" size={14} color="#FF9500" />
          <Text style={s.tipText}>Best consumed fresh. Store in a cool, dry place if needed.</Text>
        </View>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingHorizontal: 8, paddingBottom: 4,
    backgroundColor: t.background.secondary,
  },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 17, fontWeight: '600', color: t.text.header, flex: 1, textAlign: 'center' },

  titleBlock: { marginBottom: 24, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: t.text.header },
  meta: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: t.background.tertiary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  pillText: { fontSize: 12, color: t.text.body, fontWeight: '500' },

  secLabel: {
    fontSize: 13, fontWeight: '600', color: t.text.subtext,
    letterSpacing: 0.4, marginBottom: 6, marginLeft: 4, marginTop: 8,
  },

  group: {
    backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },

  // Ingredients
  ingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.separator },
  ingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.primary, marginRight: 12 },
  ingText: { flex: 1, fontSize: 17, color: t.text.header },

  // Steps
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, paddingHorizontal: 16 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: t.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1,
  },
  stepNumText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  stepText: { flex: 1, fontSize: 15, color: t.text.body, lineHeight: 22 },

  // Tip
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4, marginTop: 8 },
  tipText: { flex: 1, fontSize: 13, color: t.text.subtext, lineHeight: 18 },
});
