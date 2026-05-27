import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { StorageService } from '../services/storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);

  const ADMIN_EMAIL = 'dancun.juma@maryfreebed.com';
  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = await StorageService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
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
            </View>
          </View>

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
  divider: {
    marginVertical: 20,
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