import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const Index: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const startSendingLocation = async (): Promise<void> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    setIsSending(true);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (newLocation: LocationData) => {
        setLocation(newLocation);
        const { latitude, longitude } = newLocation.coords;

        axios
          .post("http://localhost:3001/api/bus-location", {
            busId: 1,
            latitude,
            longitude,
          })
          .catch((err) => console.error("Error sending location:", err));
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Current Location:{" "}
        {location
          ? `${location.coords.latitude}, ${location.coords.longitude}`
          : "Unavailable"}
      </Text>
      <Button
        title={isSending ? "Sending Location..." : "Start Sending Location"}
        onPress={startSendingLocation}
        disabled={isSending}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginBottom: 20,
    fontSize: 16,
  },
});

export default Index;
