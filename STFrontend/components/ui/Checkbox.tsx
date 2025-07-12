import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  className?: string;
}

const Checkbox = ({
  value,
  onValueChange,
  label,
  className = "",
}: CheckboxProps) => {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      className={`flex-row items-center mb-2 ${className}`}
    >
      <View
        className={`w-5 h-5 border-2 rounded mr-2 ${
          value ? "border-green-800 bg-green-800" : "border-green-800 bg-white"
        }`}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        {value ? <Text className="text-white font-bold">✓</Text> : null}
      </View>
      {label && <Text>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Checkbox;
