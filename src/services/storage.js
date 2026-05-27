import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PARTICIPANT_COUNTER: '@participant_counter',
  ASSESSMENTS: '@assessments',
  SAVED_SESSIONS: '@saved_sessions',
  LANGUAGE: '@language',
  NOTIFICATIONS: '@notifications',
  SOUND_ENABLED: '@sound_enabled',
  AUTO_SAVE: '@auto_save',
  TERMS_ACCEPTED: '@terms_accepted',
  USERS: '@users',
  CURRENT_USER: '@current_user',
};

export const StorageService = {
  // Participant Counter
  async getParticipantCounter() {
    try {
      const value = await AsyncStorage.getItem(KEYS.PARTICIPANT_COUNTER);
      return value ? parseInt(value) : 1001;
    } catch (error) {
      console.error('Error getting participant counter:', error);
      return 1001;
    }
  },

  async incrementParticipantCounter() {
    try {
      const current = await this.getParticipantCounter();
      const next = current + 1;
      await AsyncStorage.setItem(KEYS.PARTICIPANT_COUNTER, next.toString());
      return next;
    } catch (error) {
      console.error('Error incrementing counter:', error);
      return current + 1;
    }
  },

  // Assessments
  async getAssessments() {
    try {
      const value = await AsyncStorage.getItem(KEYS.ASSESSMENTS);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting assessments:', error);
      return [];
    }
  },

  async saveAssessment(assessment) {
    try {
      const assessments = await this.getAssessments();
      const newAssessment = {
        ...assessment,
        id: Date.now().toString(),
        dateTime: new Date().toISOString()
      };
      assessments.push(newAssessment);
      await AsyncStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(assessments));
      return { success: true };
    } catch (error) {
      console.error('Error saving assessment:', error);
      return { success: false, error };
    }
  },

  async deleteAssessment(assessmentId) {
    try {
      const assessments = await this.getAssessments();
      const filtered = assessments.filter(a => a.id !== assessmentId);
      await AsyncStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Error deleting assessment:', error);
      return { success: false, error };
    }
  },

  // Saved Sessions
  async getSavedSessions() {
    try {
      const value = await AsyncStorage.getItem(KEYS.SAVED_SESSIONS);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error getting saved sessions:', error);
      return {};
    }
  },

  async saveSessions(sessions) {
    try {
      await AsyncStorage.setItem(KEYS.SAVED_SESSIONS, JSON.stringify(sessions));
      return { success: true };
    } catch (error) {
      console.error('Error saving sessions:', error);
      return { success: false, error };
    }
  },

  async saveSession(sessionId, sessionData) {
    try {
      const sessions = await this.getSavedSessions();
      sessions[sessionId] = {
        ...sessionData,
        saveTime: new Date().toISOString()
      };
      await AsyncStorage.setItem(KEYS.SAVED_SESSIONS, JSON.stringify(sessions));
      return { success: true };
    } catch (error) {
      console.error('Error saving session:', error);
      return { success: false, error };
    }
  },

  async deleteSavedSession(sessionId) {
    try {
      const sessions = await this.getSavedSessions();
      delete sessions[sessionId];
      await AsyncStorage.setItem(KEYS.SAVED_SESSIONS, JSON.stringify(sessions));
      return { success: true };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { success: false, error };
    }
  },

  // Language
  async getLanguage() {
    try {
      const value = await AsyncStorage.getItem(KEYS.LANGUAGE);
      return value || 'en';
    } catch (error) {
      console.error('Error getting language:', error);
      return 'en';
    }
  },

  async saveLanguage(language) {
    try {
      await AsyncStorage.setItem(KEYS.LANGUAGE, language);
      return { success: true };
    } catch (error) {
      console.error('Error saving language:', error);
      return { success: false, error };
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const value = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      return value !== null ? JSON.parse(value) : true;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return true;
    }
  },

  async saveNotifications(enabled) {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(enabled));
      return { success: true };
    } catch (error) {
      console.error('Error saving notifications:', error);
      return { success: false, error };
    }
  },

  // Sound Enabled
  async getSoundEnabled() {
    try {
      const value = await AsyncStorage.getItem(KEYS.SOUND_ENABLED);
      return value !== null ? JSON.parse(value) : true;
    } catch (error) {
      console.error('Error getting sound enabled:', error);
      return true;
    }
  },

  async saveSoundEnabled(enabled) {
    try {
      await AsyncStorage.setItem(KEYS.SOUND_ENABLED, JSON.stringify(enabled));
      return { success: true };
    } catch (error) {
      console.error('Error saving sound enabled:', error);
      return { success: false, error };
    }
  },

  // Auto Save
  async getAutoSave() {
    try {
      const value = await AsyncStorage.getItem(KEYS.AUTO_SAVE);
      return value !== null ? JSON.parse(value) : true;
    } catch (error) {
      console.error('Error getting auto save:', error);
      return true;
    }
  },

  async saveAutoSave(enabled) {
    try {
      await AsyncStorage.setItem(KEYS.AUTO_SAVE, JSON.stringify(enabled));
      return { success: true };
    } catch (error) {
      console.error('Error saving auto save:', error);
      return { success: false, error };
    }
  },

  // Terms & Conditions Acceptance
  async getTermsAcceptance() {
    try {
      const value = await AsyncStorage.getItem(KEYS.TERMS_ACCEPTED);
      return value === 'true';
    } catch (error) {
      console.error('Error getting terms acceptance:', error);
      return false;
    }
  },

  async saveTermsAcceptance(accepted) {
    try {
      await AsyncStorage.setItem(KEYS.TERMS_ACCEPTED, accepted.toString());
      return { success: true };
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
      return { success: false, error };
    }
  },

  // User Management
  async getUsers() {
    try {
      const value = await AsyncStorage.getItem(KEYS.USERS);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async saveUser(user) {
    try {
      const users = await this.getUsers();
      users.push(user);
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
      return { success: true };
    } catch (error) {
      console.error('Error saving user:', error);
      return { success: false, error };
    }
  },

  async getCurrentUser() {
    try {
      const value = await AsyncStorage.getItem(KEYS.CURRENT_USER);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async saveCurrentUser(user) {
    try {
      await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.error('Error saving current user:', error);
      return { success: false, error };
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem(KEYS.CURRENT_USER);
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error };
    }
  },

  // Clear All Data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.ASSESSMENTS,
        KEYS.SAVED_SESSIONS,
        KEYS.PARTICIPANT_COUNTER
      ]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing all data:', error);
      return { success: false, error };
    }
  },

  // Reset Settings to Default
  async resetSettings() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.LANGUAGE,
        KEYS.NOTIFICATIONS,
        KEYS.SOUND_ENABLED,
        KEYS.AUTO_SAVE
      ]);
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error };
    }
  },

  // Get all storage info (useful for debugging)
  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      return data.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {};
    }
  },
};