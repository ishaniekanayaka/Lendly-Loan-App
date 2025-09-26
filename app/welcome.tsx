import { View, Text, TouchableOpacity, Dimensions, StatusBar, StyleSheet } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { STORAGE_KEYS } from "@/constants/keys";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const Welcome = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleContinue = async () => {
    const key = `${STORAGE_KEYS.ONBOARDED}:${user?.email}`;
    await AsyncStorage.setItem(key, "1");
    router.replace("/dashboard/home");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#896C6C" />
      <View style={styles.container}>
        {/* Gradient Background */}
        <LinearGradient
          colors={["#896C6C", "#ffffff"]}
          locations={[0, 1]}
          style={styles.gradientBackground}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Loan Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.loanIconWrapper}>
              <MaterialIcons name="attach-money" size={48} color="#ffffff" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Lendly</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Simplified loan management for everyone
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <MaterialIcons name="how-to-reg" size={32} color="#896C6C" />
              <Text style={styles.featureTitle}>Apply</Text>
              <Text style={styles.featureDesc}>Submit loan requests easily</Text>
            </View>

            <View style={styles.feature}>
              <MaterialIcons name="list-alt" size={32} color="#896C6C" />
              <Text style={styles.featureTitle}>Track</Text>
              <Text style={styles.featureDesc}>Monitor your applications</Text>
            </View>

            <View style={styles.feature}>
              <MaterialIcons name="payment" size={32} color="#896C6C" />
              <Text style={styles.featureTitle}>Manage</Text>
              <Text style={styles.featureDesc}>Handle payments securely</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={styles.getStartedButton}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* Skip link */}
          <TouchableOpacity onPress={handleContinue} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    position: "relative",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  loanIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#896C6C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "400",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  feature: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 10,
  },
  featureTitle: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  featureDesc: {
    color: "#666666",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  getStartedButton: {
    backgroundColor: "#896C6C",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    minWidth: 160,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    color: "#999999",
    fontSize: 14,
    textAlign: "center",
  },
});

export default Welcome;
