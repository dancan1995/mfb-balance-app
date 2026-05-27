import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function AssessmentDetailScreen({ route, navigation }) {
  const { assessment } = route.params;
  const [showPrimaryScores, setShowPrimaryScores] = useState(false);
  const [showAlternateScores, setShowAlternateScores] = useState(false);

  const handleDownload = async () => {
    try {
      const csvContent = generateCSV();
      const fileName = `assessment_${assessment.participantId}_${new Date(assessment.dateTime || assessment.completedAt).toISOString().slice(0, 10)}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `File saved to ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download results');
      console.error(error);
    }
  };

  const generateCSV = () => {
    let csv = `Assessment Results
Participant ID,${assessment.participantId}
PT Name,${assessment.ptName}
Employment ID,${assessment.employmentId || 'N/A'}
Date/Time,${new Date(assessment.dateTime || assessment.completedAt).toLocaleString()}
Population,${assessment.population}
Setting,${assessment.setting}
Seed Value,${assessment.seedValue || 'None'}

Primary Test,${assessment.primaryCAT}
Raw Score,${assessment.primaryRawScore}
Rasch Score,${assessment.primaryRaschScore}
Fall Risk,${assessment.primaryFallRisk}

Alternate Test,${assessment.alternateCAT}
Raw Score,${assessment.alternateRawScore}
Rasch Score,${assessment.alternateRaschScore}
Fall Risk,${assessment.alternateFallRisk}

Total Time (min),${assessment.totalTimeMin}
`;
    
    return csv;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return '#28a745';
      case 'Moderate': return '#ffc107';
      case 'High': return '#dc3545';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <View style={styles.header}>
            <Ionicons name="document-text" size={48} color="#2c5aa0" />
            <Text style={styles.title}>Assessment Details</Text>
          </View>

          {/* Assessment Information */}
          <View style={styles.detailsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#2c5aa0" />
              <Text style={styles.sectionTitle}>Assessment Information</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Participant ID:</Text>
              <Text style={styles.detailValue}>{assessment.participantId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PT/Clinician:</Text>
              <Text style={styles.detailValue}>{assessment.ptName}</Text>
            </View>
            {assessment.employmentId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Employment ID:</Text>
                <Text style={styles.detailValue}>{assessment.employmentId}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Population:</Text>
              <Text style={styles.detailValue}>{assessment.population}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Setting:</Text>
              <Text style={styles.detailValue}>{assessment.setting}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(assessment.dateTime || assessment.completedAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Time:</Text>
              <Text style={styles.detailValue}>{assessment.totalTimeMin} minutes</Text>
            </View>
            {assessment.seedValue && assessment.seedValue !== 'None' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seed Value:</Text>
                <Text style={styles.detailValue}>{assessment.seedValue}</Text>
              </View>
            )}
          </View>

          {/* Primary Results */}
          <View style={[styles.resultPanel, styles.primaryPanel]}>
            <View style={styles.panelHeader}>
              <Ionicons name="trophy" size={24} color="#2196f3" />
              <Text style={styles.panelTitle}>{assessment.primaryCAT} Results</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Raw Score:</Text>
              <Text style={styles.resultValue}>{assessment.primaryRawScore}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Rasch Score:</Text>
              <Text style={styles.resultValue}>{assessment.primaryRaschScore}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Fall Risk:</Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(assessment.primaryFallRisk) }]}>
                <Text style={styles.riskBadgeText}>{assessment.primaryFallRisk}</Text>
              </View>
            </View>
          </View>

          {/* Alternate Results */}
          <View style={[styles.resultPanel, styles.alternatePanel]}>
            <View style={styles.panelHeader}>
              <Ionicons name="ribbon" size={24} color="#9c27b0" />
              <Text style={styles.panelTitle}>{assessment.alternateCAT} Results</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Raw Score:</Text>
              <Text style={styles.resultValue}>{assessment.alternateRawScore}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Rasch Score:</Text>
              <Text style={styles.resultValue}>{assessment.alternateRaschScore}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Fall Risk:</Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(assessment.alternateFallRisk) }]}>
                <Text style={styles.riskBadgeText}>{assessment.alternateFallRisk}</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            icon={() => <Ionicons name="arrow-back" size={20} color="#2c5aa0" />}
          >
            Back to History
          </Button>
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
  card: {
    margin: 16,
    borderRadius: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#2c5aa0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  resultPanel: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryPanel: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  alternatePanel: {
    backgroundColor: '#f3e5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonSection: {
    gap: 12,
    marginTop: 8,
  },
  downloadButton: {
    backgroundColor: '#00a65a',
    borderRadius: 12,
  },
  backButton: {
    borderColor: '#2c5aa0',
    borderRadius: 12,
  },
});