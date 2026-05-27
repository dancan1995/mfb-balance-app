import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storage';
import { getSavedSessions, deleteSavedSession } from '../services/firestore';

export default function SavedSessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('local');

  useEffect(() => {
    loadSessions();
    const unsubscribe = navigation.addListener('focus', loadSessions);
    return unsubscribe;
  }, [navigation]);

  const loadSessions = async () => {
    setLoading(true);
    
    try {
      // Prioritize local storage for faster access
      const localData = await StorageService.getSavedSessions();
      console.log('Loaded local sessions:', Object.keys(localData || {}).length);
      
      // Set local data immediately
      if (localData && Object.keys(localData).length > 0) {
        setSessions(localData);
        setDataSource('local');
      }
      
      // Try to sync with Firestore in the background
      try {
        const firestoreResult = await getSavedSessions();
        
        if (firestoreResult.success && firestoreResult.data.length > 0) {
          // Convert Firestore array to object format
          const cloudData = {};
          firestoreResult.data.forEach(session => {
            cloudData[session.id] = session;
          });
          
          // Merge local and cloud data (local takes priority for conflicts)
          const mergedData = { ...cloudData, ...localData };
          
          // Save merged data back to local storage
          await StorageService.saveSessions(mergedData);
          
          setSessions(mergedData);
          setDataSource(Object.keys(cloudData).length > 0 ? 'merged' : 'local');
          
          console.log(`Sessions synced: ${Object.keys(mergedData).length} total sessions`);
        }
      } catch (cloudError) {
        console.log('Cloud sync failed, using local data only:', cloudError.message);
        // Continue with local data
      }
    } catch (error) {
      console.error('Error loading saved sessions:', error);
      Alert.alert('Error', 'Failed to load saved sessions');
      setSessions({});
      setDataSource('none');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
  };

  const handleResume = async (sessionId, session) => {
    console.log('Resuming session:', sessionId);
    console.log('Session data:', session);
    
    Alert.alert(
      'Resume Session',
      `Resume assessment for Participant ${session.participantId}?\n\nYou will continue from item ${(session.currentItemIndex || 0) + 1}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resume',
          onPress: async () => {
            try {
              // Verify session still exists in local storage
              const currentSessions = await StorageService.getSavedSessions();
              
              if (!currentSessions || !currentSessions[sessionId]) {
                Alert.alert('Error', 'Session not found. It may have been deleted.');
                await loadSessions();
                return;
              }
              
              // Navigate to Assessment screen with complete session data
              navigation.navigate('Assessment', { 
                resumeSession: {
                  ...session,
                  sessionId: sessionId,
                  timestamp: Date.now() // Add timestamp for tracking
                }
              });
            } catch (error) {
              console.error('Error resuming session:', error);
              Alert.alert('Error', 'Failed to resume session. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (sessionId, session) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this saved session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from local storage first (priority)
              const localResult = await StorageService.deleteSavedSession(sessionId);
              
              // Try to delete from Firestore (background operation)
              if (session.firestoreId || session.id) {
                deleteSavedSession(session.firestoreId || session.id).catch(err => {
                  console.log('Cloud deletion failed (non-critical):', err.message);
                });
              }
              
              if (localResult.success) {
                // Update local state immediately
                const updatedSessions = { ...sessions };
                delete updatedSessions[sessionId];
                setSessions(updatedSessions);
                
                Alert.alert('Success', 'Session deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete session from device');
              }
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          }
        }
      ]
    );
  };

  const sessionEntries = Object.entries(sessions);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c8dbc" />
        <Text style={styles.loadingText}>Loading saved sessions...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3c8dbc']}
          tintColor="#3c8dbc"
        />
      }
    >
      <View style={styles.pageWrapper}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Saved Sessions</Text>
          {dataSource === 'cloud' && (
            <View style={styles.cloudBadge}>
              <Ionicons name="cloud-done" size={14} color="#4caf50" />
              <Text style={styles.cloudBadgeText}>Cloud</Text>
            </View>
          )}
          {dataSource === 'merged' && (
            <View style={[styles.cloudBadge, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="sync" size={14} color="#2196f3" />
              <Text style={[styles.cloudBadgeText, { color: '#2196f3' }]}>Synced</Text>
            </View>
          )}
          {dataSource === 'local' && sessionEntries.length > 0 && (
            <View style={[styles.cloudBadge, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="phone-portrait" size={14} color="#ff9800" />
              <Text style={[styles.cloudBadgeText, { color: '#ff9800' }]}>Local</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          {sessionEntries.length} saved session{sessionEntries.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {sessionEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="save-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No saved sessions</Text>
          <Text style={styles.emptySubtext}>
            Saved sessions will appear here when you use 'Save & Exit' during an assessment
          </Text>
        </View>
      ) : (
        sessionEntries
          .sort(([, a], [, b]) => new Date(b.saveTime) - new Date(a.saveTime)) // Sort by most recent
          .map(([sessionId, session]) => (
            <Card key={sessionId} style={styles.sessionCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.participantId}>
                      Participant ID: {session.participantId}
                    </Text>
                    {(session.firestoreId || dataSource === 'cloud') && (
                      <Ionicons name="cloud" size={16} color="#4caf50" />
                    )}
                  </View>
                  <Text style={styles.saveTime}>
                    {new Date(session.saveTime).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Primary CAT:</Text>
                  <Text style={styles.value}>{session.currentTest}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phase:</Text>
                  <View style={styles.phaseContainer}>
                    <Text style={styles.value}>{session.testPhase}</Text>
                    <View style={[
                      styles.phaseBadge,
                      session.testPhase === 'alternate' && styles.phaseBadgeAlternate
                    ]}>
                      <Text style={styles.phaseBadgeText}>
                        {session.testPhase === 'primary' ? 'Primary' : 'Alternate'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>PT:</Text>
                  <Text style={styles.value}>{session.ptName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Population:</Text>
                  <Text style={styles.value}>{session.population}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Setting:</Text>
                  <Text style={styles.value}>{session.setting}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Progress:</Text>
                  <Text style={styles.value}>
                    Item {(session.currentItemIndex || 0) + 1}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Elapsed Time:</Text>
                  <Text style={styles.value}>
                    {Math.floor(session.elapsedTime / 60)}:{String(session.elapsedTime % 60).padStart(2, '0')}
                  </Text>
                </View>

                <View style={styles.buttonRow}>
                  <Button
                    mode="contained"
                    onPress={() => handleResume(sessionId, session)}
                    style={styles.resumeButton}
                    icon="play-circle"
                    buttonColor="#3c8dbc"
                  >
                    Resume
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDelete(sessionId, session)}
                    style={styles.deleteButton}
                    textColor="#dc3545"
                    icon="delete"
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
      )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    alignItems: 'center',
  },
  pageWrapper: {
    width: '100%',
    maxWidth: 960,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3c8dbc',
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  cloudBadgeText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sessionCard: {
    margin: 15,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  cardHeader: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  participantId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3c8dbc',
  },
  saveTime: {
    fontSize: 12,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  phaseBadgeAlternate: {
    backgroundColor: '#f3e5f5',
  },
  phaseBadgeText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  resumeButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    borderColor: '#dc3545',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});