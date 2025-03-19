import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CustomValuesScreen() {
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");
  const [savedSets, setSavedSets] = useState<
    { name: string; values: string[] }[]
  >([]);
  const [setName, setSetName] = useState("");
  const [maxListHeight, setMaxListHeight] = useState(200);

  // References
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  // Constants
  const MIN_VALUES = 25;
  const { height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    // Load saved sets when the component mounts
    loadSavedSets();

    // Calculate the maximum list height based on screen size
    // Use 60% of screen height as maximum, but at least 200px
    const calculatedMaxHeight = Math.max(Math.floor(screenHeight * 0.6), 200);
    setMaxListHeight(calculatedMaxHeight);
  }, []);

  const loadSavedSets = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("bingo-value-sets");
      if (jsonValue != null) {
        setSavedSets(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Failed to load saved value sets", e);
    }
  };

  const saveSet = async () => {
    if (!setName.trim()) {
      Alert.alert("Error", "Please enter a name for this set");
      return;
    }

    try {
      const newSets = [...savedSets, { name: setName, values: values }];
      await AsyncStorage.setItem("bingo-value-sets", JSON.stringify(newSets));
      setSavedSets(newSets);
      setSetName("");
      Alert.alert("Success", "Value set saved successfully");
    } catch (e) {
      console.error("Failed to save value set", e);
      Alert.alert("Error", "Failed to save value set");
    }
  };

  // Also scroll to the end when loading a set
  const loadSet = (index: number) => {
    setValues(savedSets[index].values);

    // Scroll to the end of the list after the values are loaded
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const deleteSet = async (index: number) => {
    try {
      const newSets = [...savedSets];
      newSets.splice(index, 1);
      await AsyncStorage.setItem("bingo-value-sets", JSON.stringify(newSets));
      setSavedSets(newSets);
    } catch (e) {
      console.error("Failed to delete value set", e);
    }
  };

  const addValue = () => {
    if (newValue.trim() === "") return;

    // Add the new value
    setValues((prevValues) => {
      const newValues = [...prevValues, newValue.trim()];

      // Use a timeout to ensure the values state is updated before scrolling
      setTimeout(() => {
        // Scroll to the end of the list to show the newly added item
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);

      return newValues;
    });

    setNewValue("");

    // Focus back on the input field after a short delay
    // The delay ensures the input is cleared before focusing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const removeValue = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    setValues(newValues);
  };

  // Calculate dynamic list height based on number of values
  const getListHeight = () => {
    // Base height per item (approximately)
    const heightPerItem = 50; // Increased to ensure enough space per item

    // Container padding and borders
    const containerExtraSpace = 30; // 10px padding top + 10px padding bottom + 10px for borders and margins

    // Calculate desired height based on number of items
    // Minimum of 3 items visible, maximum of 12 items without scrolling
    const numItemsToShow = Math.min(Math.max(values.length, 3), 12);

    // Calculate height with extra buffer to ensure items aren't cut off
    const desiredHeight = heightPerItem * numItemsToShow + containerExtraSpace;

    // Return the smaller of the desired height and max height
    return Math.min(desiredHeight, maxListHeight);
  };

  const saveAndGoBack = () => {
    if (values.length < MIN_VALUES) {
      Alert.alert(
        "Not Enough Values",
        `You need at least ${MIN_VALUES} values to generate a Bingo card. You currently have ${values.length}.`
      );
      return;
    }

    // Store the custom values in AsyncStorage
    AsyncStorage.setItem("custom-bingo-values", JSON.stringify(values))
      .then(() => {
        // Also set the flag to use custom values
        return AsyncStorage.setItem("using-custom-values", "true");
      })
      .then(() => {
        // Navigate back to the previous screen
        router.back();
      })
      .catch((error) => {
        console.error("Error saving custom values", error);
        Alert.alert("Error", "Failed to save your custom values");
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView>
          <Text style={styles.title}>Custom Bingo Values</Text>
          <Text style={styles.instructions}>
            Enter at least 25 words or phrases for your custom Bingo card.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Enter value..."
              value={newValue}
              onChangeText={setNewValue}
              onSubmitEditing={addValue}
              returnKeyType="next"
              autoFocus={true}
            />
            <TouchableOpacity style={styles.addButton} onPress={addValue}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.counter}>
            Values: {values.length}/{MIN_VALUES}+ required
          </Text>

          <View style={[styles.valuesList, { height: getListHeight() }]}>
            <FlatList
              ref={flatListRef}
              data={values}
              renderItem={({ item, index }) => (
                <View style={styles.valueItem}>
                  <Text
                    style={styles.valueText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeValue(index)}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>
                  Add values to appear here
                </Text>
              }
              onContentSizeChange={() => {
                // If there are more than 12 items, scroll to the end
                // This ensures we automatically show new items as they're added
                if (values.length > 12) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}
            />
          </View>

          <View style={styles.saveSetContainer}>
            <TextInput
              style={styles.setNameInput}
              placeholder="Set name..."
              value={setName}
              onChangeText={setSetName}
            />
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveSet}
              disabled={values.length < MIN_VALUES}
            >
              <Text style={styles.buttonText}>Save Set</Text>
            </TouchableOpacity>
          </View>

          {savedSets.length > 0 && (
            <View style={styles.savedSetsContainer}>
              <Text style={styles.sectionTitle}>Saved Sets</Text>
              {savedSets.map((set, index) => (
                <View key={index} style={styles.savedSetItem}>
                  <Text style={styles.savedSetName}>
                    {set.name} ({set.values.length})
                  </Text>
                  <View style={styles.savedSetButtons}>
                    <TouchableOpacity
                      style={[styles.button, styles.loadButton]}
                      onPress={() => loadSet(index)}
                    >
                      <Text style={styles.buttonText}>Load</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.deleteButton]}
                      onPress={() => deleteSet(index)}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.startButton,
              values.length < MIN_VALUES && styles.disabledButton,
            ]}
            onPress={saveAndGoBack}
            disabled={values.length < MIN_VALUES}
          >
            <Text style={styles.startButtonText}>
              {values.length < MIN_VALUES
                ? `Need ${MIN_VALUES - values.length} More`
                : "Save Values"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#f4511e",
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  addButton: {
    width: 80,
    height: 50,
    backgroundColor: "#f4511e",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  counter: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
    fontWeight: "500",
  },
  valuesList: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    // Height is now dynamically set in the component
    minHeight: 150,
  },
  valueItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: 44, // Fixed height to ensure consistency
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  emptyListText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveSetContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  setNameInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  button: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  loadButton: {
    backgroundColor: "#2196F3",
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  savedSetsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  savedSetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  savedSetName: {
    fontSize: 16,
    fontWeight: "500",
  },
  savedSetButtons: {
    flexDirection: "row",
  },
  startButton: {
    backgroundColor: "#f4511e",
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#f4511e",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
