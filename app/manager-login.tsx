import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { login } from "@/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants/keys";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ManagerLogin = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      Alert.alert("Welcome", "Login successful");

      const key = `${STORAGE_KEYS.ONBOARDED}:${user.user?.uid || user.user?.email}`;
      const seen = await AsyncStorage.getItem(key);

      if (seen) {
        router.replace("/application");
      } else {
        router.replace("/application");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Login Failed", err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1f36', '#2d3748', '#4a5568']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Manager Login</Text>
            <Text style={styles.subtitle}>
              Securely access the loan management system
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#4fd1c7" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#718096"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#4fd1c7" />
                <TextInput
                  style={styles.inputPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#718096"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="#4fd1c7"
                  />
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1a202c" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Back to Application link */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Want to apply for a loan? </Text>
              <Pressable onPress={() => router.push("/")}>
                <Text style={styles.linkButton}>Back to Application</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#2d3748',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a202c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#e2e8f0',
    marginLeft: 12,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
    color: '#e2e8f0',
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#4fd1c7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#4a5568',
  },
  loginButtonText: {
    color: '#1a202c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#718096',
    fontSize: 14,
  },
  linkButton: {
    color: '#4fd1c7',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ManagerLogin;