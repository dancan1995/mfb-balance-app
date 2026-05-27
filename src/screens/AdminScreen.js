import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllAssessmentResults } from '../services/firestore';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Actual item names for each test
const BBS_ITEM_NAMES = [
  'Sitting_to_Standing',
  'Standing_Unsupported',
  'Sitting_Unsupported_Feet_on_Floor',
  'Standing_to_Sitting',
  'Transfers',
  'Standing_Unsupported_Eyes_Closed',
  'Standing_Unsupported_Feet_Together',
  'Reaching_Forward_Outstretched_Arm',
  'Pick_Up_Object_from_Floor',
  'Turning_to_Look_Behind_Over_Shoulders',
  'Turn_360_Degrees',
  'Placing_Alternate_Foot_on_Step',
  'Tandem_Stance_One_Foot_in_Front',
  'Standing_on_One_Leg',
];

const FGA_ITEM_NAMES = [
  'Gait_Level_Surface',
  'Change_in_Gait_Speed',
  'Gait_Horizontal_Head_Turns',
  'Gait_Vertical_Head_Turns',
  'Gait_and_Pivot_Turn',
  'Step_Over_Obstacle',
  'Gait_Narrow_Base_of_Support',
  'Gait_Eyes_Closed',
  'Ambulating_Backwards',
  'Steps_Stairs',
];

function fmt(val, fallback = '') {
  return val !== undefined && val !== null ? val : fallback;
}

function buildItemColumns(prefix, itemNames, scores, durations) {
  const scoreVals = itemNames.map((_, i) => {
    const v = scores[i];
    return v === undefined || v === null ? '' : v === -1 ? 'N/A' : v;
  });
  const timeVals = itemNames.map((_, i) =>
    durations[i] !== undefined ? durations[i] : ''
  );
  const scoreHeaders = itemNames.map(n => `${prefix}_${n}_Score`);
  const timeHeaders = itemNames.map(n => `${prefix}_${n}_Time_sec`);
  return { scoreHeaders, timeHeaders, scoreVals, timeVals };
}

