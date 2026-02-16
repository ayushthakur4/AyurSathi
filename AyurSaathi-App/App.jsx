import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';
import RecipeScreen from './screens/RecipeScreen';
import YogaDetailScreen from './screens/YogaDetailScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

function SplashScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background.primary, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar style="dark" />
      <View style={{ alignItems: 'center' }}>
        <View style={{
          width: 100, height: 100, borderRadius: 50, backgroundColor: theme.background.secondary,
          justifyContent: 'center', alignItems: 'center', marginBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
        }}>
          <Image source={require('./assets/icon.png')} style={{ width: 80, height: 80, resizeMode: 'contain' }} />
        </View>
        <Text style={{ fontSize: 32, fontWeight: '800', color: theme.text.header, letterSpacing: 1 }}>AyurSathi</Text>
        <Text style={{ fontSize: 14, color: theme.text.subtext, marginTop: 8, letterSpacing: 2 }}>BETA</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 50, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: theme.text.subtext }}>Made with ❤️ by</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text.header, marginTop: 4 }}>Ayush Thakur</Text>
      </View>
    </View>
  );
}

function AppContent() {
  const { theme, mode } = useTheme();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 2.0s Splash
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerTransparent: true, // Let the background show through
          headerTintColor: theme.text.header,
          headerTitleStyle: { fontWeight: 'bold' },
          animation: 'slide_from_right', // Feels native on both platforms
          contentStyle: { backgroundColor: theme.background.primary },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'AyurSathi' }} />
        <Stack.Screen name="Recipe" component={RecipeScreen} options={{ title: 'Remedy' }} />
        <Stack.Screen name="YogaDetail" component={YogaDetailScreen} options={{ title: 'Yoga' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
