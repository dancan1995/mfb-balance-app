import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AssessmentConfig from '../components/AssessmentConfig';
import AssessmentRunning from '../components/AssessmentRunning';
import AssessmentResults from '../components/AssessmentResults';
import { StorageService } from '../services/storage';
import { getAssessmentStats } from '../services/firestore';

export default function AssessmentScreen({ navigation, route }) {
  const [screen, setScreen] = useState('home'); // home, config, running, results
  const [assessmentData, setAssessmentData] = useState(null);
  const [results, setResults] = useState(null);
  const [savedSessionsCount, setSavedSessionsCount] = useState(0);
  const [recentAssessmentsCount, setRecentAssessmentsCount] = useState(0);
  const [cloudSynced, setCloudSynced] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  // Handle resume from saved sessions
  useEffect(() => {
    if (route?.params?.resumeSession) {
      const session = route.params.resumeSession;
      setAssessmentData(session);
      setScreen('running');
    }
  }, [route?.params?.resumeSession]);

  const loadStats = async () => {
    try {
      // Load from local storage
      const sessions = await StorageService.getSavedSessions();
      setSavedSessionsCount(Object.keys(sessions || {}).length);
      
      const assessments = await StorageService.getAssessments();
      setRecentAssessmentsCount(assessments.length);

      // Try to load stats from Firestore
      const firestoreStats = await getAssessmentStats();
      if (firestoreStats.success) {
        setCloudSynced(true);
        // Use Firestore data if available and more recent
        if (firestoreStats.data.totalAssessments > assessments.length) {
          setRecentAssessmentsCount(firestoreStats.data.totalAssessments);
        }
        console.log('Stats synced with Firestore');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const startNewAssessment = () => {
    setScreen('config');
  };

  const startAssessment = (data) => {
    console.log('Starting assessment with data:', data);
    setAssessmentData(data);
    setScreen('running');
  };

  const completeAssessment = (resultData) => {
    console.log('Assessment completed:', resultData);
    setResults(resultData);
    setScreen('results');
  };

  const resetAssessment = () => {
    setAssessmentData(null);
    setResults(null);
    setScreen('home');
    loadStats(); // Refresh stats
  };

  const goBackToHome = () => {
    setScreen('home');
  };

  return (
    <View style={styles.container}>
      {screen === 'home' && (
        <AssessmentHome 
          onStartNew={startNewAssessment}
          savedSessionsCount={savedSessionsCount}
          recentAssessmentsCount={recentAssessmentsCount}
          cloudSynced={cloudSynced}
          navigation={navigation}
        />
      )}

      {screen === 'config' && (
        <AssessmentConfig 
          onStart={startAssessment}
          onBack={goBackToHome}
        />
      )}
      
      {screen === 'running' && (
        <AssessmentRunning
          assessmentData={assessmentData}
          onComplete={completeAssessment}
          onCancel={resetAssessment}
        />
      )}
      
      {screen === 'results' && (
        <AssessmentResults
          results={results}
          assessmentData={assessmentData}
          onNewAssessment={resetAssessment}
        />
      )}
    </View>
  );
}

// Assessment Home Screen Component
function AssessmentHome({ onStartNew, savedSessionsCount, recentAssessmentsCount, cloudSynced, navigation }) {
  return (
    <ScrollView style={styles.homeContainer} contentContainerStyle={styles.homeScrollContent}>
      <View style={styles.homeContent}>
        {/* Welcome Card */}
        <Card style={styles.welcomeCard} elevation={3}>
          <Card.Content>
            <View style={styles.welcomeHeader}>
              <Ionicons name="clipboard-outline" size={48} color="#2c5aa0" />
              <Text style={styles.welcomeTitle}>Balance Assessment</Text>
              <Text style={styles.welcomeSubtitle}>
                Comprehensive CAT-based evaluation system
              </Text>
              {cloudSynced && (
                <View style={styles.cloudBadge}>
                  <Ionicons name="cloud-done" size={16} color="#4caf50" />
                  <Text style={styles.cloudBadgeText}>Cloud Synced</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="flask-outline" size={20} color="#4caf50" />
                <Text style={styles.infoText}>
                  Berg Balance Scale (BBS) - 14 items
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="walk-outline" size={20} color="#ff9800" />
                <Text style={styles.infoText}>
                  Functional Gait Assessment (FGA) - 10 items
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="analytics-outline" size={20} color="#2196f3" />
                <Text style={styles.infoText}>
                  Computer Adaptive Testing for efficiency
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={onStartNew}
              style={styles.startNewButton}
              icon={() => <Ionicons name="add-circle" size={24} color="white" />}
              labelStyle={styles.startNewButtonLabel}
            >
              Start New Assessment
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconCircle}>
                <Ionicons name="checkmark-done" size={24} color="#4caf50" />
              </View>
              <Text style={styles.statValue}>{recentAssessmentsCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconCircle, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="save" size={24} color="#ff9800" />
              </View>
              <Text style={styles.statValue}>{savedSessionsCount}</Text>
              <Text style={styles.statLabel}>Saved Sessions</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Access Cards */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <Card style={styles.quickAccessCard} onPress={() => navigation.navigate('History')}>
            <Card.Content style={styles.quickAccessContent}>
              <View style={styles.quickAccessLeft}>
                <View style={styles.quickAccessIconCircle}>
                  <Ionicons name="time" size={28} color="#2c5aa0" />
                </View>
                <View style={styles.quickAccessText}>
                  <Text style={styles.quickAccessTitle}>Assessment History</Text>
                  <Text style={styles.quickAccessSubtitle}>View past assessments</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </Card.Content>
          </Card>

          {savedSessionsCount > 0 && (
            <Card style={styles.quickAccessCard} onPress={() => navigation.navigate('Saved')}>
              <Card.Content style={styles.quickAccessContent}>
                <View style={styles.quickAccessLeft}>
                  <View style={[styles.quickAccessIconCircle, { backgroundColor: '#fff3e0' }]}>
                    <Ionicons name="folder-open" size={28} color="#ff9800" />
                  </View>
                  <View style={styles.quickAccessText}>
                    <Text style={styles.quickAccessTitle}>Saved Sessions</Text>
                    <Text style={styles.quickAccessSubtitle}>
                      Resume incomplete assessments
                    </Text>
                  </View>
                </View>
                <View style={styles.savedBadge}>
                  <Text style={styles.savedBadgeText}>{savedSessionsCount}</Text>
                </View>
              </Card.Content>
            </Card>
          )}

          <Card style={styles.quickAccessCard} onPress={() => navigation.navigate('Dashboard')}>
            <Card.Content style={styles.quickAccessContent}>
              <View style={styles.quickAccessLeft}>
                <View style={[styles.quickAccessIconCircle, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="stats-chart" size={28} color="#4caf50" />
                </View>
                <View style={styles.quickAccessText}>
                  <Text style={styles.quickAccessTitle}>Dashboard</Text>
                  <Text style={styles.quickAccessSubtitle}>View analytics and trends</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  homeContainer: {
    flex: 1,
  },
  homeScrollContent: {
    alignItems: 'center',
  },
  homeContent: {
    width: '100%',
    maxWidth: 960,
    padding: 16,
    paddingBottom: 30,
  },
  welcomeCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  welcomeHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginTop: 12,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  cloudBadgeText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  infoSection: {
    marginBottom: 24,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  startNewButton: {
    backgroundColor: '#2c5aa0',
    paddingVertical: 8,
    borderRadius: 12,
  },
  startNewButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  quickAccessSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  quickAccessCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  quickAccessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  quickAccessIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessText: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  quickAccessSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  savedBadge: {
    backgroundColor: '#ff9800',
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  savedBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});