import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import BingoCell from "./BingoCell";
import { BingoCardProps } from "../types";

const BingoCard: React.FC<BingoCardProps> = ({ cells, onCellPress }) => {
  const gridSize = Math.sqrt(cells.length); // Should be 5 for a standard bingo card

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cells.map((cell) => (
          <BingoCell
            key={cell.id}
            cell={cell}
            onPress={() => onCellPress(cell.id)}
          />
        ))}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get("window");
const dimToUse = width < height ? width : height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: dimToUse - 20,
  },
});

export default BingoCard;
