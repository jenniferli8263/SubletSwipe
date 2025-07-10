import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { apiGet } from "@/lib/api";
import Input from "./ui/Input";

interface Prediction {
  description: string;
  place_id: string;
  [key: string]: any;
}

interface AddressAutocompleteProps {
  value: string;
  onSubmitCallback: (description: string) => void;
}

export function AddressAutocomplete({
  value,
  onSubmitCallback: onSubmitCallback,
}: AddressAutocompleteProps) {
  const [input, setInput] = useState<string>(value || "");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  useEffect(() => {
    if (!submitted) return;

    setLoading(true);
    console.log("searching");
    apiGet(`/locations/${encodeURIComponent(input)}`)
      .then((data) => {
        setPredictions(data.predictions || []);
        setShowDropdown(true);
      })
      .catch(() => setPredictions([]))
      .finally(() => {
        setLoading(false);
      });
  }, [submitted]);

  useEffect(() => {
    setSubmitted(false);
    setShowDropdown(false);
  }, [input]);

  const handleSelect = (description: string) => {
    setInput(description);
    setShowDropdown(false);
    onSubmitCallback(description);
  };

  return (
    <View className="mb-4">
      <Input
        placeholder="Search"
        value={input}
        onChangeText={setInput}
        onSubmitEditing={() => {
          setSubmitted(true);
        }}
        onFocus={() => {
          if (input) {
            setSelection({ start: 0, end: input.length });
          }
        }}
        selection={selection}
        className=""
        keyboardType="numeric"
      />
      {loading && <ActivityIndicator size="small" className="mt-2" />}
      {showDropdown && !loading && predictions.length === 0 && (
        <View className="bg-whiterounded p-3">
          <Text className="text-gray-500 text-center">No results found</Text>
        </View>
      )}
      {showDropdown && predictions.length > 0 && (
        <View className="bg-white rounded max-h-48 border-b border-gray-100">
          <FlatList
            data={predictions}
            keyExtractor={(item: Prediction) => item.place_id}
            renderItem={({ item }: { item: Prediction }) => (
              <TouchableOpacity
                className="px-3 py-3 border-t border-gray-100"
                onPress={() => handleSelect(item.description)}
              >
                <Text className="text-gray-800">{item.description}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}
