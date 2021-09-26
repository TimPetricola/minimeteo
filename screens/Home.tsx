import * as React from "react";
import { StyleSheet } from "react-native";

import { View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import * as Location from "expo-location";
import { useQuery } from "react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import PagerView from "react-native-pager-view";
import LocationWeather from "../components/LocationWeather";

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
    <SafeAreaView style={styles.container}>
      <PagerView style={styles.pagerView} initialPage={0}>
        {locationQuery.data != null && (
          <View key="1">
            <LocationWeather
              latitude={locationQuery.data.coords.latitude}
              longitude={locationQuery.data.coords.longitude}
            />
          </View>
        )}
      </PagerView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {},
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
  },
  icon: { width: 100, height: 100 },
});
