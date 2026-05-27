// src/services/uniqueId.js
import { db } from './firestore';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Generates globally unique participant IDs across all devices
 * Uses Firestore as the source of truth for ID counter
 */

export const UniqueIdService = {
  /**
   * Get next unique participant ID
   * @returns {Promise<number>} Next unique participant ID
   */
  async getNextParticipantId() {
    try {
      const counterRef = doc(db, 'system', 'participant_counter');
      
      // Try to get current counter
      const counterDoc = await getDoc(counterRef);
      
      if (!counterDoc.exists()) {
        // Initialize counter if it doesn't exist
        await setDoc(counterRef, {
          current: 1001,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        return 1001;
      }
      
      // Increment the counter atomically
      await updateDoc(counterRef, {
        current: increment(1),
        lastUpdated: new Date().toISOString()
      });
      
      // Get the updated value
      const updatedDoc = await getDoc(counterRef);
      const newId = updatedDoc.data().current;
      
      console.log('✅ Generated unique participant ID:', newId);
      return newId;
      
    } catch (error) {
      console.error('❌ Error generating unique ID:', error);
      
      // Fallback: Generate timestamp-based ID if Firestore fails
      const fallbackId = Date.now(); // Unix timestamp in milliseconds
      console.warn('⚠️ Using fallback timestamp-based ID:', fallbackId);
      return fallbackId;
    }
  },

  /**
   * Generate a compound unique ID with prefix
   * Format: MFB-YYYYMMDD-XXXXX
   * Example: MFB-20241215-01234
   */
  async generateCompoundId() {
    try {
      const baseId = await this.getNextParticipantId();
      
      // Get current date in YYYYMMDD format
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      
      // Pad the ID to 5 digits
      const paddedId = String(baseId).padStart(5, '0');
      
      // Format: PREFIX-DATE-ID
      const compoundId = `MFB-${dateStr}-${paddedId}`;
      
      console.log('✅ Generated compound ID:', compoundId);
      return compoundId;
      
    } catch (error) {
      console.error('❌ Error generating compound ID:', error);
      
      // Fallback
      const timestamp = Date.now();
      return `MFB-FALLBACK-${timestamp}`;
    }
  },

  /**
   * Validate if an ID already exists
   * @param {number|string} participantId - ID to check
   * @returns {Promise<boolean>} True if ID exists
   */
  async checkIdExists(participantId) {
    try {
      const assessmentsRef = collection(db, 'assessmentResults');
      const q = query(assessmentsRef, where('participantId', '==', participantId));
      const snapshot = await getDocs(q);
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking ID:', error);
      return false;
    }
  },

  /**
   * Get statistics about ID usage
   */
  async getIdStats() {
    try {
      const counterRef = doc(db, 'system', 'participant_counter');
      const counterDoc = await getDoc(counterRef);
      
      if (counterDoc.exists()) {
        return {
          success: true,
          data: counterDoc.data()
        };
      }
      
      return {
        success: false,
        message: 'Counter not initialized'
      };
    } catch (error) {
      console.error('Error getting ID stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default UniqueIdService;