/**
 * Reports Screen
 * Display analytics and summary reports for collections and payments
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface ReportSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  totalProducts: number;
  activeProducts: number;
  totalCollections: number;
  totalCollectionAmount: number;
  totalPayments: number;
  totalPaymentAmount: number;
  outstandingBalance: number;
  collectionsThisMonth: number;
  paymentsThisMonth: number;
  collectionAmountThisMonth: number;
  paymentAmountThisMonth: number;
}

interface SupplierBalance {
  supplier_id: number;
  supplier_name: string;
  supplier_code: string;
  total_collections: number;
  total_payments: number;
  balance: number;
  collection_count?: number;
  payment_count?: number;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [topBalances, setTopBalances] = useState<SupplierBalance[]>([]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: '',
  });
  const [activeFilter, setActiveFilter] = useState<DateFilter | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSummary(),
        loadTopBalances(),
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      // Use the new dedicated summary endpoint
      const response = await apiClient.get<any>('/reports/summary');
      
      setSummary({
        totalSuppliers: response.data?.totalSuppliers || 0,
        activeSuppliers: response.data?.activeSuppliers || 0,
        totalProducts: response.data?.totalProducts || 0,
        activeProducts: response.data?.activeProducts || 0,
        totalCollections: response.data?.totalCollections || 0,
        totalCollectionAmount: response.data?.totalCollectionAmount || 0,
        totalPayments: response.data?.totalPayments || 0,
        totalPaymentAmount: response.data?.totalPaymentAmount || 0,
        outstandingBalance: response.data?.outstandingBalance || 0,
        collectionsThisMonth: response.data?.collectionsThisMonth || 0,
        paymentsThisMonth: response.data?.paymentsThisMonth || 0,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadTopBalances = async () => {
    try {
      // Use the new dedicated supplier balances endpoint
      const response = await apiClient.get<any>('/reports/supplier-balances?limit=5&sort=desc');
      const balances = response.data || [];
      
      setTopBalances(balances);
    } catch (error) {
      console.error('Error loading top balances:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleDateFilterApply = () => {
    setActiveFilter(dateFilter);
    setShowDateFilter(false);
    loadReports();
  };

  const handleDateFilterClear = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setActiveFilter(null);
    setShowDateFilter(false);
    loadReports();
  };

  const handleQuickFilter = (filter: 'today' | 'week' | 'month' | 'all') => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'all':
        startDate = '';
        endDate = '';
        break;
    }

    setDateFilter({ startDate, endDate });
    setActiveFilter({ startDate, endDate });
    loadReports();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      {/* Quick Filters */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterButton, !activeFilter && styles.filterButtonActive]}
            onPress={() => handleQuickFilter('all')}
          >
            <Text style={[styles.filterButtonText, !activeFilter && styles.filterButtonTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleQuickFilter('today')}
          >
            <Text style={styles.filterButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleQuickFilter('week')}
          >
            <Text style={styles.filterButtonText}>Last 7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleQuickFilter('month')}
          >
            <Text style={styles.filterButtonText}>Last 30 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, styles.filterButtonCustom]}
            onPress={() => setShowDateFilter(true)}
          >
            <Text style={styles.filterButtonText}>Custom Range</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          
          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardValue}>{summary?.totalSuppliers || 0}</Text>
              <Text style={styles.cardLabel}>Total Suppliers</Text>
            </View>
            <View style={[styles.card, styles.cardGreen]}>
              <Text style={styles.cardValue}>{summary?.totalProducts || 0}</Text>
              <Text style={styles.cardLabel}>Total Products</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardOrange]}>
              <Text style={styles.cardValue}>{summary?.totalCollections || 0}</Text>
              <Text style={styles.cardLabel}>Total Collections</Text>
            </View>
            <View style={[styles.card, styles.cardPurple]}>
              <Text style={styles.cardValue}>{summary?.totalPayments || 0}</Text>
              <Text style={styles.cardLabel}>Total Payments</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Collections:</Text>
              <Text style={styles.financialValue}>
                ${summary?.totalCollectionAmount.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Payments:</Text>
              <Text style={[styles.financialValue, styles.textGreen]}>
                ${summary?.totalPaymentAmount.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.financialLabelBold}>Outstanding Balance:</Text>
              <Text style={[styles.financialValueBold, 
                (summary?.outstandingBalance || 0) > 0 ? styles.textRed : styles.textGreen
              ]}>
                ${Math.abs(summary?.outstandingBalance || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          
          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardInfo]}>
              <Text style={styles.cardValue}>{summary?.collectionsThisMonth || 0}</Text>
              <Text style={styles.cardLabel}>Collections</Text>
            </View>
            <View style={[styles.card, styles.cardInfo]}>
              <Text style={styles.cardValue}>{summary?.paymentsThisMonth || 0}</Text>
              <Text style={styles.cardLabel}>Payments</Text>
            </View>
          </View>
        </View>

        {/* Top Supplier Balances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Supplier Balances</Text>
          
          {topBalances.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No supplier data available</Text>
            </View>
          ) : (
            topBalances.map((balance) => (
              <View key={balance.supplier_id} style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceName}>{balance.supplier_name}</Text>
                  <Text style={styles.balanceCode}>{balance.supplier_code}</Text>
                </View>
                <View style={styles.balanceDetails}>
                  <Text style={styles.balanceDetailText}>
                    Collections: ${balance.total_collections.toFixed(2)}
                  </Text>
                  <Text style={styles.balanceDetailText}>
                    Payments: ${balance.total_payments.toFixed(2)}
                  </Text>
                </View>
                <Text style={[
                  styles.balanceAmount,
                  balance.balance > 0 ? styles.textRed : styles.textGreen
                ]}>
                  Balance: ${Math.abs(balance.balance).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: {new Date().toLocaleString()}</Text>
        </View>
      </ScrollView>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Date Range</Text>
            
            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateFilter.startDate}
              onChangeText={(text) => setDateFilter({...dateFilter, startDate: text})}
              placeholder="2025-01-01"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateFilter.endDate}
              onChangeText={(text) => setDateFilter({...dateFilter, endDate: text})}
              placeholder="2025-12-31"
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleDateFilterClear}
              >
                <Text style={styles.modalButtonTextSecondary}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDateFilter(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleDateFilterApply}
              >
                <Text style={styles.modalButtonTextPrimary}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  cardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  cardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#fd7e14',
  },
  cardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#6f42c1',
  },
  cardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  financialCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
  },
  financialLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  financialValue: {
    fontSize: 16,
    color: '#333',
  },
  financialValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  textGreen: {
    color: '#28a745',
  },
  textRed: {
    color: '#dc3545',
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  balanceCode: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  balanceDetails: {
    marginBottom: 8,
  },
  balanceDetailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  filterBar: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonCustom: {
    backgroundColor: '#6c757d',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#007bff',
  },
  modalButtonSecondary: {
    backgroundColor: '#6c757d',
  },
  modalButtonCancel: {
    backgroundColor: '#dc3545',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextSecondary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextCancel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
