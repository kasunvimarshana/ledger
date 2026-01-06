/**
 * DateTimePicker Component
 * Reusable date/time picker with native modal support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerProps {
  label?: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: TextStyle;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select date',
  error,
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Parse the value to a Date object
  const parseDate = (dateString: string): Date => {
    if (!dateString) {
      return new Date();
    }
    // Handle YYYY-MM-DD format
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const selectedDate = parseDate(value);

  // Format date for display
  const formatDate = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    
    if (mode === 'date') {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (mode === 'time') {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      // datetime
      return date.toISOString().slice(0, 16).replace('T', ' '); // YYYY-MM-DD HH:MM
    }
  };

  const displayValue = value ? formatDate(selectedDate) : '';

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker closes automatically when a date is selected
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      onChange(formattedDate);
      
      // Close picker on iOS after selection
      if (Platform.OS === 'ios' && mode !== 'datetime') {
        // For iOS, we keep it open for datetime to allow time selection
        // For date/time only, we can close it
      }
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const handleDone = () => {
    setShowPicker(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError, labelStyle]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.inputContainer,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          inputStyle,
        ]}
      >
        <Text style={[
          styles.inputText,
          !displayValue && styles.placeholderText,
          disabled && styles.disabledText,
        ]}>
          {displayValue || placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Native DateTimePicker */}
      {showPicker && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={handleDone}>
                  <Text style={styles.iosPickerDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <RNDateTimePicker
                value={selectedDate}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </View>
          )}
          
          {Platform.OS === 'android' && (
            <RNDateTimePicker
              value={selectedDate}
              mode={mode}
              display="default"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelError: {
    color: '#f44336',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#f44336',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  disabledText: {
    color: '#999',
  },
  icon: {
    fontSize: 20,
    marginLeft: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iosPickerDoneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
});
