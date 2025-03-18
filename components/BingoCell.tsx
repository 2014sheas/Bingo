import React from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { BingoCellProps } from "../types";

const BingoCell: React.FC<BingoCellProps> = ({ cell, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.cell,
        cell.isMarked && styles.marked,
        cell.value === "FREE" && styles.freeSpace,
      ]}
      onPress={onPress}
      disabled={cell.value === "FREE"} // Optional: disable the free space
    >
      <Text style={[styles.text, cell.isMarked && styles.markedText]}>
        {cell.value}
      </Text>
    </TouchableOpacity>
  );
};

const { width, height } = Dimensions.get("window");
const dimToUse = width < height ? width : height;
const cellSize = dimToUse / 5 - 10; // For a 5x5 grid with some margin

const styles = StyleSheet.create({
  cell: {
    width: cellSize,
    height: cellSize,
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  marked: {
    backgroundColor: "#4a86e8",
  },
  freeSpace: {
    backgroundColor: "#e8c74a",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  markedText: {
    color: "#ffffff",
  },
});

export default BingoCell;
