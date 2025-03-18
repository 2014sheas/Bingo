import { View, StyleSheet, SafeAreaView } from "react-native";
import React, { useState } from "react";
import BingoCard from "../components/BingoCard";
import Header from "../components/Header";
import { Cell } from "../types";
import {
  generateBingoValues,
  checkForWin as checkBingoWin,
} from "../utils/bingoHelper";

export default function Home() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [hasWon, setHasWon] = useState(false);

  // Initialize bingo card when component mounts
  React.useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    // Generate values for a standard bingo card
    const bingoValues = generateBingoValues();

    // Create cells with those values
    const newCells: Cell[] = bingoValues.map((value, index) => ({
      id: index,
      value: value,
      isMarked: value === "FREE", // Free space starts marked
    }));

    setCells(newCells);
    setHasWon(false);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
