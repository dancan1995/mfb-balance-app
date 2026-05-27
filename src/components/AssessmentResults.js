import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storage';
import { saveAssessmentResults, updateAssessmentStatus } from '../services/firestore';

export default function AssessmentResults({ results, assessmentData, onNewAssessment }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPrimaryScores, setShowPrimaryScores] = useState(false);
  const [showAlternateScores, setShowAlternateScores] = useState(false);

  const handleSave = async () => {
    const completedAt = new Date().toISOString();
    const assessment = {
      // Participant & session info
      participantId: assessmentData.participantId,
      clinicianName: assessmentData.clinicianName || assessmentData.ptName || 'Unknown',
      clinicianEmail: assessmentData.clinicianEmail || 'Unknown',
      clinicianId: assessmentData.clinicianId || '',
      population: assessmentData.population,
      setting: assessmentData.setting,
      primaryCAT: assessmentData.currentTest,
      alternateCAT: assessmentData.alternateTest,
      seedValue: assessmentData.seedValue || 'None',

      // Primary test results
      primaryRawScore: results.primaryRawScore,
      primaryRaschScore: results.primaryRaschScore.toFixed(2),
      primaryFallRisk: results.primaryFallRisk,
      primaryScores: results.primaryScores || [],
      primaryItemDurations: results.primaryItemDurations || {},
      primaryThresholdTimeSec: results.primaryThresholdTimeSec ?? null,
      primaryThresholdItemCount: results.primaryThresholdItemCount ?? null,

      // Alternate test results
      alternateRawScore: results.alternateRawScore,
      alternateRaschScore: results.alternateRaschScore.toFixed(2),
      alternateScores: results.alternateScores || [],
      alternateItemDurations: results.alternateItemDurations || {},
      alternateThresholdTimeSec: results.alternateThresholdTimeSec ?? null,
      alternateThresholdItemCount: results.alternateThresholdItemCount ?? null,

      // Timing
      totalTimeSec: results.totalTime,
      totalTimeMin: (results.totalTime / 60).toFixed(1),

      // Date/time
      completedAt,
    };

    // Save to local storage
    const saveResult = await StorageService.saveAssessment(assessment);
    if (saveResult.success) {
      console.log('Assessment saved to local storage');
    }

    // Save results to Firestore
    const firestoreResult = await saveAssessmentResults(assessment);
    
    if (firestoreResult.success) {
      console.log('Assessment results saved to Firestore:', firestoreResult.id);
      
      // If we have the original config's firestoreId, update its status
      if (assessmentData.firestoreId) {
        await updateAssessmentStatus(assessmentData.firestoreId, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          resultsId: firestoreResult.id
        });
      }
      
      Alert.alert('Success', 'Assessment saved to history and cloud');
    } else {
      Alert.alert('Success', 'Assessment saved to local history');
      console.warn('Failed to save to Firestore:', firestoreResult.error);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return '#28a745';
      case 'Moderate': return '#ffc107';
      case 'High': return '#dc3545';
      default: return '#666';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'Low': return 'checkmark-circle';
      case 'Moderate': return 'warning';
      case 'High': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  React.useEffect(() => {
    handleSave();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <View style={styles.header}>
            <Ionicons name="checkmark-circle" size={48} color="#4caf50" />
            <Text style={styles.title}>Assessment Complete!</Text>
          </View>

          {/* PRIMARY FALL RISK HIGHLIGHT */}
          <View style={[styles.fallRiskCard, { backgroundColor: getRiskColor(results.primaryFallRisk) + '15' }]}>
            <View style={styles.fallRiskHeader}>
              <Ionicons 
                name={getRiskIcon(results.primaryFallRisk)} 
                size={32} 
                color={getRiskColor(results.primaryFallRisk)} 
              />
              <Text style={styles.fallRiskTitle}>Fall Risk Assessment</Text>
            </View>
            <View style={[styles.fallRiskBadgeLarge, { backgroundColor: getRiskColor(results.primaryFallRisk) }]}>
              <Text style={styles.fallRiskTextLarge}>{results.primaryFallRisk} Risk</Text>
            </View>
            <Text style={styles.fallRiskSubtitle}>
              Based on {assessmentData.currentTest} assessment
            </Text>
          </View>

          {/* Assessment Details Card */}
          <TouchableOpacity 
            style={styles.detailsToggle}
            onPress={() => setShowDetails(!showDetails)}
            activeOpacity={0.7}
          >
            <View style={styles.detailsToggleHeader}>
              <Ionicons name="document-text" size={20} color="#2c5aa0" />
              <Text style={styles.detailsToggleText}>Assessment Details</Text>
            </View>
            <Ionicons 
              name={showDetails ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#2c5aa0" 
            />
          </TouchableOpacity>

          {showDetails && (
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Participant ID:</Text>
                <Text style={styles.detailValue}>{assessmentData.participantId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PT/Clinician:</Text>
                <Text style={styles.detailValue}>{assessmentData.ptName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Employment ID:</Text>
                <Text style={styles.detailValue}>{assessmentData.employmentId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Population:</Text>
                <Text style={styles.detailValue}>{assessmentData.population}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Setting:</Text>
                <Text style={styles.detailValue}>{assessmentData.setting}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{new Date().toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Time:</Text>
                <Text style={styles.detailValue}>{formatTime(results.totalTime)}</Text>
              </View>
              {assessmentData.seedValue && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Seed Value:</Text>
                  <Text style={styles.detailValue}>{assessmentData.seedValue}</Text>
                </View>
              )}
            </View>
          )}

          {/* Primary Results */}
          <View style={[styles.resultPanel, styles.primaryPanel]}>
            <View style={styles.panelHeader}>
              <Ionicons name="trophy" size={24} color="#2196f3" />
              <Text style={styles.panelTitle}>{assessmentData.currentTest} Results</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Raw Score:</Text>
              <Text style={styles.resultValue}>{results.primaryRawScore}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Rasch Score:</Text>
              <Text style={styles.resultValue}>{results.primaryRaschScore.toFixed(2)}</Text>
            </View>

            {/* Primary Item Scores Toggle */}
            {results.primaryScores && (
              <>
                <TouchableOpacity
                  style={styles.scoresToggle}
                  onPress={() => setShowPrimaryScores(!showPrimaryScores)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.scoresToggleText}>
                    {showPrimaryScores ? 'Hide' : 'Show'} Item Scores
                  </Text>
                  <Ionicons 
                    name={showPrimaryScores ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#2196f3" 
                  />
                </TouchableOpacity>

                {showPrimaryScores && (
                  <View style={styles.itemScoresContainer}>
                    {results.primaryScores.map((score, idx) => (
                      <View key={idx} style={styles.itemScoreRow}>
                        <Text style={styles.itemScoreLabel}>Item {idx + 1}:</Text>
                        <Text style={[
                          styles.itemScoreValue,
                          score === -1 && styles.itemScoreNA
                        ]}>
                          {score === -1 ? 'N/A' : score}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Alternate Results - NO FALL RISK */}
          <View style={[styles.resultPanel, styles.alternatePanel]}>
            <View style={styles.panelHeader}>
              <Ionicons name="ribbon" size={24} color="#9c27b0" />
              <Text style={styles.panelTitle}>{assessmentData.alternateTest} Results</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Raw Score:</Text>
              <Text style={styles.resultValue}>{results.alternateRawScore}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Rasch Score:</Text>
              <Text style={styles.resultValue}>{results.alternateRaschScore.toFixed(2)}</Text>
            </View>
            {/* FALL RISK REMOVED FROM ALTERNATE */}

            {/* Alternate Item Scores Toggle */}
            {results.alternateScores && (
              <>
                <TouchableOpacity
                  style={styles.scoresToggle}
                  onPress={() => setShowAlternateScores(!showAlternateScores)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.scoresToggleText}>
                    {showAlternateScores ? 'Hide' : 'Show'} Item Scores
                  </Text>
                  <Ionicons 
                    name={showAlternateScores ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#9c27b0" 
                  />
                </TouchableOpacity>

                {showAlternateScores && (
                  <View style={styles.itemScoresContainer}>
                    {results.alternateScores.map((score, idx) => (
                      <View key={idx} style={styles.itemScoreRow}>
                        <Text style={styles.itemScoreLabel}>Item {idx + 1}:</Text>
                        <Text style={[
                          styles.itemScoreValue,
                          score === -1 && styles.itemScoreNA
                        ]}>
                          {score === -1 ? 'N/A' : score}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Action Button - Only New Assessment */}
          <Button
            mode="contained"
            onPress={onNewAssessment}
            style={styles.newButton}
            icon={() => <Ionicons name="add-circle" size={20} color="white" />}
          >
            New Assessment
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    alignItems: 'center',
  },
  card: {
    margin: 16,
    borderRadius: 16,
    width: '100%',
    maxWidth: 960,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginTop: 12,
  },
  fallRiskCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  fallRiskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fallRiskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  fallRiskBadgeLarge: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  fallRiskTextLarge: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fallRiskSubtitle: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  detailsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailsToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c5aa0',
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  resultPanel: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryPanel: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  alternatePanel: {
    backgroundColor: '#f3e5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoresToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  scoresToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196f3',
  },
  itemScoresContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 12,
    borderRadius: 8,
  },
  itemScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemScoreLabel: {
    fontSize: 13,
    color: '#666',
  },
  itemScoreValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  itemScoreNA: {
    color: '#999',
    fontStyle: 'italic',
  },
  newButton: {
    backgroundColor: '#2c5aa0',
    borderRadius: 12,
    marginTop: 8,
  },
});