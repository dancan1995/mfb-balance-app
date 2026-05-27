import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Section({ number, icon, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#2c5aa0" />
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

function SubHeading({ text }) {
  return <Text style={styles.subHeading}>{text}</Text>;
}

export default function PrivacyPolicyScreen({ navigation, route }) {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
          <Ionicons name="shield-checkmark" size={22} color="#2c5aa0" />
          <Text style={styles.introText}>
            Mary Free Bed Rehabilitation Hospital ("we," "us," or "our") is committed to protecting
            the privacy of clinicians and patients who interact with the MFB Balance App. This policy
            describes exactly what data we collect, how it is stored, who can access it, and your rights
            regarding that data.
          </Text>
        </View>

        <Section number="1" icon="list" title="What Data We Collect">
          <SubHeading text="1.1 Clinician Account Information" />
          <Text style={styles.body}>Collected at login and saved to your user profile in Firebase:</Text>
          <Bullet text="Full name and email address" />
          <Bullet text="Firebase user ID (UID)" />
          <Bullet text="Account role (clinician or administrator)" />
          <Bullet text="Login timestamps (created, last login)" />

          <SubHeading text="1.2 Assessment Configuration Data" />
          <Text style={styles.body}>Recorded when you start each assessment session:</Text>
          <Bullet text="Globally unique de-identified Participant ID (auto-generated, never reused across any clinician account)" />
          <Bullet text="Patient population category (e.g., Stroke, Parkinson's Disease, General, etc.)" />
          <Bullet text="Clinical setting (Inpatient / Outpatient)" />
          <Bullet text="Primary CAT selected (BBS or FGA) and Alternate CAT" />
          <Bullet text="Seed value used to initialise the adaptive item sequence" />

          <SubHeading text="1.3 Assessment Scores & Timing Data" />
          <Text style={styles.body}>
            Recorded for every item administered during both the primary and alternate test phases:
          </Text>
          <Bullet text="Per-item scores — each of the 14 BBS items (0–4) or 10 FGA items (0–3), or -1 if marked Not Administered" />
          <Bullet text="Per-item time-on-task in seconds (time from item presentation to score entry)" />
          <Bullet text="Threshold time — the total elapsed time (seconds) and item count at which the CAT stopping criterion (Standard Error ≤ 0.32) was reached" />
          <Bullet text="Total assessment duration in seconds and minutes" />
          <Bullet text="Computed raw score, Rasch-converted score, and fall-risk classification (Low / Moderate / High) for both primary and alternate tests" />
          <Bullet text="Date and time of assessment completion" />

          <SubHeading text="1.4 In-Progress Session Data" />
          <Bullet text="Current test phase (primary or alternate), current item index, and all scores entered so far" />
          <Bullet text="Elapsed time at the point of saving" />
          <Bullet text="Auto-saved locally every 30 seconds and synced to Firestore to prevent data loss" />

          <SubHeading text="1.5 Technical Information" />
          <Bullet text="Platform / operating system (iOS, Android, or Web)" />
          <Bullet text="App version and runtime errors (for debugging only)" />
        </Section>

        <Section number="2" icon="eye" title="How We Use Your Data">
          <Bullet text="To authenticate your account and maintain your session securely" />
          <Bullet text="To generate and display assessment results (scores, Rasch conversions, fall-risk classifications) immediately after assessment completion" />
          <Bullet text="To populate the History screen with your past assessments and the Dashboard with aggregate statistics" />
          <Bullet text="To enable Save & Exit so you can resume in-progress assessments across devices" />
          <Bullet text="To allow the designated administrator to download a comprehensive XLSX report of all clinician assessments for research, quality improvement, and clinical analysis" />
          <Bullet text="To compute globally unique Participant IDs by scanning all existing records across all clinician accounts" />
          <Bullet text="To improve the accuracy of the CAT algorithm through aggregate de-identified data analysis" />
        </Section>

        <Section number="3" icon="lock-closed" title="Data Storage & Security">
          <SubHeading text="3.1 Local Storage" />
          <Text style={styles.body}>
            Assessment history, saved sessions, and user preferences are cached on your device using
            AsyncStorage. This data remains on-device until you log out or delete it manually.
          </Text>

          <SubHeading text="3.2 Cloud Storage (Firebase Firestore)" />
          <Text style={styles.body}>
            All assessment records are stored in Google Firebase Firestore, hosted on Google Cloud
            Platform infrastructure. Data is organised in the following collections:
          </Text>
          <Bullet text="assessmentResults — completed assessments with all scores, timing, and outcome fields" />
          <Bullet text="assessmentConfigs — assessment configuration records created at session start" />
          <Bullet text="assessmentProgress — auto-saved in-progress session data" />
          <Bullet text="users — clinician profile records" />

          <SubHeading text="3.3 Security Measures" />
          <Bullet text="All data in transit is encrypted via HTTPS/TLS (enforced by Firebase)" />
          <Bullet text="Firestore security rules restrict read/write access to authenticated users only" />
          <Bullet text="Firebase credentials (API keys) are stored as server-side environment variables and are never embedded in public source code" />
          <Bullet text="Firebase Authentication manages session tokens with automatic expiry" />
          <Bullet text="The admin XLSX download feature is restricted to a single designated administrator account verified by email address" />
        </Section>

        <Section number="4" icon="people" title="Who Can Access Your Data">
          <SubHeading text="4.1 You (the clinician)" />
          <Text style={styles.body}>
            You can view, search, and delete your own assessment records via the History screen.
            You can also delete in-progress sessions from the Saved Sessions screen.
          </Text>

          <SubHeading text="4.2 The Administrator" />
          <Text style={styles.body}>
            The designated MFB administrator account can view and download all assessments submitted
            by all clinicians as an XLSX file. This includes clinician name, email, all item scores,
            per-item timing, threshold data, and computed outcomes — but never direct patient identifiers.
          </Text>

          <SubHeading text="4.3 Third-Party Services" />
          <Bullet text="Google Firebase / Firestore — cloud database and authentication provider" />
          <Bullet text="Expo — cross-platform app build and deployment infrastructure" />
          <Bullet text="Render — web hosting platform for the web version of the App" />
          <Text style={[styles.body, { marginTop: 8 }]}>
            These providers operate under their own privacy policies and data processing agreements.
            We do not sell, rent, or trade your data to any other third party.
          </Text>
        </Section>

        <Section number="5" icon="medical" title="HIPAA Compliance">
          <Text style={styles.body}>
            The App is designed to support HIPAA-compliant clinical workflows:
          </Text>
          <Bullet text="No direct patient identifiers (names, dates of birth, MRN, addresses) are entered into or stored by the App" />
          <Bullet text="Patients are represented only by a de-identified, auto-generated Participant ID" />
          <Bullet text="Clinicians are responsible for maintaining a separate, secure record that links Participant IDs to actual patient identities" />
          <Bullet text="All data transmission between the App and Firebase is encrypted" />
          <Bullet text="Access to the cloud database requires authenticated MFB credentials" />
        </Section>

        <Section number="6" icon="hand-right" title="Your Rights">
          <Bullet text="Access — request a copy of all data associated with your account" />
          <Bullet text="Correction — request correction of inaccurate profile or assessment records" />
          <Bullet text="Deletion — delete individual assessments via the History screen; request full account deletion by contacting the administrator" />
          <Bullet text="Portability — the administrator can export your data as XLSX on request" />
          <Bullet text="Restriction — request that your data be excluded from aggregate research analysis" />
          <Bullet text="Withdrawal — stop using the App at any time; locally cached data can be cleared via the Settings screen" />
        </Section>

        <Section number="7" icon="time" title="Data Retention">
          <Text style={styles.body}>
            Assessment records in Firebase Firestore are retained indefinitely for longitudinal research
            and clinical quality purposes unless deletion is requested. In-progress sessions saved locally
            are retained until the session is resumed and completed, manually deleted, or the App is
            uninstalled. Clinician profile data is retained while the account remains active.
          </Text>
        </Section>

        <Section number="8" icon="refresh" title="Changes to This Policy">
          <Text style={styles.body}>
            We may update this Privacy Policy as the App evolves. The "Last Updated" date at the top
            will reflect any revision. Material changes will be communicated by email to registered
            clinicians. Continued use of the App after updates constitutes acceptance of the revised policy.
          </Text>
        </Section>

        <Section number="9" icon="mail" title="Contact Us">
          <Text style={styles.body}>
            For privacy questions, data requests, or to report a concern:
          </Text>
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
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.contactText}>(616) 840-8000</Text>
            </View>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('mailto:research@maryfreebed.com')}
            >
              <Ionicons name="mail" size={18} color="#fff" />
              <Text style={styles.contactBtnText}>Email Privacy Team</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <View style={styles.ackBox}>
          <Ionicons name="shield-checkmark" size={24} color="#2c5aa0" />
          <Text style={styles.ackText}>
            By using the MFB Balance App you acknowledge that you have read and understood this
            Privacy Policy and consent to the collection and use of data as described.
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
    backgroundColor: '#2c5aa0',
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

  subHeading: { fontSize: 14, fontWeight: '700', color: '#2c5aa0', marginTop: 12, marginBottom: 6 },
  body: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 8 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingLeft: 4 },
  bulletDot: { color: '#2c5aa0', fontWeight: 'bold', fontSize: 16, marginRight: 8, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 22 },

  contactBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2c5aa0',
    gap: 10,
    marginTop: 8,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { fontSize: 14, color: '#333' },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2c5aa0',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  contactBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  ackBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#e8eaf6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2c5aa0',
    marginTop: 8,
    marginBottom: 24,
  },
  ackText: { flex: 1, fontSize: 13, color: '#1a3a5c', lineHeight: 20, fontWeight: '500' },

  footer: { alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 4 },
  footerText: { fontSize: 12, color: '#999' },
});
