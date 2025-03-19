import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [isUsingCustomValues, setIsUsingCustomValues] = useState(false);
  const [hasCustomValuesStored, setHasCustomValuesStored] = useState(false);
  const [showFreeSpace, setShowFreeSpace] = useState(true);
  const [freeSpaceText, setFreeSpaceText] = useState("FREE");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Check custom values
      const jsonValue = await AsyncStorage.getItem("custom-bingo-values");
      setHasCustomValuesStored(jsonValue != null);

      const isUsingCustom = await AsyncStorage.getItem("using-custom-values");
      setIsUsingCustomValues(isUsingCustom === "true");

      // Load free space settings
      const freeSpaceEnabled = await AsyncStorage.getItem("free-space-enabled");
      setShowFreeSpace(freeSpaceEnabled !== "false"); // Default to true if not set

      const customFreeSpaceText = await AsyncStorage.getItem("free-space-text");
      if (customFreeSpaceText) {
        setFreeSpaceText(customFreeSpaceText);
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  const toggleCustomValues = async (value: boolean) => {
    try {
      if (value && !hasCustomValuesStored) {
        // If trying to enable custom values but none are stored
        Alert.alert(
          "No Custom Values",
          "You need to create custom values first.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Create Values",
              onPress: () => router.push("/custom-values"),
            },
          ]
        );
        return;
      }

      await AsyncStorage.setItem(
        "using-custom-values",
        value ? "true" : "false"
      );
      setIsUsingCustomValues(value);
    } catch (e) {
      console.error("Failed to toggle custom values", e);
    }
  };

  const toggleFreeSpace = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        "free-space-enabled",
        value ? "true" : "false"
      );
      setShowFreeSpace(value);
    } catch (e) {
      console.error("Failed to toggle free space", e);
    }
  };

  const saveFreeSpaceText = async (text: string) => {
    try {
      await AsyncStorage.setItem("free-space-text", text);
    } catch (e) {
      console.error("Failed to save free space text", e);
    }
  };

  const clearCustomValues = async () => {
    try {
      Alert.alert(
        "Clear Custom Values",
        "Are you sure you want to delete all your custom values?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear",
            style: "destructive",
            onPress: async () => {
              await AsyncStorage.removeItem("custom-bingo-values");
              await AsyncStorage.setItem("using-custom-values", "false");
              setHasCustomValuesStored(false);
              setIsUsingCustomValues(false);
              Alert.alert("Success", "Custom values cleared");
            },
          },
        ]
      );
    } catch (e) {
      console.error("Failed to clear custom values", e);
    }
  };

  const goToCustomValues = () => {
    router.push("/custom-values");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Bingo Settings</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Values</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Use Custom Values</Text>
              <Text style={styles.settingDescription}>
                Replace standard bingo numbers with your custom text
              </Text>
            </View>
            <Switch
              value={isUsingCustomValues}
              onValueChange={toggleCustomValues}
              trackColor={{ false: "#767577", true: "#f4511e" }}
              thumbColor="#f4f3f4"
              disabled={!hasCustomValuesStored}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.customButton]}
            onPress={goToCustomValues}
          >
            <Text style={styles.buttonText}>
              {hasCustomValuesStored
                ? "Edit Custom Values"
                : "Create Custom Values"}
            </Text>
          </TouchableOpacity>

          {hasCustomValuesStored && (
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={clearCustomValues}
            >
              <Text style={styles.buttonText}>Clear Custom Values</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free Space</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Show Free Space</Text>
              <Text style={styles.settingDescription}>
                Include a free space in the center of the card
              </Text>
            </View>
            <Switch
              value={showFreeSpace}
              onValueChange={toggleFreeSpace}
              trackColor={{ false: "#767577", true: "#f4511e" }}
              thumbColor="#f4f3f4"
            />
          </View>

          {showFreeSpace && (
            <View style={styles.freeSpaceTextContainer}>
              <Text style={styles.freeSpaceLabel}>Free Space Text:</Text>
              {isUsingCustomValues ? (
                <TextInput
                  style={styles.freeSpaceInput}
                  value={freeSpaceText}
                  onChangeText={(text) => {
                    setFreeSpaceText(text);
                    saveFreeSpaceText(text);
                  }}
                  maxLength={50}
                  placeholder="FREE"
                />
              ) : (
                <Text style={styles.disabledText}>
                  Free space text customization is only available when using
                  custom values.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#f4511e",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  customButton: {
    backgroundColor: "#4a86e8",
  },
  clearButton: {
    backgroundColor: "#ff6b6b",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  freeSpaceTextContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  freeSpaceLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  freeSpaceInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  disabledText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
