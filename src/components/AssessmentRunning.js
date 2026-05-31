import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { BBS_ITEMS, FGA_ITEMS, BBS_ITEM_DETAILS, FGA_ITEM_DETAILS } from '../constants/items';
import { StorageService } from '../services/storage';
import { saveAssessmentProgress, updateAssessmentStatus } from '../services/firestore';
import { AnalyticsService } from '../services/analytics';
import { Ionicons } from '@expo/vector-icons';
import {
  BBS_ITEM_DIFFICULTIES,
  FGA_ITEM_DIFFICULTIES,
  selectFirstCATItem,
  estimateTheta,
  selectNextCATItem,
} from '../services/calculations';

// Stopping Criteria Constants
const STANDARD_ERROR_THRESHOLD = 0.32;
const MIN_ITEMS_BEFORE_STOP = 4;

// BBS Score Options (0-4)
const BBS_SCORE_OPTIONS = [
  { value: 4, label: 'Normal Performance', color: '#4caf50' },
  { value: 3, label: 'Mild Impairment', color: '#8bc34a' },
  { value: 2, label: 'Moderate Impairment', color: '#ffc107' },
  { value: 1, label: 'Significant Impairment', color: '#ff9800' },
  { value: 0, label: 'Unable to Perform', color: '#f44336' }
];

// FGA Score Options (0-3)
const FGA_SCORE_OPTIONS = [
  { value: 3, label: 'Normal', color: '#4caf50' },
  { value: 2, label: 'Mild Impairment', color: '#ffc107' },
  { value: 1, label: 'Moderate Impairment', color: '#ff9800' },
  { value: 0, label: 'Severe Impairment', color: '#f44336' }
];

// Not Administered Reasons
const NOT_ADMINISTERED_REASONS = [
  { value: 'safety', label: 'Safety Concerns', icon: 'shield-checkmark', description: 'Patient safety at risk' },
  { value: 'unable', label: 'Patient Unable', icon: 'hand-left', description: 'Patient physically unable to perform' },
  { value: 'cognitive', label: 'Cognitive Limitations', icon: 'brain', description: 'Cannot follow instructions' },
  { value: 'equipment', label: 'Equipment Unavailable', icon: 'construct', description: 'Required equipment not available' },
  { value: 'medical', label: 'Medical Contraindication', icon: 'medical', description: 'Medical condition prevents testing' },
  { value: 'declined', label: 'Patient Declined', icon: 'close-circle', description: 'Patient refused to perform' },
  { value: 'time', label: 'Time Constraints', icon: 'time', description: 'Insufficient time available' },
  { value: 'other', label: 'Other Reason', icon: 'ellipsis-horizontal-circle', description: 'Other unspecified reason' }
];

// Helpers
const getDifficulties = (testType) =>
  testType === 'BBS' ? BBS_ITEM_DIFFICULTIES : FGA_ITEM_DIFFICULTIES;
const getMaxScore = (testType) => (testType === 'BBS' ? 4 : 3);

// Reusable in-app confirm dialog (replaces Alert.alert for web compatibility)
function ConfirmModal({ visible, title, message, confirmText, confirmColor, onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={cmStyles.overlay}>
        <View style={cmStyles.card}>
          <Text style={cmStyles.title}>{title}</Text>
          <Text style={cmStyles.message}>{message}</Text>
          <View style={cmStyles.btns}>
            {onCancel && (
              <TouchableOpacity style={cmStyles.cancelBtn} onPress={onCancel}>
                <Text style={cmStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[cmStyles.actionBtn, { backgroundColor: confirmColor || '#dc3545' }]}
              onPress={onConfirm}
            >
              <Text style={cmStyles.actionText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const cmStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', gap: 14,
    ...Platform.select({ web: { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 }, android: { elevation: 12 } }) },
  title: { fontSize: 19, fontWeight: 'bold', color: '#1a1a2e' },
  message: { fontSize: 14, color: '#555', lineHeight: 21 },
  btns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center' },
  cancelText: { fontSize: 15, color: '#555', fontWeight: '600' },
  actionBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  actionText: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
});

// Score Button Component
function ScoreButton({ score, label, description, color, onPress, isSelected }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.scoreButtonContainer}>
      <View style={styles.scoreButtonRow}>
        <TouchableOpacity
          style={[
            styles.scoreButton,
            isSelected && { ...styles.scoreButtonActive, borderColor: color, backgroundColor: `${color}15` }
          ]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.scoreButtonContent}>
            <View style={[styles.scoreCircle, isSelected && { backgroundColor: color }]}>
              <Text style={[styles.scoreNumber, isSelected && styles.scoreNumberActive]}>{score}</Text>
            </View>
            <View style={styles.scoreTextContainer}>
              <Text style={[styles.scoreLabel, isSelected && { color: color, fontWeight: 'bold' }]}>{label}</Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={24} color={color} />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <Ionicons name={expanded ? "chevron-up-circle" : "information-circle-outline"} size={24} color="#2c5aa0" />
        </TouchableOpacity>
      </View>
      {expanded && (
        <View style={styles.descriptionBox}>
          <View style={styles.descriptionHeader}>
            <Ionicons name="document-text" size={14} color="#666" />
            <Text style={styles.descriptionTitle}>Score {score} Criteria:</Text>
          </View>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      )}
    </View>
  );
}