function buildSheetData(assessments) {
  // Build headers using BBS names for P_BBS / A_BBS and FGA names for P_FGA / A_FGA
  const pBBSScoreH = BBS_ITEM_NAMES.map(n => `P_BBS_${n}_Score`);
  const pBBSTimeH  = BBS_ITEM_NAMES.map(n => `P_BBS_${n}_Time_sec`);
  const pFGAScoreH = FGA_ITEM_NAMES.map(n => `P_FGA_${n}_Score`);
  const pFGATimeH  = FGA_ITEM_NAMES.map(n => `P_FGA_${n}_Time_sec`);
  const aBBSScoreH = BBS_ITEM_NAMES.map(n => `A_BBS_${n}_Score`);
  const aBBSTimeH  = BBS_ITEM_NAMES.map(n => `A_BBS_${n}_Time_sec`);
  const aFGAScoreH = FGA_ITEM_NAMES.map(n => `A_FGA_${n}_Score`);
  const aFGATimeH  = FGA_ITEM_NAMES.map(n => `A_FGA_${n}_Time_sec`);

  const headers = [
    'Participant_ID',
    'Date_Completed',
    'Time_Completed',
    'Clinician_Name',
    'Clinician_Email',
    'Population',
    'Setting',
    'Primary_CAT',
    'Alternate_CAT',
    'Seed_Value',
    // Primary summary
    'Primary_Raw_Score',
    'Primary_Rasch_Score',
    'Primary_Fall_Risk',
    'Primary_Items_Scored',
    // Primary BBS item scores & times (populated when Primary_CAT = BBS)
    ...pBBSScoreH,
    ...pBBSTimeH,
    // Primary FGA item scores & times (populated when Primary_CAT = FGA)
    ...pFGAScoreH,
    ...pFGATimeH,
    // Alternate summary
    'Alternate_Raw_Score',
    'Alternate_Rasch_Score',
    'Alternate_Items_Scored',
    // Alternate BBS item scores & times (populated when Alternate_CAT = BBS)
    ...aBBSScoreH,
    ...aBBSTimeH,
    // Alternate FGA item scores & times (populated when Alternate_CAT = FGA)
    ...aFGAScoreH,
    ...aFGATimeH,
    // Overall timing
    'Total_Time_sec',
    'Total_Time_min',
    'Primary_Threshold_Time_sec',
    'Primary_Threshold_Item_Count',
    'Alternate_Threshold_Time_sec',
    'Alternate_Threshold_Item_Count',
  ];

  const empty14 = Array(14).fill('');
  const empty10 = Array(10).fill('');

  const rows = assessments.map(a => {
    const dt = a.completedAt ? new Date(a.completedAt) : new Date();
    const dateStr = dt.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const pScores = a.primaryScores || [];
    const aScores = a.alternateScores || [];
    const pDur = a.primaryItemDurations || {};
    const aDur = a.alternateItemDurations || {};
    const primaryCAT = (a.primaryCAT || '').toUpperCase();
    const alternateCAT = (a.alternateCAT || '').toUpperCase();

    // Primary columns: fill BBS cols if primary is BBS, FGA cols if primary is FGA
    let pBBSScoreVals, pBBSTimeVals, pFGAScoreVals, pFGATimeVals;
    if (primaryCAT === 'BBS') {
      const c = buildItemColumns('P_BBS', BBS_ITEM_NAMES, pScores, pDur);
      pBBSScoreVals = c.scoreVals; pBBSTimeVals = c.timeVals;
      pFGAScoreVals = empty10; pFGATimeVals = empty10;
    } else {
      const c = buildItemColumns('P_FGA', FGA_ITEM_NAMES, pScores, pDur);
      pFGAScoreVals = c.scoreVals; pFGATimeVals = c.timeVals;
      pBBSScoreVals = empty14; pBBSTimeVals = empty14;
    }

    // Alternate columns
    let aBBSScoreVals, aBBSTimeVals, aFGAScoreVals, aFGATimeVals;
    if (alternateCAT === 'BBS') {
      const c = buildItemColumns('A_BBS', BBS_ITEM_NAMES, aScores, aDur);
      aBBSScoreVals = c.scoreVals; aBBSTimeVals = c.timeVals;
      aFGAScoreVals = empty10; aFGATimeVals = empty10;
    } else {
      const c = buildItemColumns('A_FGA', FGA_ITEM_NAMES, aScores, aDur);
      aFGAScoreVals = c.scoreVals; aFGATimeVals = c.timeVals;
      aBBSScoreVals = empty14; aBBSTimeVals = empty14;
    }

    const countScored = arr => arr.filter(s => s !== null && s !== undefined).length;

    return [
      fmt(a.participantId),
      dateStr,
      timeStr,
      fmt(a.clinicianName, fmt(a.ptName)),
      fmt(a.clinicianEmail),
      fmt(a.population),
      fmt(a.setting),
      fmt(a.primaryCAT),
      fmt(a.alternateCAT),
      fmt(a.seedValue),
      fmt(a.primaryRawScore, 0),
      fmt(a.primaryRaschScore, 0),
      fmt(a.primaryFallRisk),
      countScored(pScores),
      ...pBBSScoreVals,
      ...pBBSTimeVals,
      ...pFGAScoreVals,
      ...pFGATimeVals,
      fmt(a.alternateRawScore, 0),
      fmt(a.alternateRaschScore, 0),
      countScored(aScores),
      ...aBBSScoreVals,
      ...aBBSTimeVals,
      ...aFGAScoreVals,
      ...aFGATimeVals,
      fmt(a.totalTimeSec, fmt(a.totalTimeMin ? (parseFloat(a.totalTimeMin) * 60).toFixed(0) : '')),
      fmt(a.totalTimeMin),
      fmt(a.primaryThresholdTimeSec),
      fmt(a.primaryThresholdItemCount),
      fmt(a.alternateThresholdTimeSec),
      fmt(a.alternateThresholdItemCount),
    ];
  });

  return [headers, ...rows];
}

