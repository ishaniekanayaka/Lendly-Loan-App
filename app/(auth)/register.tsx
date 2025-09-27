import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { register } from "@/services/authService";

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);

  const handleRegister = async () => {
    if (isLoadingReg) return;

    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoadingReg(true);
    try {
      await register(email, password);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoadingReg(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B172A" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 bg-[#0B172A]">
          {/* Title */}
          <Text className="text-4xl font-extrabold text-white mb-2">Lendly</Text>
          <Text className="text-gray-400 mb-10 text-center">
            Create your account to manage loans smartly
          </Text>

          {/* Form Section */}
          <View className="w-full max-w-md">
            <Text className="text-3xl font-bold mb-6 text-white text-center">
              Create Account
            </Text>

            {/* Email */}
            <Text className="text-sm font-semibold text-gray-300 mb-2">Email</Text>
            <TextInput
              className="bg-[#1C2A3A] text-white p-4 rounded-xl mb-5"
              placeholder="Enter your email"
              placeholderTextColor="#7B8794"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Text className="text-sm font-semibold text-gray-300 mb-2">Password</Text>
            <View className="relative mb-5">
              <TextInput
                className="bg-[#1C2A3A] text-white p-4 rounded-xl pr-12"
                placeholder="Create your password"
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

            {/* Confirm Password */}
            <Text className="text-sm font-semibold text-gray-300 mb-2">
              Confirm Password
            </Text>
            <View className="relative mb-6">
              <TextInput
                className="bg-[#1C2A3A] text-white p-4 rounded-xl pr-12"
                placeholder="Confirm your password"
                placeholderTextColor="#7B8794"
                secureTextEntry={!isConfirmVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable
                onPress={() => setIsConfirmVisible(!isConfirmVisible)}
                className="absolute right-4 top-4"
              >
                <Ionicons
                  name={isConfirmVisible ? "eye" : "eye-off"}
                  size={22}
                  color="#4FD1C5"
                />
              </Pressable>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`p-5 rounded-xl mt-2 w-full shadow-lg ${
                isLoadingReg ? "bg-[#4FD1C5]/60" : "bg-[#4FD1C5]"
              }`}
              onPress={handleRegister}
              disabled={isLoadingReg}
            >
              <View className="flex-row justify-center items-center">
                {isLoadingReg ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    Create Account
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Login Link */}
            <Pressable className="mt-6 p-2" onPress={() => router.replace("/login")}>
              <Text className="text-center text-base text-gray-400">
                Already have an account?{" "}
                <Text className="font-bold text-[#4FD1C5]">Sign In</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
