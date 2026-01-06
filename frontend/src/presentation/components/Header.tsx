/**
 * Header Component
 * Reusable screen header with back button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  showBackButton = true,
  rightComponent,
  style 
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }, style]}>
      {showBackButton && (
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightComponent && (
        <View style={[styles.rightComponent, { top: insets.top + 25 }]}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007bff',
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  titleContainer: {
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  rightComponent: {
    position: 'absolute',
    right: 20,
  },
});
