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
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { login } from "@/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants/keys";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      Alert.alert("Welcome", "Login successful ✅");

      const key = `${STORAGE_KEYS.ONBOARDED}:${user.user?.uid || user.user?.email}`;
      const seen = await AsyncStorage.getItem(key);

      if (seen) {
        router.replace("/dashboard/home");
      } else {
        router.replace("/welcome");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Login Failed", err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B172A" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 bg-[#0B172A]">
          {/* Title */}
          <Text className="text-4xl font-extrabold text-white mb-2">
            Lendly
          </Text>
          <Text className="text-gray-400 mb-10 text-center">
            Securely manage your loans anytime
          </Text>

          {/* Form */}
          <View className="w-full max-w-md">
            {/* Email */}
            <Text className="text-sm font-semibold text-gray-300 mb-2">
              Email
            </Text>
            <TextInput
              className="bg-[#1C2A3A] text-white p-4 rounded-xl mb-4"
              placeholder="Enter your email"
              placeholderTextColor="#7B8794"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Text className="text-sm font-semibold text-gray-300 mb-2">
              Password
            </Text>
            <View className="relative mb-6">
              <TextInput
                className="bg-[#1C2A3A] text-white p-4 rounded-xl pr-12"
                placeholder="Enter your password"
                placeholderTextColor="#7B8794"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-4 top-4"
              >
                <Ionicons
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={22}
                  color="#4FD1C5"
                />
              </Pressable>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`p-5 rounded-xl mb-4 ${
                loading ? "bg-[#4FD1C5]/60" : "bg-[#4FD1C5]"
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white font-bold text-lg">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Signup link */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-400">Don’t have an account? </Text>
              <Pressable onPress={() => router.push("/register")}>
                <Text className="text-[#4FD1C5] font-bold">Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
