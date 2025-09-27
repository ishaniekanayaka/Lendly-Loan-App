import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
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
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getLoanApplications, deleteLoanApplication } from '@/services/loanService';
import { LoanApplication } from '@/types/loan';
import * as WebBrowser from 'expo-web-browser';

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { logout } = useAuth();

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
    await logout();
    router.replace('/');
  };

  const handleDelete = async (application: LoanApplication) => {
    try {
      await deleteLoanApplication(application.id!);
      setApplications(prev => prev.filter(app => app.id !== application.id));
      console.log('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleDownloadPaysheet = async (url: string) => {
    if (!url?.trim()) {
      console.log('Invalid URL provided');
      return;
    }
    
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (error) {
      console.error('Error opening paysheet:', error);
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
          <User color="#667eea" size={16} />
          <Text style={styles.infoText}>{item.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Mail color="#667eea" size={16} />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone color="#667eea" size={16} />
          <Text style={styles.infoText}>{item.telephone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Briefcase color="#667eea" size={16} />
          <Text style={styles.infoText}>{item.occupation}</Text>
        </View>
        <View style={styles.infoRow}>
          <DollarSign color="#667eea" size={16} />
          <Text style={styles.infoText}>${item.salary}</Text>
        </View>
      </View>

      <View style={styles.applicationActions}>
        {item.paysheetUrl && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDownloadPaysheet(item.paysheetUrl!)}
          >
            <Download color="#4CAF50" size={20} />
            <Text style={styles.actionButtonText}>Paysheet</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/edit-application?id=${item.id}`)}
        >
          <Edit color="#2196F3" size={20} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Trash2 color="#F44336" size={20} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Loan Applications</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut color="white" size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.content, { paddingBottom: insets.bottom }]}>
          {applications.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <FileText color="#ccc" size={64} />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  applicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  applicationId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  applicationDate: {
    fontSize: 12,
    color: '#999',
  },
  applicationInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});