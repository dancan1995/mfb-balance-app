// src/services/analytics.js
import { db } from './firestore';
import { collection, addDoc } from 'firebase/firestore';

/**
 * Analytics Service for tracking user interactions
 * All data is saved to Firestore 'analytics' collection
 */

export const AnalyticsService = {
  /**
   * Track assessment configuration selections
   */
  async trackAssessmentConfig(data) {
    try {
      await addDoc(collection(db, 'analytics'), {
        eventType: 'assessment_config',
        timestamp: new Date().toISOString(),
        data: {
          participantId: data.participantId,
          ptName: data.ptName,
          employmentId: data.employmentId,
          currentTest: data.currentTest,
          alternateTest: data.alternateTest,
          population: data.population,
          setting: data.setting,
          seedValue: data.seedValue,
        },
        deviceInfo: {
          platform: 'mobile',
          timestamp: Date.now()
        }
      });
      console.log('📊 Tracked assessment config');
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  /**
   * Track item score selection
   */
  async trackItemScore(data) {
    try {
      await addDoc(collection(db, 'analytics'), {
        eventType: 'item_score',
        timestamp: new Date().toISOString(),
        data: {
          participantId: data.participantId,
          testType: data.testType, // 'BBS' or 'FGA'
          testPhase: data.testPhase, // 'primary' or 'alternate'
          itemNumber: data.itemNumber,
          score: data.score,
          timeSpent: data.timeSpent // seconds on this item
        }
      });
      console.log('📊 Tracked item score');
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  /**
   * Track assessment completion
   */
  async trackAssessmentComplete(data) {
    try {
      await addDoc(collection(db, 'analytics'), {
        eventType: 'assessment_complete',
        timestamp: new Date().toISOString(),
        data: {
          participantId: data.participantId,
          primaryRawScore: data.primaryRawScore,
          primaryRaschScore: data.primaryRaschScore,
          primaryFallRisk: data.primaryFallRisk,
          alternateRawScore: data.alternateRawScore,
          alternateRaschScore: data.alternateRaschScore,
          alternateFallRisk: data.alternateFallRisk,
          totalTime: data.totalTime,
          completionRate: data.completionRate // percentage of items completed
        }
      });
      console.log('📊 Tracked assessment completion');
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  /**
   * Track user navigation
   */
  async trackNavigation(screenName) {
    try {
      await addDoc(collection(db, 'analytics'), {
        eventType: 'navigation',
        timestamp: new Date().toISOString(),
        data: {
          screenName,
          timestamp: Date.now()
        }
      });
      console.log('📊 Tracked navigation:', screenName);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  /**
   * Track settings changes
   */
  async trackSettingsChange(data) {
    try {
      await addDoc(collection(db, 'analytics'), {
        eventType: 'settings_change',
        timestamp: new Date().toISOString(),
        data: {
          setting: data.setting,
          oldValue: data.oldValue,
          newValue: data.newValue
        }
      });
      console.log('📊 Tracked settings change');
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  /**
   * Track errors
   */
  async trackError(error, context) {
    try {
      await addDoc(collection(db, 'analytics'), {
        eventType: 'error',
        timestamp: new Date().toISOString(),
        data: {
          errorMessage: error.message,
          errorStack: error.stack,
          context,
        }
      });
      console.log('📊 Tracked error');
    } catch (err) {
      console.error('Analytics error:', err);
    }
  }
};

export default AnalyticsService;