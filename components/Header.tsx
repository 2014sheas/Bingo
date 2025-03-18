import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { HeaderProps } from "../types";

const Header: React.FC<HeaderProps> = ({ onReset, hasWon }) => {
  return (
    <View style={styles.header}>
      {hasWon && (
        <View style={styles.winBanner}>
          <Text style={styles.winText}>BINGO!</Text>
        </View>
      )}
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetText}>New Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  winBanner: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  winText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  resetButton: {
    backgroundColor: "#f4511e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  resetText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Header;
