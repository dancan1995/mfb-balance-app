import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsAndConditionsScreen({ navigation, route }) {  // ← ADDED route HERE
  const handleContactUs = () => {
    Linking.openURL('mailto:research@maryfreebed.com');
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: November 3, 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using the MFB Balance App ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Medical Disclaimer</Text>
          <Text style={styles.paragraph}>
            The MFB Balance App is designed as an assessment tool for healthcare professionals. This App:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Does NOT replace professional medical advice, diagnosis, or treatment</Text>
            <Text style={styles.bullet}>• Should only be used by qualified healthcare professionals</Text>
            <Text style={styles.bullet}>• Results should be interpreted by trained clinicians</Text>
            <Text style={styles.bullet}>• Is not intended for self-diagnosis or self-treatment</Text>
          </View>
          <Text style={styles.paragraph}>
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            As a user of this App, you agree to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Maintain the confidentiality of patient information</Text>
            <Text style={styles.bullet}>• Comply with HIPAA and all applicable privacy regulations</Text>
            <Text style={styles.bullet}>• Use the App only for its intended purpose</Text>
            <Text style={styles.bullet}>• Ensure accurate data entry during assessments</Text>
            <Text style={styles.bullet}>• Not share your account credentials with unauthorized users</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Privacy & Security</Text>
          <Text style={styles.paragraph}>
            We take your privacy seriously:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Patient data is encrypted both in transit and at rest</Text>
            <Text style={styles.bullet}>• We comply with HIPAA regulations</Text>
            <Text style={styles.bullet}>• Data is stored securely on cloud servers</Text>
            <Text style={styles.bullet}>• You retain ownership of all assessment data</Text>
            <Text style={styles.bullet}>• We do not sell or share patient data with third parties</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Assessment Accuracy</Text>
          <Text style={styles.paragraph}>
            While we strive for accuracy, the App:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Provides computational assessments based on established scales (BBS, FGA)</Text>
            <Text style={styles.bullet}>• Results depend on accurate data input by the clinician</Text>
            <Text style={styles.bullet}>• Should be used as one component of comprehensive patient evaluation</Text>
            <Text style={styles.bullet}>• May not be suitable for all patient populations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, Mary Free Bed Rehabilitation and the App developers shall not be liable for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Any indirect, incidental, or consequential damages</Text>
            <Text style={styles.bullet}>• Clinical decisions made based solely on App results</Text>
            <Text style={styles.bullet}>• Loss of data due to device failure or connectivity issues</Text>
            <Text style={styles.bullet}>• Errors in assessment due to incorrect data entry</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of the App are owned by Mary Free Bed Rehabilitation and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Updates and Modifications</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms and Conditions at any time. Continued use of the App after changes constitutes acceptance of the modified terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your access to the App immediately, without prior notice, for any breach of these Terms and Conditions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the State of Michigan, United States, without regard to its conflict of law provisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us:
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>Mary Free Bed Rehabilitation</Text>
            <Text style={styles.contactText}>Email: research@maryfreebed.com</Text>
            <TouchableOpacity onPress={handleContactUs} style={styles.contactButton}>
              <Ionicons name="mail" size={20} color="#ff9500" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.acceptanceNote}>
          <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
          <Text style={styles.acceptanceText}>
            By logging in to our assessment app, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Mary Free Bed Rehabilitation</Text>
          <Text style={styles.footerText}>All Rights Reserved</Text>
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
    backgroundColor: '#ff9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  lastUpdated: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff9500',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  bulletList: {
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555',
    marginBottom: 4,
  },
  contactBox: {
    backgroundColor: '#fff8e1',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  contactButtonText: {
    color: '#ff9500',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptanceNote: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  acceptanceText: {
    flex: 1,
    fontSize: 13,
    color: '#2e7d32',
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});