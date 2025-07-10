import React from "react";
import { View } from "react-native";
import { Picker, PickerProps } from "@react-native-picker/picker";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps
  extends Omit<PickerProps, "onValueChange" | "selectedValue"> {
  value: string | number;
  onValueChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const Select = ({
  value,
  onValueChange,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) => (
  <View
    className={`w-full border border-gray-300 rounded mb-3 bg-gray-100 ${className}`}
  >
    <Picker
      selectedValue={value}
      onValueChange={onValueChange}
      style={{
        height: 42,
        paddingRight: 10,
        boxSizing: "border-box",
        backgroundColor: "transparent",
        color: value === "" ? "#888" : "#222",
        borderWidth: 10,
        borderColor: "transparent",
      }}
      {...props}
    >
      <Picker.Item label={placeholder} value="" />
      {options &&
        options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
    </Picker>
  </View>
);

export default Select;