// Not Administered Reason Card
function NotAdminReasonCard({ reason, isSelected, onPress }) {
  return (
    <TouchableOpacity style={[styles.reasonCard, isSelected && styles.reasonCardSelected]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.reasonCardContent}>
        <View style={[styles.reasonIconCircle, isSelected && styles.reasonIconCircleSelected]}>
          <Ionicons name={reason.icon} size={24} color={isSelected ? '#fff' : '#f57c00'} />
        </View>
        <View style={styles.reasonTextContainer}>
          <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>{reason.label}</Text>
          <Text style={[styles.reasonDescription, isSelected && styles.reasonDescriptionSelected]}>{reason.description}</Text>
        </View>
        {isSelected && (
          <View style={styles.reasonCheckmark}>
            <Ionicons name="checkmark-circle" size={28} color="#4caf50" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AssessmentRunning({ assessmentData, onComplete, onCancel }) {
  const isResumedSession = assessmentData.testPhase && assessmentData.primaryScores;

  // ── CAT order initialisation ────────────────────────────────────────────────
  // primaryCatOrder / alternateCatOrder: arrays of 1-based item numbers in the
  // adaptive administration sequence. Grows by one entry after each scored item.
  const [primaryCatOrder, setPrimaryCatOrder] = useState(() => {
    if (isResumedSession && assessmentData.primaryCatOrder?.length > 0) {
      return assessmentData.primaryCatOrder;
    }
    return [selectFirstCATItem(getDifficulties(assessmentData.currentTest))];
  });

  const [alternateCatOrder, setAlternateCatOrder] = useState(() => {
    if (isResumedSession && assessmentData.alternateCatOrder?.length > 0) {
      return assessmentData.alternateCatOrder;
    }
    // If resumed mid-alternate phase but no catOrder saved, start from scratch
    if (isResumedSession && assessmentData.testPhase === 'alternate') {
      return [selectFirstCATItem(getDifficulties(assessmentData.alternateTest))];
    }
    return []; // populated when startAlternateTest() is called
  });

  // ── Session state ───────────────────────────────────────────────────────────
  const [testPhase, setTestPhase] = useState(isResumedSession ? assessmentData.testPhase : 'primary');
  const [currentItemIndex, setCurrentItemIndex] = useState(isResumedSession ? (assessmentData.currentItemIndex || 0) : 0);

  // Scores stored ITEM-INDEXED: scores[itemNum - 1] holds the score for that item.
  // Unadministered items remain null; Not-Administered items are -1.
  const [primaryScores, setPrimaryScores] = useState(
    isResumedSession && assessmentData.primaryScores
      ? assessmentData.primaryScores
      : Array(assessmentData.currentTest === 'BBS' ? 14 : 10).fill(null)
  );
  const [alternateScores, setAlternateScores] = useState(
    isResumedSession && assessmentData.alternateScores
      ? assessmentData.alternateScores
      : Array(assessmentData.alternateTest === 'BBS' ? 14 : 10).fill(null)
  );

  const initialElapsed = isResumedSession ? (assessmentData.elapsedTime || 0) : 0;
  const [startTime] = useState(new Date(Date.now() - initialElapsed * 1000));
  const [elapsed, setElapsed] = useState(initialElapsed);

  const itemStartTimestampRef = React.useRef(Date.now());
  const elapsedRef = React.useRef(initialElapsed);
  const [primaryItemDurations, setPrimaryItemDurations] = useState({});
  const [alternateItemDurations, setAlternateItemDurations] = useState({});

  const [primaryThresholdTimeSec, setPrimaryThresholdTimeSec] = useState(null);
  const [primaryThresholdItemCount, setPrimaryThresholdItemCount] = useState(null);
  const [alternateThresholdTimeSec, setAlternateThresholdTimeSec] = useState(null);
  const [alternateThresholdItemCount, setAlternateThresholdItemCount] = useState(null);

  const [notAdministeredReason, setNotAdministeredReason] = useState('');
  const [showInstruction, setShowInstruction] = useState(false);
  const [showNotAdminOptions, setShowNotAdminOptions] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState(null);
  const [showTransitionModal, setShowTransitionModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    visible: false, title: '', message: '', confirmText: 'OK', confirmColor: '#dc3545', onConfirm: null, onCancel: null,
  });
  const showConfirm = (title, message, confirmText, confirmColor, onConfirm, withCancel = true) => {
    setConfirmModal({
      visible: true, title, message, confirmText, confirmColor,
      onConfirm,
      onCancel: withCancel ? () => setConfirmModal(p => ({ ...p, visible: false })) : null,
    });
  };
  const hideConfirm = () => setConfirmModal(p => ({ ...p, visible: false }));

  const [stoppingCriteriaMet, setStoppingCriteriaMet] = useState(false);
  const [standardError, setStandardError] = useState(null);

  // ── Derived values for current item ────────────────────────────────────────
  const currentTest = testPhase === 'primary' ? assessmentData.currentTest : assessmentData.alternateTest;
  const items = currentTest === 'BBS' ? BBS_ITEMS : FGA_ITEMS;
  const itemDetails = currentTest === 'BBS' ? BBS_ITEM_DETAILS : FGA_ITEM_DETAILS;
  const scoreOptions = currentTest === 'BBS' ? BBS_SCORE_OPTIONS : FGA_SCORE_OPTIONS;
  const scores = testPhase === 'primary' ? primaryScores : alternateScores;
  const catOrder = testPhase === 'primary' ? primaryCatOrder : alternateCatOrder;

  // 1-based item number currently being presented (adaptive selection)
  const currentItemNum = catOrder[currentItemIndex] ?? 1;
  const currentScore = scores[currentItemNum - 1];
  const currentItemDetail = itemDetails[currentItemNum];

  // ── Resume notification ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isResumedSession) {
      const completedCount = [...assessmentData.primaryScores, ...assessmentData.alternateScores].filter(s => s !== null).length;
      Alert.alert(
        'Session Resumed',
        `Continuing from ${testPhase === 'primary' ? 'Primary' : 'Alternate'} test, Item ${currentItemIndex + 1}\n\n` +
        `${completedCount} items already completed\n` +
        `Elapsed time: ${formatTime(initialElapsed)}`,
        [{ text: 'Continue', style: 'default' }]
      );
    }
  }, []);

  // ── Standard Error tracking ────────────────────────────────────────────────
  const calculateStandardError = (scoreArray) => {
    const validScores = scoreArray.filter(s => s !== null && s >= 0);
    if (validScores.length < MIN_ITEMS_BEFORE_STOP) return null;
    const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const variance = validScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / validScores.length;
    return Math.sqrt(variance / validScores.length);
  };

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    itemStartTimestampRef.current = Date.now();
  }, [currentItemIndex, testPhase]);

  useEffect(() => {
    if (testPhase === 'primary') {
      const se = calculateStandardError(primaryScores);
      setStandardError(se);
      if (se !== null && se <= STANDARD_ERROR_THRESHOLD) {
        setStoppingCriteriaMet(true);
        if (primaryThresholdTimeSec === null) {
          setPrimaryThresholdTimeSec(elapsedRef.current);
          setPrimaryThresholdItemCount(primaryScores.filter(s => s !== null).length);
        }
      }
    } else {
      const se = calculateStandardError(alternateScores);
      setStandardError(se);
      if (se !== null && se <= STANDARD_ERROR_THRESHOLD) {
        setStoppingCriteriaMet(true);
        if (alternateThresholdTimeSec === null) {
          setAlternateThresholdTimeSec(elapsedRef.current);
          setAlternateThresholdItemCount(alternateScores.filter(s => s !== null).length);
        }
      }
    }
  }, [primaryScores, alternateScores, testPhase]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((new Date() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Auto-save every 30 s
  useEffect(() => {
    const interval = setInterval(autoSaveProgress, 30000);
    return () => clearInterval(interval);
  }, [testPhase, currentItemIndex, primaryScores, alternateScores, elapsed, primaryCatOrder, alternateCatOrder]);

  const autoSaveProgress = async () => {
    if (!assessmentData.firestoreId) return;
    const completedCount = [...primaryScores, ...alternateScores].filter(s => s !== null).length;
    if (completedCount === 0) return;
    const progressData = {
      testPhase, currentItemIndex, primaryScores, alternateScores,
      primaryCatOrder, alternateCatOrder,
      elapsedTime: elapsed, lastUpdated: new Date().toISOString()
    };
    if (JSON.stringify(progressData) !== JSON.stringify(lastSavedProgress)) {
      const result = await saveAssessmentProgress(assessmentData.firestoreId, progressData);
      if (result.success) setLastSavedProgress(progressData);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Record duration by item number (item-indexed)
  const recordItemDuration = (idx = currentItemIndex, phase = testPhase) => {
    const duration = Math.round((Date.now() - itemStartTimestampRef.current) / 1000);
    const order = phase === 'primary' ? primaryCatOrder : alternateCatOrder;
    const itemNum = order[idx];
    if (!itemNum) return;
    if (phase === 'primary') {
      setPrimaryItemDurations(prev => ({ ...prev, [itemNum]: duration }));
    } else {
      setAlternateItemDurations(prev => ({ ...prev, [itemNum]: duration }));
    }
  };

  // ── CAT helpers ─────────────────────────────────────────────────────────────

  // Compute SE synchronously from a fresh score array (avoids stale state)
  const computeSE = (scoreArray) => {
    const validScores = scoreArray.filter(s => s !== null && s >= 0);
    if (validScores.length < MIN_ITEMS_BEFORE_STOP) return null;
    const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const variance = validScores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / validScores.length;
    return Math.sqrt(variance / validScores.length);
  };

  // Append next adaptive item and advance to it; or end the phase
  const advanceCAT = (newScores, currentCatOrder, setCatOrder, phase) => {
    const testType = phase === 'primary' ? assessmentData.currentTest : assessmentData.alternateTest;
    const difficulties = getDifficulties(testType);
    const maxScore = getMaxScore(testType);

    const se = computeSE(newScores);
    const stoppingNow = se !== null && se <= STANDARD_ERROR_THRESHOLD;
    const allAdministered = currentCatOrder.length >= items.length;

    if (stoppingNow || allAdministered) {
      // CAT stopping criterion met — end this phase
      setTimeout(() => {
        if (phase === 'primary') setShowTransitionModal(true);
        else completeAssessment();
      }, 400);
    } else {
      // Select next item adaptively
      const theta = estimateTheta(currentCatOrder, newScores, difficulties, maxScore);
      const nextItem = selectNextCATItem(theta, currentCatOrder, difficulties);

      if (nextItem === null) {
        // All items exhausted
        setTimeout(() => {
          if (phase === 'primary') setShowTransitionModal(true);
          else completeAssessment();
        }, 400);
      } else {
        setCatOrder(prev => [...prev, nextItem]);
        setTimeout(() => {
          setCurrentItemIndex(prev => prev + 1);
          setShowInstruction(false);
          setShowNotAdminOptions(false);
        }, 300);
      }
    }
  };

  // ── Score selection ─────────────────────────────────────────────────────────
  const handleScoreSelect = async (score) => {
    recordItemDuration();

    try {
      await AnalyticsService.trackItemScore({
        participantId: assessmentData.participantId,
        testType: currentTest,
        testPhase,
        itemNumber: currentItemNum,
        score,
        timeSpent: elapsed
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }

    // Store score at item-indexed position
    const newScores = [...scores];
    newScores[currentItemNum - 1] = score;

    if (testPhase === 'primary') {
      setPrimaryScores(newScores);
      advanceCAT(newScores, primaryCatOrder, setPrimaryCatOrder, 'primary');
    } else {
      setAlternateScores(newScores);
      advanceCAT(newScores, alternateCatOrder, setAlternateCatOrder, 'alternate');
    }
  };

  // ── Start alternate test ────────────────────────────────────────────────────
  const startAlternateTest = () => {
    setShowTransitionModal(false);
    setTestPhase('alternate');
    setCurrentItemIndex(0);
    // Initialise alternate CAT order with the first adaptive item
    const firstItem = selectFirstCATItem(getDifficulties(assessmentData.alternateTest));
    setAlternateCatOrder([firstItem]);
    setShowInstruction(false);
    setShowNotAdminOptions(false);
    setStoppingCriteriaMet(false);
    if (assessmentData.firestoreId) {
      updateAssessmentStatus(assessmentData.firestoreId, {
        status: 'alternate_phase',
        primaryTestCompleted: true,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  // ── Manual Next button ──────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentScore === null) {
      Alert.alert('No Score Selected', 'Please select a score or skip this item to continue.');
      return;
    }
    // If stopping criteria already met or no more adaptive items, end the phase
    if (stoppingCriteriaMet || catOrder.length <= currentItemIndex + 1) {
      if (testPhase === 'primary') setShowTransitionModal(true);
      else completeAssessment();
    } else {
      setCurrentItemIndex(currentItemIndex + 1);
      setShowInstruction(false);
      setShowNotAdminOptions(false);
    }
  };

  // ── Skip (no score) ─────────────────────────────────────────────────────────
  const handleSkip = () => {
    showConfirm(
      'Skip Item',
      'Skip this item without recording a score?',
      'Skip',
      '#ff9800',
      () => {
        hideConfirm();
        recordItemDuration();

        const testType = testPhase === 'primary' ? assessmentData.currentTest : assessmentData.alternateTest;
        const difficulties = getDifficulties(testType);
        const maxScore = getMaxScore(testType);
        const setCatOrder = testPhase === 'primary' ? setPrimaryCatOrder : setAlternateCatOrder;

        // Compute theta from previously scored items (current item has no score)
        const scoredSoFar = catOrder.slice(0, currentItemIndex);
        const theta = estimateTheta(scoredSoFar, scores, difficulties, maxScore);
        const nextItem = selectNextCATItem(theta, catOrder, difficulties);

        if (nextItem !== null && catOrder.length < items.length) {
          setCatOrder(prev => [...prev, nextItem]);
          setCurrentItemIndex(currentItemIndex + 1);
          setShowInstruction(false);
          setShowNotAdminOptions(false);
        } else {
          if (testPhase === 'primary') setShowTransitionModal(true);
          else completeAssessment();
        }
      }
    );
  };

  // ── Back ────────────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      setShowInstruction(false);
      setShowNotAdminOptions(false);
    } else if (testPhase === 'alternate') {
      showConfirm(
        'Go Back to Primary Test?',
        'Return to the last item of the primary assessment?',
        'Go Back',
        '#2c5aa0',
        () => {
          hideConfirm();
          setTestPhase('primary');
          setCurrentItemIndex(primaryCatOrder.length - 1);
          setShowInstruction(false);
          setShowNotAdminOptions(false);
        }
      );
    }
  };

  // ── Not Administered ────────────────────────────────────────────────────────
  const handleNotAdminReasonSelect = (reason) => setNotAdministeredReason(reason);

  const markNotAdministered = () => {
    if (!notAdministeredReason) {
      Alert.alert('Error', 'Please select a reason for not administering this item.');
      return;
    }

    const testType = testPhase === 'primary' ? assessmentData.currentTest : assessmentData.alternateTest;
    const difficulties = getDifficulties(testType);
    const maxScore = getMaxScore(testType);
    const setCatOrder = testPhase === 'primary' ? setPrimaryCatOrder : setAlternateCatOrder;

    // Record -1 score at item-indexed position
    const newScores = [...scores];
    newScores[currentItemNum - 1] = -1;
    if (testPhase === 'primary') setPrimaryScores(newScores);
    else setAlternateScores(newScores);

    recordItemDuration();
    setNotAdministeredReason('');
    setShowNotAdminOptions(false);

    // estimateTheta ignores -1 entries; select next item based on valid scores only
    const theta = estimateTheta(catOrder, newScores, difficulties, maxScore);
    const nextItem = selectNextCATItem(theta, catOrder, difficulties);

    setTimeout(() => {
      if (nextItem !== null && catOrder.length < items.length) {
        setCatOrder(prev => [...prev, nextItem]);
        setCurrentItemIndex(prev => prev + 1);
        setShowInstruction(false);
      } else {
        if (testPhase === 'primary') setShowTransitionModal(true);
        else completeAssessment();
      }
    }, 300);
  };

  // ── Complete assessment ──────────────────────────────────────────────────────
  const completeAssessment = () => {
    const primaryRaw = primaryScores.filter(s => s !== null && s >= 0).reduce((a, b) => a + b, 0);
    const alternateRaw = alternateScores.filter(s => s !== null && s >= 0).reduce((a, b) => a + b, 0);

    const primaryRasch = primaryRaw * 1.2;
    const alternateRasch = alternateRaw * 1.15;

    const primaryRisk = assessmentData.currentTest === 'BBS'
      ? (primaryRaw >= 50 ? 'Low' : primaryRaw >= 40 ? 'Moderate' : 'High')
      : (primaryRaw >= 22 ? 'Low' : primaryRaw >= 15 ? 'Moderate' : 'High');

    const alternateRisk = assessmentData.alternateTest === 'BBS'
      ? (alternateRaw >= 50 ? 'Low' : alternateRaw >= 40 ? 'Moderate' : 'High')
      : (alternateRaw >= 22 ? 'Low' : alternateRaw >= 15 ? 'Moderate' : 'High');

    if (isResumedSession && assessmentData.sessionId) {
      StorageService.deleteSavedSession(assessmentData.sessionId).catch(() => {});
    }

    onComplete({
      primaryRawScore: primaryRaw,
      primaryRaschScore: primaryRasch,
      primaryFallRisk: primaryRisk,
      alternateRawScore: alternateRaw,
      alternateRaschScore: alternateRasch,
      alternateFallRisk: alternateRisk,
      totalTime: elapsed,
      primaryScores,
      alternateScores,
      primaryCatOrder,
      alternateCatOrder,
      primaryItemDurations,
      alternateItemDurations,
      primaryThresholdTimeSec,
      primaryThresholdItemCount,
      alternateThresholdTimeSec,
      alternateThresholdItemCount,
    });
  };

  // ── Save & Exit ─────────────────────────────────────────────────────────────
  const handleSaveAndExit = () => {
    showConfirm(
      'Save & Exit',
      'Save your progress and continue this assessment later from the Saved Sessions tab?',
      'Save & Exit',
      '#00acc1',
      async () => {
        hideConfirm();
        const session = {
          ...assessmentData,
          testPhase,
          currentItemIndex,
          primaryScores,
          alternateScores,
          primaryCatOrder,
          alternateCatOrder,
          elapsedTime: elapsed,
          saveTime: new Date().toISOString(),
        };

        const sessionId = assessmentData.sessionId || `session_${Date.now()}`;
        const localResult = await StorageService.saveSession(sessionId, session);

        if (assessmentData.firestoreId) {
          const progressData = {
            testPhase, currentItemIndex,
            primaryScores, alternateScores,
            primaryCatOrder, alternateCatOrder,
            elapsedTime: elapsed, lastUpdated: new Date().toISOString(),
          };
          await saveAssessmentProgress(assessmentData.firestoreId, progressData);
          await updateAssessmentStatus(assessmentData.firestoreId, {
            status: 'paused', lastUpdated: new Date().toISOString(),
          });
        }

        if (localResult.success) {
          onCancel();
        } else {
          showConfirm('Save Failed', 'Could not save the session. Please try again.', 'OK', '#2c5aa0', hideConfirm, false);
        }
      }
    );
  };

  // ── Stop & Discard ──────────────────────────────────────────────────────────
  const handleStop = () => {
    showConfirm(
      'Stop Assessment',
      'Are you sure you want to stop? All progress will be lost and this assessment will be cancelled.',
      'Stop & Discard',
      '#dc3545',
      async () => {
        hideConfirm();
        if (assessmentData.firestoreId) {
          await updateAssessmentStatus(assessmentData.firestoreId, {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
          });
        }
        onCancel();
      }
    );
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const administeredInPhase = catOrder.length; // items selected for this phase so far
  const completedCount = scores.filter(s => s !== null).length;
  const progress = (currentItemIndex / Math.max(administeredInPhase, 1)) * 100;
  const progressBarColor = stoppingCriteriaMet ? '#4caf50' : '#ff9800';

  return (
    <View style={styles.container}>
      <View style={styles.timerHeader}>
        <View style={styles.timerContainer}>
          <Ionicons name="timer" size={24} color="#fff" />
          <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
        </View>
        <View style={styles.testBadge}>
          <Text style={styles.testBadgeText}>
            {testPhase === 'primary' ? 'Primary' : 'Alternate'}: {currentTest}
          </Text>
        </View>
      </View>

      {isResumedSession && (
        <View style={styles.resumedBanner}>
          <Ionicons name="play-circle" size={20} color="#4caf50" />
          <Text style={styles.resumedText}>Session Resumed</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                CAT Item {currentItemIndex + 1}
              </Text>
              <Text style={[styles.progressPercentage, { color: progressBarColor }]}>
                Item #{currentItemNum}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${Math.min(100, progress)}%`,
                backgroundColor: progressBarColor
              }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.completedText}>
                {completedCount} item{completedCount !== 1 ? 's' : ''} scored
              </Text>
            </View>

            {/* Stopping Criteria Indicator */}
            {stoppingCriteriaMet && (
              <View style={styles.stoppingCriteriaCard}>
                <Ionicons name="checkmark-done-circle" size={24} color="#4caf50" />
                <View style={styles.stoppingCriteriaTextContainer}>
                  <Text style={styles.stoppingCriteriaTitle}>
                    Stopping Criteria Reached
                  </Text>
                  <Text style={styles.stoppingCriteriaSubtext}>
                    Standard Error: {standardError?.toFixed(3)} ≤ {STANDARD_ERROR_THRESHOLD}
                  </Text>
                  <Text style={styles.stoppingCriteriaNote}>
                    Proceed to complete the assessment
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Item Card */}
        <Card style={styles.itemCard}>
          <Card.Content>
            <View style={styles.itemHeader}>
              <View style={styles.itemNumberBadge}>
                <Text style={styles.itemNumberText}>#{currentItemNum}</Text>
              </View>
              <Text style={styles.itemTitle}>{items[currentItemNum - 1]}</Text>
            </View>

            {currentItemDetail?.instruction && (
              <View style={styles.instructionSection}>
                <TouchableOpacity
                  style={styles.instructionToggle}
                  onPress={() => setShowInstruction(!showInstruction)}
                  activeOpacity={0.7}
                >
                  <View style={styles.instructionToggleContent}>
                    <Ionicons name="book-outline" size={18} color="#2c5aa0" />
                    <Text style={styles.instructionToggleText}>
                      {showInstruction ? 'Hide Instructions' : 'Show Instructions'}
                    </Text>
                  </View>
                  <Ionicons name={showInstruction ? "chevron-up" : "chevron-down"} size={20} color="#2c5aa0" />
                </TouchableOpacity>

                {showInstruction && (
                  <View style={styles.instructionBox}>
                    <View style={styles.instructionHeader}>
                      <Ionicons name="information-circle" size={16} color="#f57c00" />
                      <Text style={styles.instructionHeaderText}>Instructions:</Text>
                    </View>
                    <Text style={styles.instructionText}>{currentItemDetail.instruction}</Text>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Score Selection Card */}
        <Card style={styles.scoreCard}>
          <Card.Content>
            <View style={styles.scoreTitleRow}>
              <View style={styles.scoreTitleLeft}>
                <Ionicons name="star" size={18} color="#2c5aa0" />
                <Text style={styles.sectionTitle}>Select Score</Text>
              </View>
              <Text style={styles.scoreHint}>Tap score to auto-advance</Text>
            </View>
            <View style={styles.scoresContainer}>
              {scoreOptions.map((option) => {
                const scoreDetail = currentItemDetail?.scores?.[option.value];
                return (
                  <ScoreButton
                    key={option.value}
                    score={option.value}
                    label={option.label}
                    description={scoreDetail?.description || option.label}
                    color={option.color}
                    onPress={() => handleScoreSelect(option.value)}
                    isSelected={currentScore === option.value}
                  />
                );
              })}
            </View>
          </Card.Content>
        </Card>

        {/* Not Administered Card */}
        <Card style={styles.notAdminCard}>
          <Card.Content>
            <TouchableOpacity
              style={styles.notAdminHeader}
              onPress={() => setShowNotAdminOptions(!showNotAdminOptions)}
              activeOpacity={0.7}
            >
              <View style={styles.notAdminHeaderLeft}>
                <Ionicons name="alert-circle" size={20} color="#f57c00" />
                <Text style={styles.sectionTitle}>Item Not Administered</Text>
              </View>
              <Ionicons name={showNotAdminOptions ? "chevron-up" : "chevron-down"} size={24} color="#f57c00" />
            </TouchableOpacity>

            {showNotAdminOptions && (
              <View style={styles.notAdminContent}>
                <Text style={styles.notAdminSubtitle}>Select reason for not administering:</Text>
                <View style={styles.reasonCardsContainer}>
                  {NOT_ADMINISTERED_REASONS.map((reason) => (
                    <NotAdminReasonCard
                      key={reason.value}
                      reason={reason}
                      isSelected={notAdministeredReason === reason.value}
                      onPress={() => handleNotAdminReasonSelect(reason.value)}
                    />
                  ))}
                </View>
                {notAdministeredReason && (
                  <Button mode="contained" onPress={markNotAdministered} style={styles.notAdminButton} icon="close-circle">
                    Mark as Not Administered
                  </Button>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Summary Card */}
        {completedCount > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>
                <Ionicons name="stats-chart" size={18} color="#4caf50" /> Current Summary
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{completedCount}</Text>
                  <Text style={styles.summaryLabel}>Scored</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {scores.filter(s => s !== null && s >= 0).reduce((a, b) => a + b, 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Score</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {scores.filter(s => s === -1).length}
                  </Text>
                  <Text style={styles.summaryLabel}>Not Admin.</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <Button
            mode="outlined"
            onPress={handleBack}
            disabled={currentItemIndex === 0 && testPhase === 'primary'}
            style={[styles.navButton, styles.backButton]}
            icon="arrow-left"
          >
            Back
          </Button>
          <Button
            mode="outlined"
            onPress={handleSkip}
            style={[styles.navButton, styles.skipButton]}
            icon="play-skip-forward"
            textColor="#ff9800"
          >
            Skip
          </Button>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          <Button mode="outlined" onPress={handleSaveAndExit} style={styles.controlButton} icon="content-save" textColor="#00acc1">
            Save & Exit
          </Button>
          <Button mode="text" onPress={handleStop} style={styles.controlButton} textColor="#d32f2f" icon="stop-circle">
            Stop Assessment
          </Button>
        </View>
      </ScrollView>

      {/* General-purpose confirm modal */}
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />

      {/* Phase Transition Modal */}
      <Modal visible={showTransitionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={56} color="#4caf50" />
            <Text style={styles.modalTitle}>Primary Test Complete!</Text>
            <Text style={styles.modalMessage}>
              {assessmentData.currentTest} completed.{'\n'}Ready to start the {assessmentData.alternateTest}?
            </Text>
            <Button
              mode="contained"
              onPress={startAlternateTest}
              style={styles.modalButton}
              labelStyle={styles.modalButtonLabel}
              icon={() => <Ionicons name="arrow-forward-circle" size={20} color="white" />}
            >
              Start {assessmentData.alternateTest}
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center' },
  timerHeader: {
    backgroundColor: '#2c5aa0',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }
    }),
  },
  resumedBanner: {
    backgroundColor: '#e8f5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  resumedText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  testBadge: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  testBadgeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  scrollView: { flex: 1, width: '100%' },
  scrollContent: { padding: 16, paddingBottom: 30, width: '100%', maxWidth: 960, alignSelf: 'center' },
  progressCard: { marginBottom: 12, borderRadius: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  progressPercentage: { fontSize: 16, fontWeight: 'bold', color: '#2c5aa0' },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#4caf50' },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completedText: { fontSize: 13, color: '#666' },
  stoppingCriteriaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    gap: 12,
  },
  stoppingCriteriaTextContainer: { flex: 1 },
  stoppingCriteriaTitle: { fontSize: 15, fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 },
  stoppingCriteriaSubtext: { fontSize: 13, color: '#388e3c', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  stoppingCriteriaNote: { fontSize: 12, color: '#558b2f', fontStyle: 'italic' },
  itemCard: { marginBottom: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#2c5aa0' },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  itemNumberBadge: { backgroundColor: '#e3f2fd', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  itemNumberText: { color: '#2c5aa0', fontWeight: 'bold', fontSize: 16 },
  itemTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333', lineHeight: 24 },
  instructionSection: { marginTop: 4 },
  instructionToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  instructionToggleContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  instructionToggleText: { fontSize: 14, fontWeight: '600', color: '#2c5aa0' },
  instructionBox: { marginTop: 8, backgroundColor: '#fff8e1', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#f57c00' },
  instructionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  instructionHeaderText: { fontSize: 13, fontWeight: 'bold', color: '#e65100' },
  instructionText: { fontSize: 14, color: '#5d4037', lineHeight: 20 },
  scoreCard: { marginBottom: 12, borderRadius: 12 },
  scoreTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  scoreHint: { fontSize: 11, color: '#4caf50', fontStyle: 'italic', fontWeight: '600' },
  scoresContainer: { gap: 10 },
  scoreButtonContainer: { marginBottom: 4 },
  scoreButtonRow: { flexDirection: 'row', gap: 8 },
  scoreButton: { flex: 1, backgroundColor: 'white', borderWidth: 2, borderColor: '#e0e0e0', borderRadius: 12, padding: 14 },
  scoreButtonActive: { borderWidth: 2 },
  scoreButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  scoreNumber: { fontSize: 18, fontWeight: 'bold', color: '#666' },
  scoreNumberActive: { color: 'white' },
  scoreTextContainer: { flex: 1 },
  scoreLabel: { fontSize: 15, fontWeight: '500', color: '#333' },
  infoButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e3f2fd', borderRadius: 12 },
  descriptionBox: { marginTop: 8, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#2c5aa0' },
  descriptionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  descriptionTitle: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  descriptionText: { fontSize: 13, color: '#555', lineHeight: 19 },
  notAdminCard: { marginBottom: 12, borderRadius: 12, backgroundColor: '#fff8e1' },
  notAdminHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  notAdminHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notAdminContent: { marginTop: 12 },
  notAdminSubtitle: { fontSize: 14, color: '#666', marginBottom: 12, fontWeight: '500' },
  reasonCardsContainer: { gap: 10, marginBottom: 16 },
  reasonCard: { backgroundColor: 'white', borderWidth: 2, borderColor: '#f57c00', borderRadius: 12, padding: 14 },
  reasonCardSelected: { backgroundColor: '#fff3e0', borderColor: '#f57c00', borderWidth: 2 },
  reasonCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reasonIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff3e0', justifyContent: 'center', alignItems: 'center' },
  reasonIconCircleSelected: { backgroundColor: '#f57c00' },
  reasonTextContainer: { flex: 1 },
  reasonLabel: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 },
  reasonLabelSelected: { color: '#e65100', fontWeight: 'bold' },
  reasonDescription: { fontSize: 13, color: '#666' },
  reasonDescriptionSelected: { color: '#5d4037' },
  reasonCheckmark: { marginLeft: 8 },
  notAdminButton: { backgroundColor: '#f57c00' },
  summaryCard: { marginBottom: 12, borderRadius: 12, backgroundColor: '#e8f5e9' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  navigationButtons: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  navButton: { flex: 1 },
  backButton: { borderColor: '#2c5aa0' },
  skipButton: { borderColor: '#ff9800' },
  controlButtons: { gap: 10 },
  controlButton: { borderWidth: 1, borderColor: '#e0e0e0' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 },
      android: { elevation: 12 },
      web: { boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
    }),
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginTop: 4 },
  modalMessage: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  modalButton: { marginTop: 8, backgroundColor: '#2c5aa0', width: '100%', borderRadius: 10 },
  modalButtonLabel: { fontSize: 16, fontWeight: 'bold' },
});
