import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router, useFocusEffect } from "expo-router";
import BingoCard from "../components/BingoCard";
import Header from "../components/Header";
import { Cell } from "../types";
import {
  generateBingoValues,
  checkForWin as checkBingoWin,
} from "../utils/bingoHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [isUsingCustomValues, setIsUsingCustomValues] = useState(false);
  const [customValues, setCustomValues] = useState<string[]>([]);
  const [showFreeSpace, setShowFreeSpace] = useState(true);
  const [freeSpaceText, setFreeSpaceText] = useState("FREE");

  // Initialize bingo card when component mounts
  React.useEffect(() => {
    loadGameSettings(true); // true means generate initial board
  }, []);

  // This effect runs whenever the screen comes into focus (like returning from settings)
  useFocusEffect(
    React.useCallback(() => {
      // Only load the settings, don't regenerate the board
      loadGameSettings(false); // false means don't generate a new board
    }, [])
  );

  const loadGameSettings = async (generateBoard: boolean = true) => {
    try {
      // Load free space settings
      const freeSpaceEnabled = await AsyncStorage.getItem("free-space-enabled");
      const showFree = freeSpaceEnabled !== "false"; // Default to true if not set
      setShowFreeSpace(showFree);

      const customFreeSpaceText = await AsyncStorage.getItem("free-space-text");
      const freeText = customFreeSpaceText || "FREE";
      setFreeSpaceText(freeText);

      // Check if using custom values
      const isUsingCustom = await AsyncStorage.getItem("using-custom-values");
      setIsUsingCustomValues(isUsingCustom === "true");

      // Load custom values if needed
      if (isUsingCustom === "true") {
        const jsonValue = await AsyncStorage.getItem("custom-bingo-values");
        if (jsonValue != null) {
          const loadedValues = JSON.parse(jsonValue);
          setCustomValues(loadedValues);

          // Only generate a new board if requested (initial load or explicit reset)
          if (generateBoard) {
            generateBingoCard(loadedValues, showFree, freeText);
          }
          return;
        }
      }

      // Default to standard bingo if no custom values or not using them
      setIsUsingCustomValues(false);

      // Only generate a new board if requested
      if (generateBoard) {
        generateBingoCard(undefined, showFree, freeText);
      }
    } catch (e) {
      console.error("Failed to load game settings", e);
      if (generateBoard) {
        generateBingoCard();
      }
    }
  };

  const generateBingoCard = (
    values?: string[],
    useFreeSpace?: boolean,
    freeText?: string
  ) => {
    // Use provided values or fall back to state values
    const useShowFreeSpace =
      useFreeSpace !== undefined ? useFreeSpace : showFreeSpace;
    const useFreeSpaceText = freeText || freeSpaceText;

    // Generate values for a bingo card
    const bingoValues = generateBingoValues(
      values,
      useShowFreeSpace,
      useFreeSpaceText
    );

    // Create cells with those values
    const newCells: Cell[] = bingoValues.map((value, index) => {
      // Check if this is the center cell (12th index in a 5x5 grid)
      const isCenterCell = index === 12;
      const isFreeSpaceCell = isCenterCell && useShowFreeSpace;

      return {
        id: index,
        value: value,
        isMarked: isFreeSpaceCell, // Free space starts marked if enabled
        isFreeSpace: isFreeSpaceCell,
      };
    });

    setCells(newCells);
    setHasWon(false);
  };

  const resetGame = () => {
    if (isUsingCustomValues && customValues.length >= 25) {
      generateBingoCard(customValues, showFreeSpace, freeSpaceText);
    } else {
      generateBingoCard(undefined, showFreeSpace, freeSpaceText);
    }
  };

  const goToSettings = () => {
    router.push("/settings");
  };

  const handleCellPress = (id: number) => {
    const updatedCells = cells.map((cell) =>
      cell.id === id ? { ...cell, isMarked: !cell.isMarked } : cell
    );

    setCells(updatedCells);
    checkForWin(updatedCells);
  };

  const checkForWin = (currentCells: Cell[]) => {
    // Use the helper function to check for winning patterns
    const hasWon = checkBingoWin(currentCells);
    setHasWon(hasWon);

    if (hasWon) {
      // You could add celebration effects here
      console.log("BINGO!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onReset={resetGame} hasWon={hasWon} />
      <BingoCard cells={cells} onCellPress={handleCellPress} />

      <TouchableOpacity style={styles.settingsButton} onPress={goToSettings}>
        <Ionicons name="settings-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  settingsButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#f4511e",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
