import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Card, Button, Divider } from 'react-native-paper';
import { StorageService } from '../services/storage';
import { saveUserProfile, getUserProfile } from '../services/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen({ navigation }) {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const ADMIN_EMAIL = 'dancun.juma@maryfreebed.com';
  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL;

  const languages = [
    { value: 'en', label: 'English', icon: '🇺🇸', description: 'Primary language', available: true },
    { value: 'es', label: 'Spanish', icon: '🇪🇸', description: 'Español', available: false },
    { value: 'ar', label: 'Arabic', icon: '🇸🇦', description: 'العربية', available: false },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load current user
      const user = await StorageService.getCurrentUser();
      setCurrentUser(user);

      // Load from local storage
      const lang = await StorageService.getLanguage();
      const notif = await StorageService.getNotifications();
      const sound = await StorageService.getSoundEnabled();
      const auto = await StorageService.getAutoSave();
      
      setLanguage(lang || 'en');
      setNotifications(notif !== false);
      setSoundEnabled(sound !== false);
      setAutoSave(auto !== false);

      // Try to load from Firestore
      const profileResult = await getUserProfile();
      if (profileResult.success && profileResult.data) {
        const cloudSettings = profileResult.data;
        
        if (cloudSettings.language && cloudSettings.language !== lang) {
          setLanguage(cloudSettings.language);
          await StorageService.saveLanguage(cloudSettings.language);
        }
        
        if (cloudSettings.notifications !== undefined && cloudSettings.notifications !== notif) {
          setNotifications(cloudSettings.notifications);
          await StorageService.saveNotifications(cloudSettings.notifications);
        }
        
        if (cloudSettings.soundEnabled !== undefined && cloudSettings.soundEnabled !== sound) {
          setSoundEnabled(cloudSettings.soundEnabled);
          await StorageService.saveSoundEnabled(cloudSettings.soundEnabled);
        }
        
        if (cloudSettings.autoSave !== undefined && cloudSettings.autoSave !== auto) {
          setAutoSave(cloudSettings.autoSave);
          await StorageService.saveAutoSave(cloudSettings.autoSave);
        }
        
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLanguageSelect = (lang) => {
    if (!lang.available) {
      Alert.alert(
        'Coming Soon',
        `${lang.label} language support is coming soon! We're working hard to bring you multilingual support.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setLanguage(lang.value);
    setHasChanges(true);
    setSyncStatus(null);
  };

  const handleSave = async () => {
    try {
      await StorageService.saveLanguage(language);
      await StorageService.saveNotifications(notifications);
      await StorageService.saveSoundEnabled(soundEnabled);
      await StorageService.saveAutoSave(autoSave);
      
      const profileData = {
        language,
        notifications,
        soundEnabled,
        autoSave,
        lastUpdated: new Date().toISOString()
      };
      
      const firestoreResult = await saveUserProfile(profileData);
      
      if (firestoreResult.success) {
        setSyncStatus('synced');
        Alert.alert('Success', 'Settings saved successfully!');
      } else {
        setSyncStatus('local-only');
        Alert.alert('Saved Locally', 'Settings saved to device. Cloud sync will retry automatically.');
      }
      
      setHasChanges(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setLanguage('en');
            setNotifications(true);
            setSoundEnabled(true);
            setAutoSave(true);
            setHasChanges(true);
            setSyncStatus(null);
          },
        },
      ]
    );
  };

  const handleViewTerms = () => {
    navigation.navigate('TermsAndConditions', { fromSettings: true });
  };

  const handleViewPrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy', { fromSettings: true });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will delete all saved assessments from your device. Cloud data will remain safe and can be re-downloaded when needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Local Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'Local data has been cleared. Cloud data is safe.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const performLogout = async () => {
    try {
      const { logoutFromFirebase } = require('../services/firestore');
      await logoutFromFirebase();
      await StorageService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
      return;
    }
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageWrapper}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Settings</Text>
            {syncStatus === 'synced' && (
              <View style={styles.syncBadge}>
                <Icon name="cloud-check" size={16} color="#4caf50" />
                <Text style={styles.syncBadgeText}>Auto-Sync Active</Text>
              </View>
            )}
            {syncStatus === 'local-only' && (
              <View style={[styles.syncBadge, { backgroundColor: '#fff8e1' }]}>
                <Icon name="cloud-sync" size={16} color="#ff9800" />
                <Text style={[styles.syncBadgeText, { color: '#f57c00' }]}>Syncing...</Text>
              </View>
            )}
          </View>

          {/* User Profile Card */}
          {currentUser && (
            <View style={styles.userProfileCard}>
              <View style={styles.userAvatar}>
                <Icon name="account-circle" size={50} color="#3c8dbc" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUser.fullName}</Text>
                <Text style={styles.userEmail}>{currentUser.email}</Text>
                {currentUser.employeeId && currentUser.role && (
                  <Text style={styles.userRole}>{currentUser.employeeId} • {currentUser.role}</Text>
                )}
              </View>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Firebase Auto-Sync Info */}
          <View style={styles.syncInfoBox}>
            <Icon name="cloud-sync-outline" size={20} color="#4caf50" />
            <Text style={styles.syncInfoText}>
              All your assessments are automatically backed up to the cloud in real-time.
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Language Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="translate" size={20} color="#3c8dbc" /> Language
            </Text>
            <Text style={styles.sectionSubtitle}>
              Select your preferred language
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                onPress={() => handleLanguageSelect(lang)}
                activeOpacity={0.7}
              >
                <Card
                  style={[
                    styles.languageCard,
                    language === lang.value && styles.languageCardSelected,
                    !lang.available && styles.languageCardDisabled,
                  ]}
                >
                  <View style={styles.languageCardContent}>
                    <View style={styles.languageLeft}>
                      <Text style={[styles.languageIcon, !lang.available && styles.languageIconDisabled]}>
                        {lang.icon}
                      </Text>
                      <View>
                        <View style={styles.languageLabelRow}>
                          <Text style={[styles.languageLabel, !lang.available && styles.languageLabelDisabled]}>
                            {lang.label}
                          </Text>
                          {!lang.available && (
                            <View style={styles.comingSoonBadge}>
                              <Text style={styles.comingSoonText}>Coming Soon</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.languageDescription, !lang.available && styles.languageDescriptionDisabled]}>
                          {lang.description}
                        </Text>
                      </View>
                    </View>
                    {language === lang.value && lang.available && (
                      <Icon name="check-circle" size={24} color="#3c8dbc" />
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="cog" size={20} color="#3c8dbc" /> Preferences
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders and alerts
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={(value) => {
                  setNotifications(value);
                  setHasChanges(true);
                  setSyncStatus(null);
                }}
                trackColor={{ false: '#ddd', true: '#3c8dbc' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>
                  Play sounds for actions
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(value) => {
                  setSoundEnabled(value);
                  setHasChanges(true);
                  setSyncStatus(null);
                }}
                trackColor={{ false: '#ddd', true: '#3c8dbc' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-save</Text>
                <Text style={styles.settingDescription}>
                  Automatically save assessments
                </Text>
              </View>
              <Switch
                value={autoSave}
                onValueChange={(value) => {
                  setAutoSave(value);
                  setHasChanges(true);
                  setSyncStatus(null);
                }}
                trackColor={{ false: '#ddd', true: '#3c8dbc' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Legal & Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="shield-check" size={20} color="#3c8dbc" /> Legal & Privacy
            </Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewTerms}
            >
              <Icon name="file-document-outline" size={20} color="#ff9500" />
              <Text style={[styles.actionButtonText, { color: '#333' }]}>
                Terms & Conditions
              </Text>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewPrivacyPolicy}
            >
              <Icon name="shield-account" size={20} color="#2196f3" />
              <Text style={[styles.actionButtonText, { color: '#333' }]}>
                Privacy Policy
              </Text>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Icon name="information-outline" size={16} color="#2196f3" />
              <Text style={styles.infoText}>
                Review our terms of service and privacy policy
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="database" size={20} color="#3c8dbc" /> Data Management
            </Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReset}
            >
              <Icon name="restore" size={20} color="#666" />
              <Text style={styles.actionButtonText}>Reset to Defaults</Text>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleClearData}
            >
              <Icon name="delete-outline" size={20} color="#d32f2f" />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Clear Local Cache
              </Text>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.warningBox}>
              <Icon name="information-outline" size={16} color="#ff9800" />
              <Text style={styles.warningText}>
                Clearing local cache only removes device storage. Your cloud data remains safe.
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Admin Panel — only visible to admin account */}
          {isAdmin && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Icon name="shield-crown" size={20} color="#ff9500" /> Administration
                </Text>
                <TouchableOpacity
                  style={styles.adminButton}
                  onPress={() => navigation.navigate('Admin')}
                >
                  <View style={styles.adminButtonLeft}>
                    <View style={styles.adminIconCircle}>
                      <Icon name="database-export" size={22} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.adminButtonTitle}>Admin Data Panel</Text>
                      <Text style={styles.adminButtonSub}>View & download all clinician data</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color="#ff9500" />
                </TouchableOpacity>
                <View style={styles.adminInfoBox}>
                  <Icon name="information-outline" size={14} color="#ff9500" />
                  <Text style={styles.adminInfoText}>
                    Restricted to administrator account only. Exports full XLSX with all item scores, timing, and clinician details.
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Account Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="account" size={20} color="#3c8dbc" /> Account
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="#d32f2f" />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Logout
              </Text>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <Divider style={styles.divider} />

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="information" size={20} color="#3c8dbc" /> About
            </Text>
            <View style={styles.aboutBox}>
              <Text style={styles.aboutAppName}>
                MFB Balance Assessment App
              </Text>
              <Text style={styles.aboutText}>Version 1.0.0</Text>
              <Text style={styles.aboutText}>
                © 2025 Mary Free Bed Rehab Hospital
              </Text>
              <Text style={styles.aboutSubtext}>
                Grand Rapids, Michigan
              </Text>
              <View style={styles.cloudFeatureBadge}>
                <Icon name="cloud-check" size={14} color="#4caf50" />
                <Text style={styles.cloudFeatureText}>Real-Time Cloud Sync</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
            disabled={!hasChanges}
            icon="content-save"
          >
            Save Changes
          </Button>
        </Card.Content>
      </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollContent: {
    alignItems: 'center',
  },
  pageWrapper: {
    width: '100%',
    maxWidth: 960,
  },
  card: {
    margin: 15,
    marginBottom: 30,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3c8dbc',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  syncInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#e8f5e9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  syncInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '500',
    lineHeight: 18,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7fb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  userAvatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  divider: {
    marginVertical: 20,
  },
  languageCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageCardSelected: {
    borderColor: '#3c8dbc',
    backgroundColor: '#f0f7fb',
  },
  languageCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  languageCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  languageIcon: {
    fontSize: 32,
  },
  languageIconDisabled: {
    opacity: 0.5,
  },
  languageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  languageLabelDisabled: {
    color: '#999',
  },
  comingSoonBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 10,
    color: '#f57c00',
    fontWeight: 'bold',
  },
  languageDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  languageDescriptionDisabled: {
    color: '#aaa',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: '#ffebee',
  },
  logoutButton: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  dangerText: {
    color: '#d32f2f',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#e65100',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565c0',
  },
  aboutBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  aboutAppName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3c8dbc',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  aboutSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  cloudFeatureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cloudFeatureText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3c8dbc',
    marginTop: 10,
    paddingVertical: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff8ee',
    borderWidth: 2,
    borderColor: '#ff9500',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  adminButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  adminIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminButtonTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 2,
  },
  adminButtonSub: {
    fontSize: 12,
    color: '#888',
  },
  adminInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9500',
  },
  adminInfoText: {
    flex: 1,
    fontSize: 11,
    color: '#e65100',
    lineHeight: 16,
  },
});