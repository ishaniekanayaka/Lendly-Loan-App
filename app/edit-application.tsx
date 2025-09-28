import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, Upload, User, Mail, Phone, Briefcase, DollarSign, Save } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { getLoanApplication, updateLoanApplication } from '@/services/loanService';
import { LoanFormData } from '@/types/loan';

export default function EditApplicationScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [formData, setFormData] = useState<LoanFormData>({
    name: '',
    email: '',
    telephone: '',
    occupation: '',
    salary: '',
  });
  const [currentPaysheet, setCurrentPaysheet] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadApplication = useCallback(async () => {
    try {
      const application = await getLoanApplication(id);
      if (application) {
        setFormData({
          name: application.name,
          email: application.email,
          telephone: application.telephone,
          occupation: application.occupation,
          salary: application.salary,
        });
        setCurrentPaysheet(application.paysheetName || '');
      } else {
        console.log('Application not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading application:', error);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id, loadApplication]);



  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setFormData(prev => ({
          ...prev,
          paysheet: {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf',
          },
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter the name';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!formData.telephone.trim()) {
      return 'Please enter the telephone number';
    }
    if (!formData.occupation.trim()) {
      return 'Please enter the occupation';
    }
    if (!formData.salary.trim()) {
      return 'Please enter the salary';
    }
    return null;
  };

  const handleUpdate = async () => {
    const validationError = validateForm();
    if (validationError) {
      console.log('Validation error:', validationError);
      return;
    }

    setIsUpdating(true);
    try {
      await updateLoanApplication(id, formData);
      console.log('Application updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={[styles.loadingContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Text style={styles.loadingText}>Loading application...</Text>
          </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Edit Application</Text>
            <Text style={styles.subtitle}>Update the application details</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User color="#667eea" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail color="#667eea" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone color="#667eea" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Telephone Number"
                value={formData.telephone}
                onChangeText={(text) => handleInputChange('telephone', text)}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Briefcase color="#667eea" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Occupation"
                value={formData.occupation}
                onChangeText={(text) => handleInputChange('occupation', text)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <DollarSign color="#667eea" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Monthly Salary"
                value={formData.salary}
                onChangeText={(text) => handleInputChange('salary', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Upload color="#667eea" size={20} />
              <Text style={styles.uploadButtonText}>
                {formData.paysheet 
                  ? formData.paysheet.name 
                  : currentPaysheet 
                    ? `Current: ${currentPaysheet}` 
                    : 'Upload New Paysheet (PDF)'
                }
              </Text>
              {(formData.paysheet || currentPaysheet) && <FileText color="#4CAF50" size={20} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              <Save color="white" size={20} />
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Updating...' : 'Update Application'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#F8F9FF',
  },
  uploadButtonText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});