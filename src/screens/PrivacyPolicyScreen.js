import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen({ navigation, route }) {  // ← ADDED route HERE
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            const fromSettings = route?.params?.fromSettings;
            if (fromSettings) {
              navigation.navigate('Settings');
            } else {
              navigation.goBack();
            }
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <View style={styles.updateBanner}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.lastUpdated}>Last Updated: November 6, 2025</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.introText}>
            Mary Free Bed Rehabilitation Hospital ("we," "us," or "our") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
            the MFB Balance Assessment App ("the App").
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>1.1 Personal Information</Text>
          <Text style={styles.bodyText}>
            We collect the following personal information:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Clinician name and email address</Text>
            <Text style={styles.bulletItem}>• Employment ID</Text>
            <Text style={styles.bulletItem}>• Organization affiliation</Text>
          </View>

          <Text style={styles.subsectionTitle}>1.2 Patient Assessment Data</Text>
          <Text style={styles.bodyText}>
            We collect de-identified patient assessment data including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Participant ID (de-identified)</Text>
            <Text style={styles.bulletItem}>• Assessment scores and results</Text>
            <Text style={styles.bulletItem}>• Patient population category</Text>
            <Text style={styles.bulletItem}>• Clinical setting information</Text>
            <Text style={styles.bulletItem}>• Assessment date and time</Text>
          </View>

          <Text style={styles.subsectionTitle}>1.3 Technical Information</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Device type and operating system</Text>
            <Text style={styles.bulletItem}>• App usage statistics</Text>
            <Text style={styles.bulletItem}>• Error logs and performance data</Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          </View>
          
          <Text style={styles.bodyText}>
            We use the collected information for the following purposes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• To provide and maintain the App's functionality</Text>
            <Text style={styles.bulletItem}>• To conduct clinical research and analysis</Text>
            <Text style={styles.bulletItem}>• To improve assessment algorithms and accuracy</Text>
            <Text style={styles.bulletItem}>• To generate aggregate statistical reports</Text>
            <Text style={styles.bulletItem}>• To ensure data quality and integrity</Text>
            <Text style={styles.bulletItem}>• To provide technical support</Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>3.1 Data Storage</Text>
          <Text style={styles.bodyText}>
            Your data is stored securely using:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Local device storage (encrypted)</Text>
            <Text style={styles.bulletItem}>• Cloud storage via Firebase (Google Cloud Platform)</Text>
            <Text style={styles.bulletItem}>• HIPAA-compliant infrastructure</Text>
          </View>

          <Text style={styles.subsectionTitle}>3.2 Security Measures</Text>
          <Text style={styles.bodyText}>
            We implement industry-standard security measures including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• End-to-end encryption</Text>
            <Text style={styles.bulletItem}>• Secure authentication protocols</Text>
            <Text style={styles.bulletItem}>• Regular security audits</Text>
            <Text style={styles.bulletItem}>• Access controls and user authentication</Text>
            <Text style={styles.bulletItem}>• Automatic logout after inactivity</Text>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
          </View>
          
          <Text style={styles.bodyText}>
            We do not sell, trade, or rent your personal information. We may share information only in the following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• With authorized Mary Free Bed personnel for clinical purposes</Text>
            <Text style={styles.bulletItem}>• For research purposes (de-identified data only)</Text>
            <Text style={styles.bulletItem}>• When required by law or legal process</Text>
            <Text style={styles.bulletItem}>• To protect rights, property, or safety</Text>
            <Text style={styles.bulletItem}>• With your explicit consent</Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>5. HIPAA Compliance</Text>
          </View>
          
          <Text style={styles.bodyText}>
            This App is designed to comply with the Health Insurance Portability and Accountability Act (HIPAA). 
            We implement appropriate safeguards to protect protected health information (PHI):
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Patient data is de-identified using unique participant IDs</Text>
            <Text style={styles.bulletItem}>• No direct patient identifiers (names, MRNs) are stored in the App</Text>
            <Text style={styles.bulletItem}>• Clinicians must maintain separate records linking participant IDs to patient identities</Text>
            <Text style={styles.bulletItem}>• All data transmission is encrypted</Text>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hand-right" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
          </View>
          
          <Text style={styles.bodyText}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Access your personal information</Text>
            <Text style={styles.bulletItem}>• Request correction of inaccurate data</Text>
            <Text style={styles.bulletItem}>• Request deletion of your account and data</Text>
            <Text style={styles.bulletItem}>• Opt-out of research data usage</Text>
            <Text style={styles.bulletItem}>• Export your assessment data</Text>
            <Text style={styles.bulletItem}>• Withdraw consent at any time</Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>7. Data Retention</Text>
          </View>
          
          <Text style={styles.bodyText}>
            We retain your information for as long as necessary to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide the App services</Text>
            <Text style={styles.bulletItem}>• Comply with legal obligations</Text>
            <Text style={styles.bulletItem}>• Resolve disputes</Text>
            <Text style={styles.bulletItem}>• Conduct research (de-identified data may be retained indefinitely)</Text>
          </View>
          <Text style={styles.bodyText}>
            Assessment data stored locally can be deleted at any time through the App settings.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
          </View>
          
          <Text style={styles.bodyText}>
            The App uses the following third-party services:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Firebase (Google) - Cloud storage and authentication</Text>
            <Text style={styles.bulletItem}>• Expo - App development and deployment platform</Text>
          </View>
          <Text style={styles.bodyText}>
            These services have their own privacy policies and are HIPAA-compliant when configured appropriately.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="refresh" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>9. Changes to This Privacy Policy</Text>
          </View>
          
          <Text style={styles.bodyText}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Posting the new Privacy Policy in the App</Text>
            <Text style={styles.bulletItem}>• Updating the "Last Updated" date</Text>
            <Text style={styles.bulletItem}>• Sending email notifications for material changes</Text>
          </View>
          <Text style={styles.bodyText}>
            Your continued use of the App after changes constitutes acceptance of the updated policy.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={20} color="#ff9500" />
            <Text style={styles.sectionTitle}>10. Contact Us</Text>
          </View>
          
          <Text style={styles.bodyText}>
            If you have questions or concerns about this Privacy Policy, please contact us:
          </Text>
          
          <View style={styles.contactBox}>
            <View style={styles.contactItem}>
              <Ionicons name="business" size={16} color="#666" />
              <Text style={styles.contactText}>Mary Free Bed Rehabilitation Hospital</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.contactText}>Grand Rapids, Michigan</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#666" />
              <Text style={styles.contactText}>research@maryfreebed.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.contactText}>(616) 840-8000</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#999" />
          <Text style={styles.footerText}>
            Your privacy and data security are our top priorities
          </Text>
        </View>

        {/* Acknowledgment */}
        <View style={styles.acknowledgment}>
          <Text style={styles.acknowledgmentText}>
            By using the MFB Balance Assessment App, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#e65100',
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    marginBottom: 10,
    textAlign: 'justify',
  },
  bulletList: {
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555',
    marginBottom: 4,
  },
  contactBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 10,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  acknowledgment: {
    backgroundColor: '#fff8e1',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa726',
  },
  acknowledgmentText: {
    fontSize: 13,
    color: '#e65100',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});