async function exportWeb(assessments) {
  const data = buildSheetData(assessments);
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto-width columns
  const colWidths = data[0].map((_, colIdx) => ({
    wch: Math.max(...data.map(row => String(row[colIdx] ?? '').length), String(data[0][colIdx]).length) + 2,
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MFB Assessments');

  const filename = `MFB_Assessments_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

async function exportMobile(assessments) {
  const data = buildSheetData(assessments);
  const csv = data
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const filename = `MFB_Assessments_${new Date().toISOString().slice(0, 10)}.csv`;
  const uri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export Assessment Data' });
}

export default function AdminScreen({ navigation }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllAssessmentResults();
      if (result.success) {
        setAssessments(result.data);
      } else {
        setError('Failed to load data from cloud');
      }
    } catch (e) {
      setError('Connection error. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (assessments.length === 0) {
      Alert.alert('No Data', 'There are no assessments to export yet.');
      return;
    }
    setExporting(true);
    try {
      if (Platform.OS === 'web') {
        await exportWeb(assessments);
      } else {
        await exportMobile(assessments);
      }
    } catch (e) {
      console.error('Export error:', e);
      Alert.alert('Export Failed', 'Could not generate the file. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const RISK_COLOR = { Low: '#28a745', Moderate: '#ffc107', High: '#dc3545' };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="shield-checkmark" size={20} color="#ff9500" />
          <Text style={styles.headerText}>Admin Data Panel</Text>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn} disabled={loading}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <View style={styles.pageWrapper}>

          {/* Export card */}
          <View style={styles.exportCard}>
            <View style={styles.exportLeft}>
              <Text style={styles.exportTitle}>Export All Data</Text>
              <Text style={styles.exportSubtitle}>
                {assessments.length} record{assessments.length !== 1 ? 's' : ''} · All variables included
              </Text>
              <Text style={styles.exportNote}>
                Includes item scores, item durations, threshold times, clinician details, and timestamps
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
              onPress={handleExport}
              disabled={exporting || loading}
            >
              {exporting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="download" size={20} color="#fff" />
                  <Text style={styles.exportBtnText}>{Platform.OS === 'web' ? 'Download XLSX' : 'Export CSV'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          {assessments.length > 0 && (() => {
            const total = assessments.length;
            const high = assessments.filter(a => a.primaryFallRisk === 'High').length;
            const moderate = assessments.filter(a => a.primaryFallRisk === 'Moderate').length;
            const low = assessments.filter(a => a.primaryFallRisk === 'Low').length;
            const clinicians = new Set(assessments.map(a => a.clinicianEmail)).size;
            return (
              <View style={styles.statsRow}>
                {[
                  { label: 'Total', value: total, color: '#2c5aa0' },
                  { label: 'Low Risk', value: low, color: '#28a745' },
                  { label: 'Moderate', value: moderate, color: '#ffc107' },
                  { label: 'High Risk', value: high, color: '#dc3545' },
                  { label: 'Clinicians', value: clinicians, color: '#9c27b0' },
                ].map(s => (
                  <View key={s.label} style={styles.statBox}>
                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            );
          })()}

          {/* Data table */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2c5aa0" />
              <Text style={styles.loadingText}>Loading assessment data…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={32} color="#dc3545" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : assessments.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No assessments yet</Text>
              <Text style={styles.emptySubtext}>Data will appear here once clinicians complete assessments</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator style={styles.tableScroll}>
              <View>
                {/* Table header */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  {['ID', 'Date', 'Time', 'Clinician', 'Email', 'Population', 'Setting', 'Primary', 'P.Score', 'P.Rasch', 'Risk', 'Items\nScored', 'Total\nTime(s)', 'Threshold\nTime(s)', 'Threshold\nItems', 'Alternate', 'A.Score', 'A.Rasch'].map((h, i) => (
                    <View key={i} style={[styles.tableCell, styles.headerCell, { width: COLS[i] }]}>
                      <Text style={styles.headerCellText}>{h}</Text>
                    </View>
                  ))}
                </View>

                {/* Data rows */}
                {assessments.map((a, idx) => {
                  const dt = a.completedAt ? new Date(a.completedAt) : null;
                  const dateStr = dt ? dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';
                  const timeStr = dt ? dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
                  const riskColor = RISK_COLOR[a.primaryFallRisk] || '#666';
                  const pScored = (a.primaryScores || []).filter(s => s !== null && s !== undefined).length;
                  return (
                    <View key={a.firestoreId || idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[0], color: '#2c5aa0', fontWeight: '700' }]}>#{fmt(a.participantId)}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[1] }]}>{dateStr}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[2] }]}>{timeStr}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[3] }]} numberOfLines={1}>{fmt(a.clinicianName, fmt(a.ptName, '—'))}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[4], fontSize: 11 }]} numberOfLines={1}>{fmt(a.clinicianEmail, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[5] }]} numberOfLines={1}>{fmt(a.population, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[6] }]}>{fmt(a.setting, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[7], fontWeight: '600' }]}>{fmt(a.primaryCAT, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[8], fontWeight: '600' }]}>{fmt(a.primaryRawScore, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[9] }]}>{fmt(a.primaryRaschScore, '—')}</Text>
                      <View style={[styles.tableCell, { width: COLS[10], justifyContent: 'center' }]}>
                        <Text style={[styles.riskPill, { color: riskColor, borderColor: riskColor }]}>{fmt(a.primaryFallRisk, '—')}</Text>
                      </View>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[11], textAlign: 'center' }]}>{pScored}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[12], textAlign: 'center' }]}>{fmt(a.totalTimeSec, fmt(a.totalTimeMin ? (parseFloat(a.totalTimeMin) * 60).toFixed(0) : '—'))}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[13], textAlign: 'center' }]}>{fmt(a.primaryThresholdTimeSec, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[14], textAlign: 'center' }]}>{fmt(a.primaryThresholdItemCount, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[15], fontWeight: '600' }]}>{fmt(a.alternateCAT, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[16], fontWeight: '600' }]}>{fmt(a.alternateRawScore, '—')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, { width: COLS[17] }]}>{fmt(a.alternateRaschScore, '—')}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {assessments.length > 0 && (
            <Text style={styles.tableNote}>
              Scroll horizontally to see all columns. Download XLSX for full item-level data.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const COLS = [60, 80, 70, 110, 150, 110, 80, 70, 70, 70, 80, 60, 80, 90, 80, 70, 70, 70];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#0d2137',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
  },
  refreshBtn: {
    padding: 6,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  pageWrapper: {
    width: '100%',
    maxWidth: 1200,
    padding: 16,
  },
  exportCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#2c5aa0',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  exportLeft: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  exportSubtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },
  exportNote: {
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(44,90,160,0.4)' },
      ios: { shadowColor: '#2c5aa0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 5 },
    }),
  },
  exportBtnDisabled: {
    backgroundColor: '#999',
  },
  exportBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statBox: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      android: { elevation: 1 },
    }),
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 40,
    gap: 14,
  },
  loadingText: {
    fontSize: 15,
    color: '#666',
  },
  errorBox: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 19,
  },
  tableScroll: {
    backgroundColor: '#fff',
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      android: { elevation: 2 },
    }),
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableHeaderRow: {
    backgroundColor: '#1a3a5c',
    borderBottomWidth: 0,
  },
  tableRowAlt: {
    backgroundColor: '#fafbfc',
  },
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  headerCell: {
    paddingVertical: 12,
  },
  headerCellText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#333',
  },
  riskPill: {
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    textAlign: 'center',
    overflow: 'hidden',
  },
  tableNote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
