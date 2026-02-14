import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';
import RecipeScreen from './screens/RecipeScreen';
import YogaDetailScreen from './screens/YogaDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'AyurSaathi' }} />
        <Stack.Screen name="Recipe" component={RecipeScreen} options={{ title: 'Remedy' }} />
        <Stack.Screen name="YogaDetail" component={YogaDetailScreen} options={{ title: 'Yoga' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
