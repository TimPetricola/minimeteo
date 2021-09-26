import * as React from "react";
import { View } from "react-native";

import { RootStackScreenProps } from "../types";
import * as Location from "expo-location";
import { useQuery } from "react-query";
import PagerView from "react-native-pager-view";
import LocationWeather from "../components/LocationWeather";
import Box from "../components/Box";

export default function HomeScreen({}: RootStackScreenProps<"Home">) {
  const locationQuery = useQuery(["location"], async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return undefined;
    return (
      (await Location.getLastKnownPositionAsync({
        maxAge: 1000 * 60 * 10, // last 10 minutes
        requiredAccuracy: Location.Accuracy.Low,
      })) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      }))
    );
  });

  return (
    <Box backgroundColor="mainBackground" flex={1}>
      <PagerView style={{ flex: 1 }} initialPage={0}>
        <View key="1">
          {locationQuery.data != null && (
            <LocationWeather
              latitude={locationQuery.data.coords.latitude}
              longitude={locationQuery.data.coords.longitude}
            />
          )}
        </View>
      </PagerView>
    </Box>
  );
}
