import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ValueBox from '../components/ValueBox';
import { StorageService } from '../services/storage';
import { getAllAssessmentResults } from '../services/firestore';

export default function DashboardScreen({ navigation }) {
  const [assessments, setAssessments] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    avgScore: 0,
    highRiskPct: 0,
    completionRate: 100,
  });
  const [riskBreakdown, setRiskBreakdown] = useState({ Low: 0, Moderate: 0, High: 0 });
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('local');

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const localData = await StorageService.getAssessments();
      const firestoreResult = await getAllAssessmentResults();

      let finalData = localData;
      let source = 'local';

      if (firestoreResult.success && firestoreResult.data.length > 0) {
        const cloudData = firestoreResult.data;
        if (cloudData.length >= localData.length) {
          finalData = cloudData;
          source = 'cloud';
        } else {
          const localIds = new Set(localData.map(a => a.participantId));
          const merged = [...localData];
          cloudData.forEach(a => {
            if (!localIds.has(a.participantId)) merged.push(a);
          });
          finalData = merged;
          source = 'merged';
        }
      }

      setAssessments(finalData);
      setDataSource(source);
      calculateMetrics(finalData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const localData = await StorageService.getAssessments();
      setAssessments(localData);
      setDataSource('local');
      calculateMetrics(localData);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data) => {
    if (data.length === 0) {
      setMetrics({ total: 0, avgScore: 0, highRiskPct: 0, completionRate: 100 });
      setRiskBreakdown({ Low: 0, Moderate: 0, High: 0 });
      return;
    }

    const total = data.length;
    const avgScore = data.reduce((sum, a) => sum + parseFloat(a.primaryRaschScore || 0), 0) / total;
    const highRiskCount = data.filter(a => a.primaryFallRisk === 'High').length;
    const highRiskPct = (highRiskCount / total * 100).toFixed(1);
    const efficientCount = data.filter(a => parseFloat(a.totalTimeMin || 0) <= 20).length;
    const completionRate = (efficientCount / total * 100).toFixed(1);

    setMetrics({ total, avgScore: avgScore.toFixed(1), highRiskPct, completionRate });

    const breakdown = { Low: 0, Moderate: 0, High: 0 };
    data.forEach(a => {
      if (a.primaryFallRisk in breakdown) breakdown[a.primaryFallRisk]++;
    });
    setRiskBreakdown(breakdown);
  };

  const RISK_CONFIG = [
    { key: 'Low', color: '#28a745', icon: 'checkmark-circle', bg: '#e8f5e9' },
    { key: 'Moderate', color: '#ffc107', icon: 'warning', bg: '#fff8e1' },
    { key: 'High', color: '#dc3545', icon: 'alert-circle', bg: '#ffebee' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5aa0" />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageWrapper}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        {/* Metric boxes */}
        <View style={styles.metricsRow}>
          <ValueBox value={metrics.total} label="Total Assessments" icon="document-text" color="#2c5aa0" />
          <ValueBox value={metrics.avgScore} label="Avg Rasch Score" icon="trending-up" color="#4caf50" />
        </View>
        <View style={styles.metricsRow}>
          <ValueBox
            value={`${metrics.highRiskPct}%`}
            label="High Fall Risk"
            icon="alert-circle"
            color={metrics.highRiskPct > 30 ? '#dc3545' : metrics.highRiskPct > 15 ? '#ffc107' : '#4caf50'}
          />
          <ValueBox
            value={`${metrics.completionRate}%`}
            label="Efficiency Rate"
            icon="speedometer"
            color={metrics.completionRate > 80 ? '#4caf50' : metrics.completionRate > 60 ? '#ffc107' : '#dc3545'}
          />
        </View>

        {assessments.length > 0 ? (
          <>
            {/* Risk Distribution */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="pie-chart" size={20} color="#2c5aa0" />
                  <Text style={styles.cardTitle}>Fall Risk Distribution</Text>
                </View>
                {RISK_CONFIG.map(({ key, color, icon, bg }) => {
                  const count = riskBreakdown[key];
                  const pct = assessments.length ? Math.round(count / assessments.length * 100) : 0;
                  return (
                    <View key={key} style={[styles.riskRow, { backgroundColor: bg }]}>
                      <Ionicons name={icon} size={20} color={color} />
                      <Text style={[styles.riskLabel, { color }]}>{key} Risk</Text>
                      <View style={styles.riskBarWrap}>
                        <View style={[styles.riskBar, { width: `${pct}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={[styles.riskCount, { color }]}>{count}</Text>
                      <Text style={styles.riskPct}>({pct}%)</Text>
                    </View>
                  );
                })}
              </Card.Content>
            </Card>

            {/* Recent Assessments */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="time" size={20} color="#2c5aa0" />
                  <Text style={styles.cardTitle}>Recent Assessments</Text>
                </View>

                {/* Table header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.2 }]}>ID</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.5 }]}>Test</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.2 }]}>Score</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.5 }]}>Risk</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Date</Text>
                </View>

                {assessments.slice(0, 8).map((a, idx) => {
                  const riskColor = a.primaryFallRisk === 'High'
                    ? '#dc3545'
                    : a.primaryFallRisk === 'Moderate' ? '#ffc107' : '#28a745';
                  const dateStr = a.completedAt
                    ? new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                    : '—';
                  return (
                    <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                      <Text style={[styles.tableCell, { flex: 1.2, fontWeight: '600', color: '#2c5aa0' }]}>
                        #{a.participantId}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5 }]}>{a.primaryCAT || '—'}</Text>
                      <Text style={[styles.tableCell, { flex: 1.2, fontWeight: '600' }]}>
                        {parseFloat(a.primaryRaschScore || 0).toFixed(1)}
                      </Text>
                      <View style={[styles.tableCell, { flex: 1.5 }]}>
                        <View style={[styles.riskPill, { backgroundColor: riskColor + '22', borderColor: riskColor }]}>
                          <Text style={[styles.riskPillText, { color: riskColor }]}>{a.primaryFallRisk}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCell, { flex: 2, color: '#666', fontSize: 12 }]}>{dateStr}</Text>
                    </View>
                  );
                })}

                {assessments.length > 8 && (
                  <Text style={styles.moreText}>+ {assessments.length - 8} more in History</Text>
                )}
              </Card.Content>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="stats-chart-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No assessment data yet</Text>
              <Text style={styles.emptySubtext}>Complete assessments to see analytics here</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  pageWrapper: {
    width: '100%',
    maxWidth: 960,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0f4f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    borderRadius: 14,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  // Risk distribution
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  riskLabel: {
    width: 90,
    fontWeight: '600',
    fontSize: 14,
  },
  riskBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  riskCount: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 28,
    textAlign: 'right',
  },
  riskPct: {
    fontSize: 12,
    color: '#888',
    width: 40,
  },
  // Table
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  tableHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    marginBottom: 2,
  },
  tableHeaderText: {
    fontWeight: '700',
    fontSize: 12,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableCell: {
    fontSize: 13,
    color: '#333',
    paddingRight: 6,
  },
  riskPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  riskPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyCard: {
    borderRadius: 14,
    marginTop: 8,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
