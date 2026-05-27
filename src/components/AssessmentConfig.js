import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { PATIENT_POPULATIONS, SETTINGS } from '../constants/items';
import { StorageService } from '../services/storage';
import { saveAssessmentConfig, getNextParticipantId } from '../services/firestore';

export default function AssessmentConfig({ onStart }) {
  const [participantId, setParticipantId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTest, setCurrentTest] = useState('');
  const [population, setPopulation] = useState('');
  const [setting, setSetting] = useState('');
  const [seedValue, setSeedValue] = useState('');
  const [savedSessions, setSavedSessions] = useState({});
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [showPopulationPicker, setShowPopulationPicker] = useState(false);

  useEffect(() => {
    loadData();
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    
    return () => subscription?.remove();
  }, []);

  const loadData = async () => {
    try {
      const user = await StorageService.getCurrentUser();
      setCurrentUser(user);

      // Reserve a globally unique participant ID from Firestore
      const idResult = await getNextParticipantId();
      if (idResult.success) {
        setParticipantId(idResult.id);
      } else {
        // Fallback to local counter if offline
        const counter = await StorageService.getParticipantCounter();
        setParticipantId(counter);
      }

      const sessions = await StorageService.getSavedSessions();
      setSavedSessions(sessions || {});
    } catch (error) {
      console.error('Error loading data:', error);
      const counter = await StorageService.getParticipantCounter();
      setParticipantId(counter);
      setSavedSessions({});
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    const errors = [];
    if (!currentTest) errors.push('• Primary CAT Assessment');
    if (!population) errors.push('• Patient Population');
    if (!setting) errors.push('• Setting');

    if (errors.length > 0) {
      Alert.alert(
        'Required Fields Missing',
        `Please complete:\n\n${errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const configData = {
        participantId: participantId,
        clinicianName: currentUser?.fullName || 'Unknown',
        clinicianEmail: currentUser?.email || 'Unknown',
        clinicianId: currentUser?.id || 'Unknown',
        currentTest,
        alternateTest: currentTest === 'BBS' ? 'FGA' : 'BBS',
        population,
        setting,
        seedValue: seedValue ? parseInt(seedValue) : null,
        timestamp: new Date().toISOString(),
        status: 'started'
      };

      console.log('📊 Config data:', configData);

      // Try to save to Firestore
      try {
        const firestoreResult = await saveAssessmentConfig(configData);
        
        if (firestoreResult.success) {
          console.log('✅ Assessment config saved to Firestore:', firestoreResult.id);
          onStart({
            ...configData,
            firestoreId: firestoreResult.id
          });
        } else {
          console.warn('⚠️ Firestore save failed, continuing with local storage only');
          onStart(configData);
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore error (continuing locally):', firestoreError);
        // Continue with local storage even if Firestore fails
        onStart(configData);
      }
      
    } catch (error) {
      console.error('❌ Error starting assessment:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', `Failed to start assessment: ${error.message}`);
    }
  };

  const isFormComplete = currentTest && population && setting;
  const completedFieldsCount = [currentTest, population, setting].filter(Boolean).length;
  const completionPercentage = Math.round((completedFieldsCount / 3) * 100);

  const isWeb = Platform.OS === 'web';
  const isLargeScreen = windowWidth > 768;
  const cardStyle = isWeb && isLargeScreen ? styles.cardWeb : styles.card;
  const containerStyle = isWeb && isLargeScreen ? styles.containerWeb : styles.container;

  // Get icon for each population
  const getPopulationIcon = (pop) => {
    const iconMap = {
      'General': 'people',
      'Stroke': 'fitness',
      'Spinal Cord Injury (SCI)': 'body',
      'Traumatic Brain Injury (TBI)': 'alert-circle',
      "Parkinson's Disease": 'pulse',
      'Multiple Sclerosis': 'git-network',
      'Vestibular Disorder': 'ear',
      'Other': 'ellipsis-horizontal-circle'
    };
    return iconMap[pop] || 'person';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={containerStyle}
      contentContainerStyle={[
        styles.scrollContent,
        isWeb && isLargeScreen && styles.scrollContentWeb
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Card style={cardStyle} elevation={3}>
        <Card.Content>
          <View style={styles.header}>
            <Ionicons name="clipboard" size={28} color="#2c5aa0" />
            <Text style={styles.cardTitle}>Assessment Configuration</Text>
          </View>
          
          <View style={isWeb && isLargeScreen ? styles.twoColumnLayout : null}>
            <View style={isWeb && isLargeScreen ? styles.leftColumn : null}>
              
              {/* Clinician Info Display */}
              {currentUser && (
                <View style={styles.clinicianInfoBanner}>
                  <View style={styles.clinicianAvatar}>
                    <Ionicons name="person-circle" size={40} color="#2c5aa0" />
                  </View>
                  <View style={styles.clinicianDetails}>
                    <Text style={styles.clinicianLabel}>Clinician</Text>
                    <Text style={styles.clinicianName}>{currentUser.fullName}</Text>
                    <Text style={styles.clinicianEmail}>{currentUser.email}</Text>
                  </View>
                </View>
              )}

              {/* Participant Info */}
              <View style={styles.infoPanel}>
                <View style={styles.panelHeader}>
                  <Ionicons name="person-circle-outline" size={20} color="#1565C0" />
                  <Text style={styles.panelTitle}>Participant Information</Text>
                </View>
                <View style={styles.idBadge}>
                  <Text style={styles.idLabel}>Participant ID</Text>
                  <Text style={styles.participantId}>{participantId}</Text>
                </View>
                <View style={styles.warningBox}>
                  <Ionicons name="information-circle" size={14} color="#f57c00" />
                  <Text style={styles.warningText}>
                    Record this ID with patient MRN separately
                  </Text>
                </View>
              </View>

              {/* Patient Population - Card Selection */}
              <View style={styles.section}>
                <View style={styles.labelContainer}>
                  <Ionicons name="people" size={14} color="#424242" />
                  <Text style={styles.labelText}> Patient Population </Text>
                  <Text style={styles.required}>*</Text>
                </View>
                
                {!showPopulationPicker ? (
                  <TouchableOpacity
                    style={[styles.selectionButton, !population && styles.selectionButtonError]}
                    onPress={() => setShowPopulationPicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.selectionButtonContent}>
                      {population ? (
                        <>
                          <Ionicons name={getPopulationIcon(population)} size={20} color="#2c5aa0" />
                          <Text style={styles.selectionButtonTextSelected}>{population}</Text>
                          <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                        </>
                      ) : (
                        <>
                          <Ionicons name="chevron-down-circle" size={20} color="#999" />
                          <Text style={styles.selectionButtonTextPlaceholder}>Choose population...</Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.optionsGrid}>
                    {PATIENT_POPULATIONS.map((pop) => (
                      <TouchableOpacity
                        key={pop}
                        style={[
                          styles.optionCard,
                          population === pop && styles.optionCardSelected
                        ]}
                        onPress={() => {
                          setPopulation(pop);
                          setShowPopulationPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={getPopulationIcon(pop)} 
                          size={24} 
                          color={population === pop ? '#fff' : '#2c5aa0'} 
                        />
                        <Text style={[
                          styles.optionCardText,
                          population === pop && styles.optionCardTextSelected
                        ]}>
                          {pop}
                        </Text>
                        {population === pop && (
                          <View style={styles.selectedBadge}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowPopulationPicker(false)}
                    >
                      <Ionicons name="close-circle" size={18} color="#666" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Setting - Horizontal Card Selection */}
              <View style={styles.section}>
                <View style={styles.labelContainer}>
                  <Ionicons name="business" size={14} color="#424242" />
                  <Text style={styles.labelText}> Setting </Text>
                  <Text style={styles.required}>*</Text>
                </View>
                
                <View style={styles.settingsRow}>
                  {SETTINGS.map((set) => (
                    <TouchableOpacity
                      key={set}
                      style={[
                        styles.settingCard,
                        setting === set && styles.settingCardSelected
                      ]}
                      onPress={() => setSetting(set)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingCardContent}>
                        <View style={[
                          styles.settingIconCircle,
                          setting === set && styles.settingIconCircleSelected
                        ]}>
                          <Ionicons 
                            name={set === 'Inpatient' ? 'bed' : 'walk'} 
                            size={28} 
                            color={setting === set ? '#fff' : '#2c5aa0'} 
                          />
                        </View>
                        <Text style={[
                          styles.settingCardText,
                          setting === set && styles.settingCardTextSelected
                        ]}>
                          {set}
                        </Text>
                        {setting === set && (
                          <Ionicons name="checkmark-circle" size={22} color="#4caf50" style={styles.settingCheckmark} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </View>

            <View style={isWeb && isLargeScreen ? styles.rightColumn : null}>
              
              {/* Test Selection */}
              <View style={styles.section}>
                <View style={styles.labelContainer}>
                  <Ionicons name="clipboard-outline" size={16} color="#333" />
                  <Text style={styles.sectionTitle}> Select Primary CAT </Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.testButton, 
                      currentTest === 'BBS' && styles.testButtonActive
                    ]}
                    onPress={() => setCurrentTest('BBS')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.testButtonContent}>
                      <View style={[styles.radioCircle, currentTest === 'BBS' && styles.radioCircleActive]}>
                        {currentTest === 'BBS' && <View style={styles.radioDot} />}
                      </View>
                      <View style={styles.testInfo}>
                        <Text style={[styles.testButtonText, currentTest === 'BBS' && styles.testButtonTextActive]}>
                          Berg Balance Scale
                        </Text>
                        <Text style={[styles.testButtonSubtext, currentTest === 'BBS' && styles.testButtonSubtextActive]}>
                          14-item balance assessment
                        </Text>
                      </View>
                      {currentTest === 'BBS' && (
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.testButton, 
                      currentTest === 'FGA' && styles.testButtonActive
                    ]}
                    onPress={() => setCurrentTest('FGA')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.testButtonContent}>
                      <View style={[styles.radioCircle, currentTest === 'FGA' && styles.radioCircleActive]}>
                        {currentTest === 'FGA' && <View style={styles.radioDot} />}
                      </View>
                      <View style={styles.testInfo}>
                        <Text style={[styles.testButtonText, currentTest === 'FGA' && styles.testButtonTextActive]}>
                          Functional Gait Assessment
                        </Text>
                        <Text style={[styles.testButtonSubtext, currentTest === 'FGA' && styles.testButtonSubtextActive]}>
                          10-item gait evaluation
                        </Text>
                      </View>
                      {currentTest === 'FGA' && (
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Seed Value */}
              <View style={styles.section}>
                <View style={styles.labelContainer}>
                  <Ionicons name="trending-up" size={14} color="#424242" />
                  <Text style={styles.labelText}> Seed Value </Text>
                  <Text style={styles.optional}>(optional)</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calculator-outline" size={16} color="#666" style={styles.seedIcon} />
                  <TextInput
                    style={[styles.input, styles.seedInput]}
                    placeholder="Previous score for comparison"
                    value={seedValue}
                    onChangeText={setSeedValue}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                {currentTest && seedValue && (
                  <View style={styles.hintBox}>
                    <Ionicons name="information-circle-outline" size={12} color="#1976d2" />
                    <Text style={styles.hintText}>
                      Comparing to previous {currentTest} score: {seedValue}
                    </Text>
                  </View>
                )}
              </View>

              {/* Saved Sessions */}
              {savedSessions && Object.keys(savedSessions).length > 0 && (
                <View style={styles.savedSessionsBox}>
                  <Ionicons name="save-outline" size={18} color="#f57c00" />
                  <Text style={styles.savedSessionsText}>
                    {Object.keys(savedSessions).length} saved session{Object.keys(savedSessions).length > 1 ? 's' : ''} available
                  </Text>
                </View>
              )}

              {/* Form Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Form Completion</Text>
                  <Text style={styles.progressPercentage}>
                    {completionPercentage}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${completionPercentage}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Start Button */}
              <Button
                mode="contained"
                onPress={handleStart}
                disabled={!isFormComplete}
                style={[styles.startButton, !isFormComplete && styles.startButtonDisabled]}
                labelStyle={styles.startButtonLabel}
                icon={() => <Ionicons name="play-circle" size={20} color="white" />}
              >
                Start Assessment
              </Button>
              
              {!isFormComplete && (
                <Text style={styles.requiredNotice}>
                  <Text style={styles.required}>*</Text> Please complete all required fields
                </Text>
              )}
            </View>
          </View>
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
  containerWeb: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  scrollContentWeb: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  card: {
    margin: 16,
    borderRadius: 16,
    width: '100%',
    maxWidth: 960,
  },
  cardWeb: {
    margin: 20,
    borderRadius: 16,
    width: '100%',
    maxWidth: 960,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 24,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  clinicianInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  clinicianAvatar: {
    marginRight: 12,
  },
  clinicianDetails: {
    flex: 1,
  },
  clinicianLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  clinicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 2,
  },
  clinicianEmail: {
    fontSize: 12,
    color: '#666',
  },
  infoPanel: {
    backgroundColor: '#e3f2fd',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  idBadge: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  participantId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 124, 0, 0.1)',
    padding: 7,
    borderRadius: 5,
  },
  warningText: {
    fontSize: 11,
    color: '#e65100',
    fontWeight: '500',
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  required: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optional: {
    color: '#757575',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  seedInput: {
    paddingLeft: 38,
  },
  seedIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  selectionButton: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
  },
  selectionButtonError: {
    borderColor: '#ef5350',
    backgroundColor: '#ffebee',
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectionButtonTextPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#999',
  },
  selectionButtonTextSelected: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  optionsGrid: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  optionCardSelected: {
    backgroundColor: '#2c5aa0',
    borderColor: '#2c5aa0',
  },
  optionCardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionCardTextSelected: {
    color: '#fff',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4caf50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  settingCard: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  settingCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2c5aa0',
    borderWidth: 2,
  },
  settingCardContent: {
    alignItems: 'center',
    width: '100%',
  },
  settingIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingIconCircleSelected: {
    backgroundColor: '#2c5aa0',
  },
  settingCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  settingCardTextSelected: {
    color: '#2c5aa0',
    fontWeight: 'bold',
  },
  settingCheckmark: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  buttonRow: {
    gap: 10,
  },
  testButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  testButtonActive: {
    backgroundColor: '#2c5aa0',
    borderColor: '#2c5aa0',
  },
  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bdbdbd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: 'white',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  testInfo: {
    flex: 1,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  testButtonTextActive: {
    color: 'white',
  },
  testButtonSubtext: {
    fontSize: 12,
    color: '#757575',
  },
  testButtonSubtextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  hintText: {
    fontSize: 12,
    color: '#1565C0',
    flex: 1,
  },
  savedSessionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  savedSessionsText: {
    fontSize: 13,
    color: '#e65100',
    fontWeight: '500',
    flex: 1,
  },
  progressContainer: {
    marginBottom: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  startButton: {
    marginTop: 8,
    backgroundColor: '#2c5aa0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  startButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requiredNotice: {
    textAlign: 'center',
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 10,
    fontWeight: '500',
  },
});