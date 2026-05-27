import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton instance
let firebaseInstance = null;

const getFirebaseInstance = () => {
  if (firebaseInstance) {
    return firebaseInstance;
  }

  try {
    const apps = getApps();
    let app;

    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      app = apps[0];
      console.log('✅ Using existing Firebase app');
    }

    let auth;
    try {
      if (Platform.OS === 'web') {
        auth = getAuth(app);
      } else {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage)
        });
      }
    } catch (error) {
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
      } else {
        throw error;
      }
    }

    const db = getFirestore(app);

    firebaseInstance = { app, auth, db };
    return firebaseInstance;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    if (error.code === 'app/duplicate-app') {
      const app = getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);
      firebaseInstance = { app, auth, db };
      return firebaseInstance;
    }
    throw error;
  }
};

// Initialize once
const firebase = getFirebaseInstance();
export const { auth, db } = firebase;

// Auth Functions
export const loginWithFirebase = async (email, password) => {
  try {
    const { auth } = getFirebaseInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Firebase login error:', error);
    let errorMessage = 'Login failed';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection.';
        break;
      default:
        errorMessage = error.message || 'Login failed';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logoutFromFirebase = async () => {
  try {
    const { auth } = getFirebaseInstance();
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Firebase logout error:', error);
    return { success: false, error: error.message };
  }
};

// Save or update user profile in Firestore (NEW FUNCTION)
export const saveUserProfileToFirestore = async (userData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('⚠️ No authenticated user for profile save');
      return { success: false, error: 'No authenticated user' };
    }

    const userRef = doc(db, 'users', user.uid);
    
    const profileData = {
      uid: user.uid,
      email: userData.email,
      fullName: userData.fullName || user.displayName || 'Unknown',
      role: userData.role || 'clinician',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use setDoc with merge to create or update
    await setDoc(userRef, profileData, { merge: true });
    
    console.log('✅ User profile saved to Firestore:', user.uid);
    return { success: true, uid: user.uid, data: profileData };
  } catch (error) {
    console.error('❌ Error saving user profile:', error);
    return { success: false, error: error.message };
  }
};

// User Profile Functions (Settings)
export const getUserProfile = async (userId = 'default') => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const saveUserProfile = async (profileData, userId = 'default') => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, 'userProfiles', userId);
    await setDoc(docRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return { success: false, error: error.message };
  }
};

// Global participant ID — derived from max existing ID across all Firestore records
export const getNextParticipantId = async () => {
  try {
    const { db } = getFirebaseInstance();
    let maxId = 1000;

    // Scan completed assessments
    const resultsSnap = await getDocs(collection(db, 'assessmentResults'));
    resultsSnap.forEach(d => {
      const id = parseInt(d.data().participantId);
      if (!isNaN(id) && id > maxId) maxId = id;
    });

    // Scan in-progress configs (catches assessments started but not yet completed)
    const configsSnap = await getDocs(collection(db, 'assessmentConfigs'));
    configsSnap.forEach(d => {
      const id = parseInt(d.data().participantId);
      if (!isNaN(id) && id > maxId) maxId = id;
    });

    return { success: true, id: maxId + 1 };
  } catch (error) {
    console.error('Error getting next participant ID:', error);
    return { success: false, error: error.message };
  }
};

// Assessment Config Functions (NEW FUNCTION)
export const saveAssessmentConfig = async (configData) => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = await addDoc(collection(db, 'assessmentConfigs'), {
      ...configData,
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Assessment config saved to Firestore:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error saving assessment config:', error);
    return { success: false, error: error.message };
  }
};

// Assessment Results Functions
export const saveAssessmentResults = async (assessmentData) => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = await addDoc(collection(db, 'assessmentResults'), {
      ...assessmentData,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving assessment:', error);
    return { success: false, error: error.message };
  }
};

export const getAllAssessmentResults = async () => {
  try {
    const { db } = getFirebaseInstance();
    const querySnapshot = await getDocs(collection(db, 'assessmentResults'));

    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        firestoreId: doc.id,
        ...doc.data()
      });
    });

    results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return { success: true, data: results };
  } catch (error) {
    console.error('Error getting assessments:', error);
    return { success: false, error: error.message };
  }
};

export const deleteAssessmentResult = async (assessmentId) => {
  try {
    const { db } = getFirebaseInstance();
    await deleteDoc(doc(db, 'assessmentResults', assessmentId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return { success: false, error: error.message };
  }
};

// Assessment Stats
export const getAssessmentStats = async () => {
  try {
    const { db } = getFirebaseInstance();
    const querySnapshot = await getDocs(collection(db, 'assessmentResults'));
    
    let totalAssessments = 0;
    let totalScore = 0;
    let highRiskCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalAssessments++;
      
      if (data.primaryRawScore) {
        totalScore += parseFloat(data.primaryRawScore);
      }
      
      if (data.primaryFallRisk === 'High') {
        highRiskCount++;
      }
    });
    
    const avgScore = totalAssessments > 0 ? Math.round(totalScore / totalAssessments) : 0;
    const highRiskPct = totalAssessments > 0 ? Math.round((highRiskCount / totalAssessments) * 100) : 0;
    
    return {
      success: true,
      data: {
        totalAssessments,
        avgScore,
        highRiskPct
      }
    };
  } catch (error) {
    console.error('Error getting assessment stats:', error);
    return { success: false, error: error.message };
  }
};

// Assessment Progress Functions
export const saveAssessmentProgress = async (assessmentId, progressData) => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, 'assessmentProgress', assessmentId);
    await setDoc(docRef, {
      ...progressData,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving progress:', error);
    return { success: false, error: error.message };
  }
};

export const updateAssessmentStatus = async (assessmentId, statusData) => {
  try {
    const { db } = getFirebaseInstance();
    const docRef = doc(db, 'assessmentProgress', assessmentId);
    await updateDoc(docRef, {
      ...statusData,
      lastUpdated: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
};

// Sync Functions
export const syncLocalAssessments = async (assessments) => {
  try {
    let syncedCount = 0;
    let failedCount = 0;
    
    for (const assessment of assessments) {
      const result = await saveAssessmentResults(assessment);
      if (result.success) {
        syncedCount++;
      } else {
        failedCount++;
      }
    }
    
    return { success: true, syncedCount, failedCount };
  } catch (error) {
    console.error('Error syncing assessments:', error);
    return { success: false, error: error.message };
  }
};