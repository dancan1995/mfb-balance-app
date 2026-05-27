import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storage';
import { getAllAssessmentResults, deleteAssessmentResult } from '../services/firestore';

export default function HistoryScreen({ navigation }) {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataSource, setDataSource] = useState('local');

  useEffect(() => {
    loadAssessments();
    const unsubscribe = navigation.addListener('focus', loadAssessments);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterAssessments();
  }, [searchQuery, assessments]);

  const loadAssessments = async () => {
    setLoading(true);
    
    try {
      // Load from local storage
      const localData = await StorageService.getAssessments();
      
      // Try to load from Firestore
      const firestoreResult = await getAllAssessmentResults();
      
      let finalData = localData;
      let source = 'local';
      
      if (firestoreResult.success && firestoreResult.data.length > 0) {
        const cloudData = firestoreResult.data;
        
        // Create a Map to track unique assessments by participantId + timestamp
        const assessmentMap = new Map();
        
        // Add local data first
        localData.forEach(assessment => {
          const key = `${assessment.participantId}_${assessment.dateTime || assessment.completedAt}`;
          assessmentMap.set(key, { ...assessment, source: 'local' });
        });
        
        // Add cloud data (will overwrite local if same key)
        cloudData.forEach(assessment => {
          const key = `${assessment.participantId}_${assessment.dateTime || assessment.completedAt}`;
          if (!assessmentMap.has(key)) {
            assessmentMap.set(key, { ...assessment, source: 'cloud' });
          }
        });
        
        // Convert Map back to array
        finalData = Array.from(assessmentMap.values());
        source = cloudData.length > localData.length ? 'cloud' : 'merged';
        
        console.log(`History loaded from ${source}: ${finalData.length} unique assessments`);
      }
      
      // Sort by date (most recent first)
      finalData.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.dateTime);
        const dateB = new Date(b.completedAt || b.dateTime);
        return dateB - dateA;
      });
      
      setAssessments(finalData);
      setDataSource(source);
    } catch (error) {
      console.error('Error loading history:', error);
      // Fallback to local data
      const localData = await StorageService.getAssessments();
      setAssessments(localData.reverse());
      setDataSource('local');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssessments();
  };

  const filterAssessments = () => {
    if (!searchQuery.trim()) {
      setFilteredAssessments(assessments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = assessments.filter(a => 
      a.participantId?.toString().includes(query) ||
      a.ptName?.toLowerCase().includes(query) ||
      a.population?.toLowerCase().includes(query) ||
      a.employmentId?.toLowerCase().includes(query)
    );
    
    setFilteredAssessments(filtered);
  };

  const handleViewDetails = (assessment) => {
    navigation.navigate('AssessmentDetail', { assessment });
  };

  const handleDeleteAssessment = (item) => {
    Alert.alert(
      'Delete Assessment',
      `Delete assessment for Participant ID ${item.participantId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from Firestore if it has a firestoreId
              if (item.firestoreId || item.id) {
                await deleteAssessmentResult(item.firestoreId || item.id);
              }
              
              // Delete from local storage
              await StorageService.deleteAssessment(item.id);
              
              // Refresh the list
              await loadAssessments();
              
              Alert.alert('Success', 'Assessment deleted');
            } catch (error) {
              console.error('Error deleting assessment:', error);
              Alert.alert('Error', 'Failed to delete assessment');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.historyCard}>
      <TouchableOpacity onPress={() => handleViewDetails(item)} activeOpacity={0.7}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.participantId}>ID: {item.participantId}</Text>
              {dataSource === 'cloud' && (
                <Ionicons name="cloud" size={16} color="#4caf50" />
              )}
            </View>
            <Text style={styles.dateTime}>
              {new Date(item.completedAt || item.dateTime).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>PT:</Text>
            <Text style={styles.value}>{item.ptName}</Text>
          </View>
          
          {item.employmentId && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Employment ID:</Text>
              <Text style={styles.value}>{item.employmentId}</Text>
            </View>
          )}
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>Population:</Text>
            <Text style={styles.value}>{item.population}</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>Setting:</Text>
            <Text style={styles.value}>{item.setting}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>{item.primaryCAT}:</Text>
            <Text style={styles.value}>
              {item.primaryRawScore} (Rasch: {item.primaryRaschScore})
            </Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>Fall Risk:</Text>
            <Text style={[styles.value, styles[`risk${item.primaryFallRisk}`]]}>
              {item.primaryFallRisk}
            </Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{item.totalTimeMin} min</Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => handleViewDetails(item)}
            >
              <Ionicons name="eye" size={18} color="#2c5aa0" />
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAssessment(item)}
            >
              <Ionicons name="trash" size={18} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c8dbc" />
        <Text style={styles.loadingText}>Loading assessment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageWrapper}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Assessment History</Text>
          {dataSource === 'cloud' && (
            <View style={styles.cloudBadge}>
              <Ionicons name="cloud-done" size={14} color="#4caf50" />
              <Text style={styles.cloudBadgeText}>Cloud</Text>
            </View>
          )}
          {dataSource === 'merged' && (
            <View style={[styles.cloudBadge, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="sync" size={14} color="#2196f3" />
              <Text style={[styles.cloudBadgeText, { color: '#2196f3' }]}>Synced</Text>
            </View>
          )}
        </View>
        
        <Searchbar
          placeholder="Search by ID, name, or population"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#2c5aa0"
        />
      </View>

      {filteredAssessments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching assessments found' : 'No assessment history available'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Completed assessments will appear here'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.countContainer}>
            <Text style={styles.count}>
              {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''}
              {searchQuery && ` (filtered from ${assessments.length})`}
            </Text>
          </View>
          <FlatList
            data={filteredAssessments}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id || `${item.participantId}_${index}`}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3c8dbc']}
              />
            }
          />
        </>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
  },
  pageWrapper: {
    width: '100%',
    maxWidth: 960,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3c8dbc',
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  cloudBadgeText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  countContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  listContainer: {
    padding: 15,
  },
  historyCard: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3c8dbc',
  },
  dateTime: {
    fontSize: 12,
    color: '#666',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  riskLow: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  riskModerate: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  riskHigh: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2c5aa0',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});