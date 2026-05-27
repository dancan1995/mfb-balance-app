import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { translations } from '../constants/translations';
import { StorageService } from '../services/storage';
import { getUserProfile, saveUserProfile, getAssessmentStats } from '../services/firestore';

const QUICK_ACTIONS = [
  {
    key: 'assessment',
    screen: 'Assessment',
    icon: 'play-circle',
    label: 'New Assessment',
    desc: 'Start a CAT balance evaluation',
    gradient: ['#2c5aa0', '#1a3a5c'],
    iconColor: '#fff',
  },
  {
    key: 'history',
    screen: 'History',
    icon: 'time',
    label: 'History',
    desc: 'Browse past assessments',
    gradient: ['#00897b', '#00695c'],
    iconColor: '#fff',
  },
  {
    key: 'dashboard',
    screen: 'Dashboard',
    icon: 'stats-chart',
    label: 'Dashboard',
    desc: 'Analytics & trends',
    gradient: ['#6d4c9e', '#4a148c'],
    iconColor: '#fff',
  },
  {
    key: 'saved',
    screen: 'Saved',
    icon: 'bookmark',
    label: 'Saved Sessions',
    desc: 'Resume in-progress work',
    gradient: ['#e65100', '#bf360c'],
    iconColor: '#fff',
  },
];

export default function HomeScreen({ navigation }) {
  const [language, setLanguage] = useState('en');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    const dimSub = Dimensions.addEventListener('change', ({ window }) => setScreenWidth(window.width));
    return () => {
      unsub();
      dimSub?.remove();
    };
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await StorageService.getCurrentUser();
      setCurrentUser(user);
      const lang = await StorageService.getLanguage();
      setLanguage(lang);
      const profileResult = await getUserProfile();
      if (profileResult.success) {
        if (profileResult.data.language && profileResult.data.language !== lang) {
          setLanguage(profileResult.data.language);
          await StorageService.saveLanguage(profileResult.data.language);
        }
        setCloudSynced(true);
      }
      const statsResult = await getAssessmentStats();
      if (statsResult.success) {
        setStats(statsResult.data);
        setCloudSynced(true);
      }
      if (lang && (!profileResult.success || !profileResult.data?.language)) {
        await saveUserProfile({ language: lang });
      }
    } catch (error) {
      console.error('Error loading home screen data:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = translations[language];
  const isWide = screenWidth > 768;
  const firstName = currentUser?.fullName?.split(' ')[0] || 'Clinician';

  const StatChip = ({ value, label, icon, color }) => (
    <View style={styles.statChip}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const QuickActionCard = ({ action }) => (
    <TouchableOpacity
      style={[styles.actionCard, isWide && styles.actionCardWide]}
      onPress={() => navigation.navigate(action.screen)}
      activeOpacity={0.82}
    >
      <LinearGradient
        colors={action.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionGradient}
      >
        <View style={styles.actionIconCircle}>
          <Ionicons name={action.icon} size={28} color={action.iconColor} />
        </View>
        <Text style={styles.actionLabel}>{action.label}</Text>
        <Text style={styles.actionDesc}>{action.desc}</Text>
        <View style={styles.actionArrow}>
          <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.page, isWide && styles.pageWide]}>
        {/* ── Hero banner ─────────────────────────────────────── */}
        <LinearGradient
          colors={['#ff9500', '#e65100']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {loading && (
            <View style={styles.heroLoadingDot}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
            </View>
          )}

          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroGreeting}>
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {firstName}
              </Text>
              <Text style={styles.heroTitle}>{t.title}</Text>
              <Text style={styles.heroSub}>{t.subtitle}</Text>
            </View>
            <View style={styles.heroLogoWrap}>
              <Ionicons name="fitness" size={44} color="rgba(255,255,255,0.25)" />
            </View>
          </View>

          {stats && stats.totalAssessments > 0 ? (
            <View style={styles.statsRow}>
              <StatChip value={stats.totalAssessments} label="Total" icon="document-text" color="#fff" />
              <View style={styles.statSep} />
              <StatChip value={stats.avgScore} label="Avg Score" icon="trending-up" color="#fff" />
              <View style={styles.statSep} />
              <StatChip value={`${stats.highRiskPct}%`} label="High Risk" icon="alert-circle" color="#fff" />
            </View>
          ) : (
            <View style={styles.heroEmptyStats}>
              <Ionicons name="clipboard-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroEmptyStatsText}>No assessments yet — start your first one below</Text>
            </View>
          )}

          {cloudSynced && (
            <View style={styles.syncPill}>
              <Ionicons name="cloud-done" size={11} color="rgba(255,255,255,0.85)" />
              <Text style={styles.syncPillText}>Cloud synced</Text>
            </View>
          )}
        </LinearGradient>

        {/* ── Quick actions ────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={[styles.actionsGrid, isWide && styles.actionsGridWide]}>
            {QUICK_ACTIONS.map((a) => (
              <QuickActionCard key={a.key} action={a} />
            ))}
          </View>
        </View>

        {/* ── Primary CTA ──────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Assessment')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#2c5aa0', '#1a3a5c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name="arrow-forward-circle" size={26} color="#ff9500" />
            <View>
              <Text style={styles.ctaTitle}>{t.clickToContinue}</Text>
              <Text style={styles.ctaSub}>Berg Balance Scale · Functional Gait Assessment</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" style={{ marginLeft: 'auto' }} />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── About CAT ────────────────────────────────────────── */}
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutIconWrap}>
              <Ionicons name="information-circle" size={22} color="#ff9500" />
            </View>
            <Text style={styles.aboutTitle}>{t.aboutCAT}</Text>
          </View>
          <Text style={styles.aboutText}>{t.aboutCATDesc}</Text>
        </View>

        <Text style={styles.version}>{t.version}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
  },
  page: {
    width: '100%',
    paddingBottom: 32,
  },
  pageWide: {
    maxWidth: 900,
  },

  // ── Hero ────────────────────────────────────────────────────
  hero: {
    paddingTop: Platform.OS === 'ios' ? 24 : 20,
    paddingBottom: 24,
    paddingHorizontal: 22,
    marginBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  heroLoadingDot: {
    position: 'absolute',
    top: 14,
    right: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  heroLogoWrap: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  statChip: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  statSep: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroEmptyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  heroEmptyStatsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    flex: 1,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  syncPillText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },

  // ── Sections ─────────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingLeft: 2,
  },

  // ── Action cards ─────────────────────────────────────────────
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionsGridWide: {
    flexWrap: 'nowrap',
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  actionCardWide: {
    minWidth: 0,
  },
  actionGradient: {
    padding: 18,
    minHeight: 130,
    justifyContent: 'flex-start',
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 16,
  },
  actionArrow: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },

  // ── Primary CTA ──────────────────────────────────────────────
  ctaButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(44,90,160,0.25)' },
      ios: { shadowColor: '#2c5aa0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  ctaSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },

  // ── About card ───────────────────────────────────────────────
  aboutCard: {
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    ...Platform.select({
      web: { boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  aboutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff8ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  aboutText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
  },

  version: {
    textAlign: 'right',
    paddingRight: 20,
    paddingTop: 4,
    color: '#9ca3af',
    fontSize: 11,
  },
});
