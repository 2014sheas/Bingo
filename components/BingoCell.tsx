import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  View,
} from "react-native";
import { BingoCellProps } from "../types";

const BingoCell: React.FC<BingoCellProps> = ({ cell, onPress }) => {
  // Check if the cell is the free space based on its properties
  const isFreeSpace = cell.isFreeSpace;

  // Check if the value is custom text (not in B1-O75 format)
  const isCustomValue = !isFreeSpace && !/^[BINGO]\d+$/.test(cell.value);

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        cell.isMarked && styles.marked,
        isFreeSpace && styles.freeSpace,
      ]}
      onPress={onPress}
      disabled={isFreeSpace} // Disable the free space
    >
      <Text
        style={[
          styles.text,
          cell.isMarked && styles.markedText,
          isCustomValue && styles.customText,
        ]}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
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
    padding: 4,
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
    textAlign: "center",
  },
  customText: {
    fontSize: 12,
  },
  markedText: {
    color: "#ffffff",
  },
});

export default BingoCell;
