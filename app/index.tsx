import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import {
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  CheckCircle,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { submitLoanApplication } from '@/services/loanService';
import { LoanFormData } from '@/types/loan';

export default function LoanApplicationScreen() {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<LoanFormData>({
    name: '',
    email: '',
    telephone: '',
    occupation: '',
    salary: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter your full name';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!formData.telephone.trim()) {
      return 'Please enter your telephone number';
    }
    if (!formData.occupation.trim()) {
      return 'Please enter your occupation';
    }
    if (!formData.salary.trim()) {
      return 'Please enter your monthly salary';
    }
    if (!formData.paysheet) {
      return 'Please upload your paysheet (PDF)';
    }
    return null;
  };

  const showSuccessAlert = () => {
    Alert.alert(
      'Success!',
      'Your loan application has been submitted successfully. We will contact you shortly.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showValidationAlert = (message: string) => {
    Alert.alert('Warning', message, [{ text: 'OK', style: 'default' }]);
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      showValidationAlert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationId = await submitLoanApplication(formData);
      console.log('Application submitted successfully:', applicationId);

      showSuccessAlert();

      setFormData({
        name: '',
        email: '',
        telephone: '',
        occupation: '',
        salary: '',
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1f36', '#2d3748', '#4a5568']} style={styles.container}>
      <View
        style={[
          styles.scrollView,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Loan Application</Text>
          <Text style={styles.subtitle}>
            Fill out the form below to apply for a loan
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User color="#4fd1c7" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={text => handleInputChange('name', text)}
              placeholderTextColor="#718096"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail color="#4fd1c7" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={text => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#718096"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone color="#4fd1c7" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Telephone Number"
              value={formData.telephone}
              onChangeText={text => handleInputChange('telephone', text)}
              keyboardType="phone-pad"
              placeholderTextColor="#718096"
            />
          </View>

          <View style={styles.inputContainer}>
            <Briefcase color="#4fd1c7" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Occupation"
              value={formData.occupation}
              onChangeText={text => handleInputChange('occupation', text)}
              placeholderTextColor="#718096"
            />
          </View>

          <View style={styles.inputContainer}>
            <DollarSign color="#4fd1c7" size={20} />
            <TextInput
              style={styles.input}
              placeholder="Monthly Salary"
              value={formData.salary}
              onChangeText={text => handleInputChange('salary', text)}
              keyboardType="numeric"
              placeholderTextColor="#718096"
            />
          </View>

          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Upload color="#4fd1c7" size={20} />
            <Text style={styles.uploadButtonText}>
              {formData.paysheet
                ? formData.paysheet.name
                : 'Upload Paysheet (PDF)'}
            </Text>
            {formData.paysheet && <CheckCircle color="#48bb78" size={20} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managerButton}
            onPress={() => router.push('/manager-login')}
          >
            <Text style={styles.managerButtonText}>Manager Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#2d3748',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a5568',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: '#1a202c',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#e2e8f0',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4fd1c7',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    backgroundColor: '#1a202c',
  },
  uploadButtonText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 15,
    color: '#4fd1c7',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4fd1c7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  submitButtonDisabled: {
    backgroundColor: '#4a5568',
  },
  submitButtonText: {
    color: '#1a202c',
    fontSize: 17,
    fontWeight: '600',
  },
  managerButton: {
    borderWidth: 1,
    borderColor: '#4fd1c7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  managerButtonText: {
    color: '#4fd1c7',
    fontSize: 15,
    fontWeight: '500',
  },
});
