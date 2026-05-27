import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AssessmentScreen from './src/screens/AssessmentScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AssessmentDetailScreen from './src/screens/AssessmentDetailScreen';
import SavedSessionsScreen from './src/screens/SavedSessionsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TermsAndConditionsScreen from './src/screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import AdminScreen from './src/screens/AdminScreen';
import { StorageService } from './src/services/storage';
import { auth } from './src/services/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const LightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3c8dbc',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
    notification: '#ff9500',
  },
};

function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Assessment') iconName = focused ? 'clipboard' : 'clipboard-outline';
          else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Saved') iconName = focused ? 'save' : 'save-outline';
          else if (route.name === 'Dashboard') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3c8dbc',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#000000',
        tabBarStyle: { backgroundColor: '#ffffff' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Assessment" component={AssessmentScreen} options={{ title: 'Assessment' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Saved" component={SavedSessionsScreen} options={{ title: 'Saved' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Tab.Screen 
        name="AssessmentDetail" 
        component={AssessmentDetailScreen}
        options={{ 
          title: 'Assessment Details',
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tab.Screen 
        name="TermsAndConditions" 
        component={TermsAndConditionsScreen}
        options={{ 
          title: 'Terms & Conditions',
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Privacy Policy',
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          title: 'Admin Panel',
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Listen to Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase Auth State Changed:', firebaseUser ? firebaseUser.email : 'No user');
      
      if (firebaseUser) {
        // User is logged in to Firebase
        console.log('✅ Firebase user detected:', firebaseUser.email);
        
        // Check if user is also saved locally
        const localUser = await StorageService.getCurrentUser();
        
        if (!localUser) {
          // Save to local storage if not already there
          const user = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            loginAt: new Date().toISOString(),
          };
          await StorageService.saveCurrentUser(user);
          console.log('💾 Saved user to local storage');
        }
        
        setIsLoggedIn(true);
      } else {
        // User is logged out
        console.log('❌ No Firebase user');
        await StorageService.logout();
        setIsLoggedIn(false);
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#ff9500" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 14 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={MD3LightTheme}>
      <NavigationContainer theme={LightTheme}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            </>
          ) : (
            <Stack.Screen name="MainApp" component={MainAppTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}