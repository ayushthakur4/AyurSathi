import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Keyboard, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';

import { API_URL } from '../config';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleSearch = async () => {
    if (!query.trim()) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setLoading(true);
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      const url = `${API_URL}/${encodeURIComponent(query)}`;
      console.log('Fetching:', url);
      const response = await axios.get(url, { timeout: 10000 });
      console.log('Response:', response.data);
      navigation.navigate('Results', { remedy: response.data });
    } catch (error) {
      console.error('Error:', error.message);
      let message;
      if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please check that the backend server is running.';
      } else if (error.message?.includes('Network Error')) {
        message = `Cannot connect to server at ${API_URL}. Make sure the backend is running and your device is on the same network.`;
      } else {
        message = error.response?.data?.error || 'Unable to connect to the server. Please ensure the backend is running.';
      }
      Alert.alert('Connection Error', message);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <LinearGradient
      colors={['#0D1F1C', '#1A3C34', '#0D1F1C']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Ionicons name="leaf" size={60} color="#4ADE80" />
          <Text style={styles.title}>AyurSaathi</Text>
          <Text style={styles.subtitle}>Ancient Wisdom × Modern Care</Text>
        </Animated.View>

        <View style={styles.searchContainer}>
          <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tell us your problem..."
              placeholderTextColor="#888"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </BlurView>
        </View>

        <TouchableOpacity
          style={[styles.button, !query.trim() && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={!query.trim() || loading}
        >
          <LinearGradient
            colors={['#4ADE80', '#22C55E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Consulting Ancient Texts...' : 'Heal Me'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {loading && (
          <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
            <Ionicons name="book" size={30} color="#4ADE80" />
            <Text style={styles.loadingText}>Consulting Ancient Texts...</Text>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#4ADE80', marginTop: 5 },
  searchContainer: { marginBottom: 30, borderRadius: 20, overflow: 'hidden' },
  blurContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 18, color: '#fff' },
  button: { borderRadius: 30, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: 30 },
  buttonText: { color: '#0D1F1C', fontSize: 20, fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', marginTop: 30 },
  loadingText: { color: '#4ADE80', fontSize: 16, marginTop: 10 },
});
