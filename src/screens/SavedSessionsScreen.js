import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, ActivityIndicator, RefreshControl, Modal, TouchableOpacity, Platform } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storage';
import { getSavedSessions, deleteSavedSession } from '../services/firestore';

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
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', gap: 14,
    ...Platform.select({ web: { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 }, android: { elevation: 12 } }),
  },
  title: { fontSize: 19, fontWeight: 'bold', color: '#1a1a2e' },
  message: { fontSize: 14, color: '#555', lineHeight: 21 },
  btns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center' },
  cancelText: { fontSize: 15, color: '#555', fontWeight: '600' },
  actionBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  actionText: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
});

export default function SavedSessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('local');
  const [confirmModal, setConfirmModal] = useState({
    visible: false, title: '', message: '', confirmText: 'OK', confirmColor: '#dc3545', onConfirm: null, onCancel: null,
  });
  const showConfirm = (title, message, confirmText, confirmColor, onConfirm) => {
    setConfirmModal({
      visible: true, title, message, confirmText, confirmColor,
      onConfirm,
      onCancel: () => setConfirmModal(p => ({ ...p, visible: false })),
    });
  };
  const hideConfirm = () => setConfirmModal(p => ({ ...p, visible: false }));

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

  const handleResume = (sessionId, session) => {
    showConfirm(
      'Resume Session',
      `Resume assessment for Participant ${session.participantId}?\n\nYou will continue from item ${(session.currentItemIndex || 0) + 1}`,
      'Resume',
      '#3c8dbc',
      async () => {
        hideConfirm();
        try {
          const currentSessions = await StorageService.getSavedSessions();
          if (!currentSessions || !currentSessions[sessionId]) {
            showConfirm('Not Found', 'Session not found. It may have been deleted.', 'OK', '#2c5aa0', hideConfirm);
            await loadSessions();
            return;
          }
          navigation.navigate('Assessment', {
            resumeSession: { ...session, sessionId, timestamp: Date.now() }
          });
        } catch (error) {
          console.error('Error resuming session:', error);
          showConfirm('Error', 'Failed to resume session. Please try again.', 'OK', '#2c5aa0', hideConfirm);
        }
      }
    );
  };

  const handleDelete = (sessionId, session) => {
    showConfirm(
      'Delete Session',
      'Are you sure you want to delete this saved session? This action cannot be undone.',
      'Delete',
      '#dc3545',
      async () => {
        hideConfirm();
        try {
          const localResult = await StorageService.deleteSavedSession(sessionId);
          if (session.firestoreId || session.id) {
            deleteSavedSession(session.firestoreId || session.id).catch(err => {
              console.log('Cloud deletion failed (non-critical):', err.message);
            });
          }
          if (localResult.success) {
            const updatedSessions = { ...sessions };
            delete updatedSessions[sessionId];
            setSessions(updatedSessions);
          } else {
            showConfirm('Error', 'Failed to delete session from device.', 'OK', '#2c5aa0', hideConfirm);
          }
        } catch (error) {
          console.error('Error deleting session:', error);
          showConfirm('Error', 'Failed to delete session. Please try again.', 'OK', '#2c5aa0', hideConfirm);
        }
      }
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
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
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