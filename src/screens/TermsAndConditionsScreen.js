import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Section({ number, icon, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#ff9500" />
        <Text style={styles.sectionTitle}>{number}. {title}</Text>
      </View>
      {children}
    </View>
  );
}

function Bullet({ text }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

export default function TermsAndConditionsScreen({ navigation, route }) {
  const goBack = () => {
    if (route?.params?.fromSettings) {
      navigation.navigate('Settings');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.updateBanner}>
          <Ionicons name="calendar-outline" size={16} color="#e65100" />
          <Text style={styles.updateText}>Last Updated: May 26, 2026</Text>
        </View>

        <View style={styles.introBanner}>
          <Ionicons name="document-text" size={22} color="#2c5aa0" />
          <Text style={styles.introText}>
            These Terms govern your use of the MFB Balance App — a Computerized Adaptive Testing (CAT) tool
            built for Mary Free Bed Rehabilitation Hospital clinicians to administer the Berg Balance Scale (BBS)
            and Functional Gait Assessment (FGA). Please read them carefully before using the App.
          </Text>
        </View>

        <Section number="1" icon="checkmark-circle" title="Acceptance of Terms">
          <Text style={styles.body}>
            By logging in and using the MFB Balance App, you confirm that you are a licensed or supervised
            healthcare professional employed or affiliated with Mary Free Bed Rehabilitation Hospital, and you
            agree to be bound by these Terms. If you do not agree, do not use the App.
          </Text>
        </Section>

        <Section number="2" icon="medkit" title="Intended Use & Medical Disclaimer">
          <Text style={styles.body}>
            The MFB Balance App is a clinical decision-support tool, not a standalone diagnostic device. It:
          </Text>
          <Bullet text="Is intended exclusively for use by qualified healthcare professionals (physical therapists, occupational therapists, and supervised clinical staff)" />
          <Bullet text="Administers BBS (14 items, scored 0–4) and FGA (10 items, scored 0–3) using a CAT algorithm that stops when the Standard Error of measurement falls at or below 0.32" />
          <Bullet text="Computes raw scores, Rasch-converted scores, and fall-risk classifications (Low / Moderate / High) based on established clinical thresholds" />
          <Bullet text="Does NOT replace clinical judgment, full patient evaluation, or professional medical advice" />
          <Bullet text="Results must be interpreted in conjunction with a comprehensive patient assessment" />
          <Bullet text="Is not intended for patient self-use, self-diagnosis, or self-treatment" />
        </Section>

        <Section number="3" icon="person" title="User Responsibilities">
          <Text style={styles.body}>As an authorized user, you agree to:</Text>
          <Bullet text="Use only your own MFB-issued account credentials — do not share login details" />
          <Bullet text="Assign a unique de-identified Participant ID to each patient before starting an assessment" />
          <Bullet text="Maintain a separate secure record linking Participant IDs to actual patient identities (MRN, name) outside the App" />
          <Bullet text="Enter item scores and timing data accurately during each assessment session" />
          <Bullet text="Comply with HIPAA, hospital policy, and all applicable Michigan and federal regulations" />
          <Bullet text="Use the Save & Exit feature responsibly — saved sessions are stored locally and in the cloud until resumed or deleted" />
          <Bullet text="Not attempt to reverse-engineer, modify, or tamper with the App or its scoring algorithms" />
        </Section>

        <Section number="4" icon="cloud" title="Data Collection & Storage">
          <Text style={styles.body}>
            The App collects and stores the following data in Firebase Firestore (Google Cloud):
          </Text>
          <Bullet text="Clinician name, email address, and login timestamp" />
          <Bullet text="De-identified Participant ID (system-generated, globally unique across all clinician accounts)" />
          <Bullet text="Assessment configuration: population category, clinical setting, primary CAT (BBS or FGA), alternate CAT, and seed value" />
          <Bullet text="Per-item scores (0–4 for BBS, 0–3 for FGA) and per-item time-on-task in seconds for all administered items" />
          <Bullet text="Threshold timing: the elapsed time and item count at which the CAT stopping criterion was reached" />
          <Bullet text="Total assessment duration in seconds and minutes" />
          <Bullet text="Computed outcomes: raw score, Rasch score, and fall-risk classification for both primary and alternate tests" />
          <Bullet text="Date and time of assessment completion" />
          <Text style={[styles.body, { marginTop: 10 }]}>
            In-progress sessions are also auto-saved every 30 seconds to both local device storage and Firestore
            to prevent data loss.
          </Text>
        </Section>

        <Section number="5" icon="shield-checkmark" title="Assessment Accuracy & Limitations">
          <Text style={styles.body}>
            While the App implements validated psychometric algorithms, you acknowledge that:
          </Text>
          <Bullet text="Scoring accuracy depends entirely on the accuracy of the clinician's item-level observations and data entry" />
          <Bullet text="The CAT stopping criterion (SE ≤ 0.32) requires a minimum of 4 scored items before it can be triggered" />
          <Bullet text="Not-Administered items (marked -1) are excluded from score calculations" />
          <Bullet text="Fall-risk thresholds are based on published BBS and FGA cut-points and may not apply equally to all patient populations" />
          <Bullet text="The App should be used as one component of a comprehensive clinical evaluation, not as the sole basis for treatment decisions" />
        </Section>

        <Section number="6" icon="lock-closed" title="Data Security">
          <Bullet text="All data in transit is encrypted via HTTPS/TLS" />
          <Bullet text="Firebase Firestore security rules restrict read/write access to authenticated MFB clinicians only" />
          <Bullet text="The admin data export feature (XLSX download) is restricted to the designated administrator account" />
          <Bullet text="Firebase credentials are stored as environment variables and are never embedded in publicly accessible code" />
          <Bullet text="User authentication is managed via Firebase Authentication with email/password" />
        </Section>

        <Section number="7" icon="stats-chart" title="Admin Data Export">
          <Text style={styles.body}>
            A designated administrator account has access to an Admin Panel that can download all collected
            assessment data as an XLSX file. This file includes all variables listed in Section 4 for every
            assessment submitted by all clinicians. By using the App, you consent to your assessment data
            being accessible to the designated administrator for research, quality assurance, and clinical
            improvement purposes.
          </Text>
        </Section>

        <Section number="8" icon="ban" title="Prohibited Uses">
          <Text style={styles.body}>You must not:</Text>
          <Bullet text="Use the App outside a professional clinical context" />
          <Bullet text="Store any direct patient identifiers (name, date of birth, MRN) inside the App" />
          <Bullet text="Attempt to access another clinician's assessment data" />
          <Bullet text="Automate or script interactions with the App" />
          <Bullet text="Use the App on an unsecured or publicly shared device" />
        </Section>

        <Section number="9" icon="alert-circle" title="Limitation of Liability">
          <Text style={styles.body}>
            To the maximum extent permitted by law, Mary Free Bed Rehabilitation Hospital and the App
            developers are not liable for:
          </Text>
          <Bullet text="Clinical decisions made based solely on App-generated scores or risk classifications" />
          <Bullet text="Data loss due to device failure, connectivity issues, or user error" />
          <Bullet text="Assessment errors resulting from inaccurate data entry by the clinician" />
          <Bullet text="Any indirect, incidental, or consequential damages arising from App use" />
        </Section>

        <Section number="10" icon="create" title="Modifications">
          <Text style={styles.body}>
            Mary Free Bed Rehabilitation Hospital reserves the right to update these Terms at any time.
            The "Last Updated" date above will reflect any changes. Continued use of the App after updates
            constitutes acceptance of the revised Terms.
          </Text>
        </Section>

        <Section number="11" icon="scale" title="Governing Law">
          <Text style={styles.body}>
            These Terms are governed by the laws of the State of Michigan, United States. Any disputes
            arising under these Terms shall be resolved in the courts of Kent County, Michigan.
          </Text>
        </Section>

        <Section number="12" icon="mail" title="Contact">
          <View style={styles.contactBox}>
            <View style={styles.contactRow}>
              <Ionicons name="business" size={16} color="#666" />
              <Text style={styles.contactText}>Mary Free Bed Rehabilitation Hospital</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.contactText}>Grand Rapids, Michigan</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={16} color="#666" />
              <Text style={styles.contactText}>research@maryfreebed.com</Text>
            </View>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('mailto:research@maryfreebed.com')}
            >
              <Ionicons name="mail" size={18} color="#fff" />
              <Text style={styles.contactBtnText}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <View style={styles.acceptBox}>
          <Ionicons name="checkmark-circle" size={26} color="#4caf50" />
          <Text style={styles.acceptText}>
            By signing in to the MFB Balance App you confirm you have read, understood, and agree to
            these Terms and Conditions.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Mary Free Bed Rehabilitation Hospital</Text>
          <Text style={styles.footerText}>All Rights Reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 16 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSpacer: { width: 40 },

  scroll: {
    flex: 1,
    ...Platform.select({ web: { overflow: 'scroll' } }),
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },

  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  updateText: { fontSize: 13, color: '#e65100', fontWeight: '600' },

  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2c5aa0',
  },
  introText: { flex: 1, fontSize: 14, color: '#1a3a5c', lineHeight: 22 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', flex: 1 },

  body: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 10 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingLeft: 4 },
  bulletDot: { color: '#ff9500', fontWeight: 'bold', fontSize: 16, marginRight: 8, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 22 },

  contactBox: {
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    gap: 10,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { fontSize: 14, color: '#333' },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ff9500',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  contactBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  acceptBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4caf50',
    marginTop: 8,
    marginBottom: 24,
  },
  acceptText: { flex: 1, fontSize: 13, color: '#2e7d32', lineHeight: 20, fontWeight: '500' },

  footer: { alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 4 },
  footerText: { fontSize: 12, color: '#999' },
});
