/**
 * Role List Screen
 * Displays all roles with search and filter capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { Role } from '../../domain/entities/Role';
import { useAuth } from '../contexts/AuthContext';
import { canCreate } from '../../core/utils/permissions';
import { usePagination } from '../../core/hooks/usePagination';
import { useSort } from '../../core/hooks/useSort';
import { Pagination } from '../components/Pagination';
import { SortButton } from '../components/SortButton';

export const RoleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>('/roles');
      if (response.success && response.data) {
        const roleData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
        setRoles(roleData);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      Alert.alert('Error', 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting hook
  const { sortedData, requestSort, getSortDirection } = useSort<Role>(filteredRoles);

  // Pagination hook
  const {
    currentData,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination(sortedData, { initialPerPage: 10 });

  const handleRolePress = (roleId: number) => {
    (navigation.navigate as any)('RoleDetail', { roleId });
  };

  const handleAddRole = () => {
    (navigation.navigate as any)('RoleForm');
  };

  const renderRoleItem = ({ item }: { item: Role }) => (
    <TouchableOpacity
      style={styles.roleCard}
      onPress={() => handleRolePress(item.id)}
    >
      <View style={styles.roleHeader}>
        <Text style={styles.roleName}>{item.display_name}</Text>
        {item.users_count !== undefined && (
          <View style={styles.userCountBadge}>
            <Text style={styles.userCountText}>
              {item.users_count} user{item.users_count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.roleSystemName}>System: {item.name}</Text>
      <Text style={styles.roleDescription}>{item.description}</Text>
      <Text style={styles.permissionCount}>
        {item.permissions.length} permission{item.permissions.length !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading roles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Roles</Text>
        {canCreate(currentUser, 'roles') && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddRole}>
            <Text style={styles.addButtonText}>+ Add Role</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search roles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <SortButton 
          label="Name" 
          direction={getSortDirection('display_name')}
          onPress={() => requestSort('display_name')} 
        />
        <SortButton 
          label="System Name" 
          direction={getSortDirection('name')}
          onPress={() => requestSort('name')} 
        />
      </View>

      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRoleItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No roles found</Text>
          </View>
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={goToPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  userCountBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  roleSystemName: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  permissionCount: {
    fontSize: 13,
    color: '#007bff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'flex-start',
    gap: 8,
  },
});
