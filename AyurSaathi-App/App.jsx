import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';
import RecipeScreen from './screens/RecipeScreen';
import YogaDetailScreen from './screens/YogaDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import PrakritiTestScreen from './screens/PrakritiTestScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import {
  View, Text, Image, Animated, Modal, TouchableOpacity,
  StyleSheet, Linking, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { VERSION_API_URL } from './config';
import Constants from 'expo-constants';

const Stack = createNativeStackNavigator();
const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// compare two version strings
function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

// splash screen component
function SplashScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar style="dark" />
      <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <Image source={require('./assets/icon.png')} style={{ width: 80, height: 80, borderRadius: 18, marginBottom: 20 }} />
        <Text style={{ fontSize: 34, fontWeight: '700', color: '#000', letterSpacing: -0.5 }}>AyurSathi</Text>
        <Text style={{ fontSize: 13, color: '#8E8E93', marginTop: 4, letterSpacing: 0.3 }}>Your Ayurvedic Companion</Text>
      </Animated.View>
      <View style={{ position: 'absolute', bottom: 50, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#8E8E93' }}>v{APP_VERSION}</Text>
        <Text style={{ fontSize: 12, color: '#8E8E93', marginTop: 4 }}>Made with ❤️ by Ayush Thakur</Text>
      </View>
    </View>
  );
}

// modal for app updates
function UpdateModal({ visible, onDismiss, updateInfo }) {
  if (!updateInfo) return null;

  const isMandatory = updateInfo.mandatory || compareSemver(updateInfo.minVersion, APP_VERSION) > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={us.backdrop}>
        <Animated.View style={us.card}>
          {/* Header Gradient */}
          <LinearGradient colors={['#007AFF', '#5856D6']} style={us.header}>
            <View style={us.iconCircle}>
              <Ionicons name="arrow-up-circle" size={36} color="#FFF" />
            </View>
            <Text style={us.headerTitle}>Update Available</Text>
            <Text style={us.headerVersion}>v{updateInfo.latestVersion}</Text>
          </LinearGradient>

          {/* Body */}
          <View style={us.body}>
            <Text style={us.sectionTitle}>What's New</Text>
            {updateInfo.releaseNotes?.map((note, i) => (
              <View key={i} style={us.noteRow}>
                <Text style={us.noteDot}>{note.charAt(0)}</Text>
                <Text style={us.noteText}>{note.substring(2)}</Text>
              </View>
            ))}

            <View style={us.versionInfo}>
              <Text style={us.versionLabel}>Current: v{APP_VERSION}</Text>
              <Ionicons name="arrow-forward" size={14} color="#8E8E93" />
              <Text style={us.versionLabel}>Latest: v{updateInfo.latestVersion}</Text>
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={us.updateBtn}
              activeOpacity={0.8}
              onPress={() => {
                if (updateInfo.updateUrl) Linking.openURL(updateInfo.updateUrl);
              }}
            >
              <LinearGradient colors={['#007AFF', '#5856D6']} style={us.updateBtnGrad}>
                <Ionicons name="cloud-download-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={us.updateBtnText}>Update Now</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Skip (only if not mandatory) */}
            {!isMandatory && (
              <TouchableOpacity style={us.skipBtn} onPress={onDismiss} activeOpacity={0.6}>
                <Text style={us.skipText}>Maybe Later</Text>
              </TouchableOpacity>
            )}

            {isMandatory && (
              <View style={us.mandatoryNote}>
                <Ionicons name="warning" size={14} color="#FF9500" />
                <Text style={us.mandatoryText}>This update is required to continue using the app</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const us = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  card: {
    width: '100%', maxWidth: 360, borderRadius: 24, backgroundColor: '#FFF', overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 30 },
      android: { elevation: 12 },
    }),
  },
  header: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerVersion: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },

  body: { padding: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#000', marginBottom: 14 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  noteDot: { fontSize: 16, marginRight: 10, minWidth: 20, textAlign: 'center' },
  noteText: { flex: 1, fontSize: 15, color: '#3C3C43', lineHeight: 21 },

  versionInfo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, marginTop: 8, marginBottom: 6,
    backgroundColor: '#F2F2F7', borderRadius: 12,
  },
  versionLabel: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },

  updateBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  updateBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  updateBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 15, color: '#007AFF', fontWeight: '600' },

  mandatoryNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    paddingVertical: 12, marginTop: 4,
  },
  mandatoryText: { fontSize: 12, color: '#FF9500', fontWeight: '500' },
});

// main app logic
function AppContent() {
  const { theme } = useTheme();
  const [showSplash, setShowSplash] = React.useState(true);
  const [showUpdate, setShowUpdate] = React.useState(false);
  const [updateInfo, setUpdateInfo] = React.useState(null);

  React.useEffect(() => {
    // hide splash after 2s
    const timer = setTimeout(() => setShowSplash(false), 2000);

    // check for new version
    checkForUpdate();

    return () => clearTimeout(timer);
  }, []);

  const checkForUpdate = async () => {
    try {
      const res = await fetch(VERSION_API_URL, { timeout: 5000 });
      const data = await res.json();

      if (data.latestVersion && compareSemver(data.latestVersion, APP_VERSION) > 0) {
        setUpdateInfo(data);
        // show update if available
        setTimeout(() => setShowUpdate(true), 2500);
      }
    } catch (err) {
      // ignore errors during background check
      console.log('Update check failed:', err.message);
    }
  };

  if (showSplash) return <SplashScreen />;

  return (
    <>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerTransparent: true,
            headerTintColor: theme.text.header,
            headerTitleStyle: { fontWeight: 'bold' },
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.background.primary },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Recipe" component={RecipeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="YogaDetail" component={YogaDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PrakritiTest" component={PrakritiTestScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>

      <UpdateModal
        visible={showUpdate}
        onDismiss={() => setShowUpdate(false)}
        updateInfo={updateInfo}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
