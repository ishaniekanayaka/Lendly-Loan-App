import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Alert,
  TextInput,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Download,
  Edit,
  Trash2,
  LogOut,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  X,
  Save,
  Eye,
  Upload,
  CheckCircle,
  ExternalLink,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/services/authService';
import { 
  getLoanApplications, 
  deleteLoanApplication, 
  updateLoanApplication,
  getLoanApplication,
  generatePDFViewUrl,
  generatePDFDownloadUrl 
} from '@/services/loanService';
import { LoanApplication, LoanFormData } from '@/types/loan';
import * as WebBrowser from 'expo-web-browser';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<string>('');
  const [editFormData, setEditFormData] = useState<LoanFormData>({
    name: '',
    email: '',
    telephone: '',
    occupation: '',
    salary: '',
  });
  const { } = useAuth();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await getLoanApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadApplications();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/manager-login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (application: LoanApplication) => {
    Alert.alert(
      'Delete Application',
      `Are you sure you want to delete ${application.name}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoanApplication(application.id!);
              setApplications(prev => prev.filter(app => app.id !== application.id));
              Alert.alert('Success', 'Application deleted successfully');
            } catch (error) {
              console.error('Error deleting application:', error);
              Alert.alert('Error', 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  const handleViewPdf = async (url: string, fileName?: string) => {
    if (!url?.trim()) {
      Alert.alert('Error', 'PDF not available');
      return;
    }

    try {
      console.log('Opening PDF URL:', url);
      const viewUrl = generatePDFViewUrl(url);
      
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(viewUrl, '_blank');
      } else if (Platform.OS === 'ios') {
        // For iOS, use WebBrowser
        await WebBrowser.openBrowserAsync(viewUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          controlsColor: '#22c55e',
          toolbarColor: '#ffffff',
          secondaryToolbarColor: '#f8fafc',
        });
      } else {
        // For Android, show options
        Alert.alert(
          'View PDF',
          'How would you like to view this PDF?',
          [
            {
              text: 'Open in Browser',
              onPress: async () => {
                try {
                  await WebBrowser.openBrowserAsync(viewUrl, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                    controlsColor: '#22c55e',
                    toolbarColor: '#ffffff',
                    secondaryToolbarColor: '#f8fafc',
                  });
                } catch (error) {
                  console.error('Error opening in browser:', error);
                  // Fallback to system browser
                  await Linking.openURL(viewUrl);
                }
              }
            },
            {
              text: 'Open with System',
              onPress: async () => {
                try {
                  const supported = await Linking.canOpenURL(viewUrl);
                  if (supported) {
                    await Linking.openURL(viewUrl);
                  } else {
                    Alert.alert('Error', 'No application available to open PDF');
                  }
                } catch (error) {
                  console.error('Error opening with system:', error);
                  Alert.alert('Error', 'Unable to open PDF with system apps');
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert(
        'Error',
        'Unable to open PDF. Please check your internet connection and try again.',
        [
          {
            text: 'Copy Link',
            onPress: () => {
              console.log('PDF URL to copy:', url);
            }
          },
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const handleDownloadPdf = async (url: string, fileName?: string, applicationId?: string) => {
    if (!url?.trim()) {
      Alert.alert('Error', 'PDF not available for download');
      return;
    }

    setIsDownloading(applicationId || 'downloading');
    
    try {
      // Generate download URL with proper headers
      const downloadUrl = generatePDFDownloadUrl(url);
      const defaultFileName = fileName || `paysheet_${applicationId || Date.now()}.pdf`;
      
      if (Platform.OS === 'web') {
        // For web, create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = defaultFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile platforms
        const fileUri = `${FileSystem.documentDirectory}${defaultFileName}`;
        
        console.log('Downloading from:', downloadUrl);
        console.log('Saving to:', fileUri);
        
        // Download the file
        const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);
        
        if (downloadResult.status === 200) {
          console.log('Download successful:', downloadResult.uri);
          
          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();
          
          if (Platform.OS === 'android') {
            // For Android, try to save to Downloads and share
            try {
              // Request media library permissions
              const { status } = await MediaLibrary.requestPermissionsAsync();
              
              if (status === 'granted') {
                // Save to media library (Downloads folder)
                const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
                await MediaLibrary.createAlbumAsync('Downloads', asset, false);
                
                Alert.alert(
                  'Download Complete',
                  `PDF saved to Downloads folder as ${defaultFileName}`,
                  [
                    {
                      text: 'Open',
                      onPress: () => {
                        Sharing.shareAsync(downloadResult.uri, {
                          mimeType: 'application/pdf',
                          dialogTitle: 'Open PDF with...'
                        });
                      }
                    },
                    { text: 'OK' }
                  ]
                );
              } else {
                // If no permission, still offer to share/open
                Alert.alert(
                  'Download Complete',
                  'PDF downloaded successfully',
                  [
                    {
                      text: 'Open',
                      onPress: () => {
                        if (isAvailable) {
                          Sharing.shareAsync(downloadResult.uri, {
                            mimeType: 'application/pdf',
                            dialogTitle: 'Open PDF with...'
                          });
                        }
                      }
                    },
                    { text: 'OK' }
                  ]
                );
              }
            } catch (mediaError) {
              console.error('Media library error:', mediaError);
              // Fallback to sharing
              if (isAvailable) {
                await Sharing.shareAsync(downloadResult.uri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Open PDF with...'
                });
              } else {
                Alert.alert('Download Complete', 'PDF downloaded successfully');
              }
            }
          } else {
            // For iOS
            if (isAvailable) {
              await Sharing.shareAsync(downloadResult.uri, {
                mimeType: 'application/pdf'
              });
            } else {
              Alert.alert('Download Complete', 'PDF downloaded successfully');
            }
          }
        } else {
          throw new Error(`Download failed with status: ${downloadResult.status}`);
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert(
        'Download Error',
        'Failed to download PDF. Please check your internet connection and try again.'
      );
    } finally {
      setIsDownloading('');
    }
  };

  const handleEdit = async (application: LoanApplication) => {
    try {
      const fullApp = await getLoanApplication(application.id!);
      if (fullApp) {
        setSelectedApplication(fullApp);
        setEditFormData({
          name: fullApp.name,
          email: fullApp.email,
          telephone: fullApp.telephone,
          occupation: fullApp.occupation,
          salary: fullApp.salary,
        });
        setEditModalVisible(true);
      }
    } catch (error) {
      console.error('Error loading application for edit:', error);
      Alert.alert('Error', 'Failed to load application details');
    }
  };

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setEditFormData(prev => ({
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

  const handleUpdate = async () => {
    if (!selectedApplication) return;

    const validateForm = (): string | null => {
      if (!editFormData.name.trim()) return 'Please enter full name';
      if (!editFormData.email.trim() || !editFormData.email.includes('@')) return 'Please enter a valid email';
      if (!editFormData.telephone.trim()) return 'Please enter telephone number';
      if (!editFormData.occupation.trim()) return 'Please enter occupation';
      if (!editFormData.salary.trim()) return 'Please enter salary';
      return null;
    };

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsUpdating(true);
    try {
      await updateLoanApplication(selectedApplication.id!, editFormData);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, ...editFormData, updatedAt: new Date() }
          : app
      ));
      
      setEditModalVisible(false);
      Alert.alert('Success', 'Application updated successfully');
    } catch (error) {
      console.error('Error updating application:', error);
      Alert.alert('Error', 'Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderApplication = ({ item }: { item: LoanApplication }) => (
    <View style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <Text style={styles.applicationId}>ID: {item.id?.slice(-6).toUpperCase()}</Text>
        <Text style={styles.applicationDate}>
          {item.createdAt.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.applicationInfo}>
        <View style={styles.infoRow}>
          <User color="#16a34a" size={16} />
          <Text style={styles.infoText}>{item.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Mail color="#16a34a" size={16} />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone color="#16a34a" size={16} />
          <Text style={styles.infoText}>{item.telephone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Briefcase color="#16a34a" size={16} />
          <Text style={styles.infoText}>{item.occupation}</Text>
        </View>
        <View style={styles.infoRow}>
          <DollarSign color="#16a34a" size={16} />
          <Text style={styles.infoText}>${item.salary}</Text>
        </View>
      </View>

      <View style={styles.applicationActions}>
        {item.paysheetUrl && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleViewPdf(item.paysheetUrl!, item.paysheetName)}
            >
              <Eye color="#22c55e" size={16} />
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.downloadButton,
                isDownloading === item.id && styles.downloadingButton
              ]}
              onPress={() => handleDownloadPdf(item.paysheetUrl!, item.paysheetName, item.id)}
              disabled={isDownloading === item.id}
            >
              <Download 
                color={isDownloading === item.id ? "#9ca3af" : "#3b82f6"} 
                size={16} 
              />
              <Text style={[
                styles.actionButtonText,
                isDownloading === item.id && styles.downloadingText
              ]}>
                {isDownloading === item.id ? 'Downloading...' : 'Download'}
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Edit color="#10b981" size={16} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Trash2 color="#ef4444" size={16} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#ffffff', '#f8f9fa', '#e9ecef']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Loan Applications</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#1a365d" size={24} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        {applications.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <FileText color="#9ca3af" size={64} />
            <Text style={styles.emptyStateText}>No applications found</Text>
            <Text style={styles.emptyStateSubtext}>
              Applications will appear here once submitted
            </Text>
          </View>
        ) : (
          <FlatList
            data={applications}
            renderItem={renderApplication}
            keyExtractor={(item) => item.id!}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.editModalContainer}>
          <View style={styles.editModalHeader}>
            <Text style={styles.editModalTitle}>Edit Application</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
            >
              <X color="#1a365d" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <User color="#10b981" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={editFormData.name}
                onChangeText={text => handleInputChange('name', text)}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail color="#10b981" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={editFormData.email}
                onChangeText={text => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone color="#10b981" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Telephone Number"
                value={editFormData.telephone}
                onChangeText={text => handleInputChange('telephone', text)}
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Briefcase color="#10b981" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Occupation"
                value={editFormData.occupation}
                onChangeText={text => handleInputChange('occupation', text)}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <DollarSign color="#10b981" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Monthly Salary"
                value={editFormData.salary}
                onChangeText={text => handleInputChange('salary', text)}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Upload color="#10b981" size={20} />
              <Text style={styles.uploadButtonText}>
                {editFormData.paysheet
                  ? editFormData.paysheet.name
                  : 'Upload New Paysheet (PDF)'}
              </Text>
              {editFormData.paysheet && <CheckCircle color="#22c55e" size={20} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              <LinearGradient
                colors={isUpdating ? ['#6b7280', '#6b7280'] : ['#22c55e', '#16a34a']}
                style={styles.saveButtonGradient}
              >
                <Save color="#ffffff" size={20} />
                <Text style={styles.saveButtonText}>
                  {isUpdating ? 'Updating...' : 'Update Application'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a365d',
    letterSpacing: 1,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 54, 93, 0.1)',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  applicationId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 0.5,
  },
  applicationDate: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  applicationInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 2,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 70,
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  downloadButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  downloadingButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  editButton: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  downloadingText: {
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Edit Modal Styles
  editModalContainer: {
    flex: 1,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  editModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a365d',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 54, 93, 0.1)',
  },
  editForm: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#f0fdf4',
    minHeight: 56,
  },
  uploadButtonText: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  saveButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});