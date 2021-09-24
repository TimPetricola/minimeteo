import * as React from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import * as Location from "expo-location";
import { useEffect } from "react";
import { useQuery } from "react-query";
import useColorScheme from "../hooks/useColorScheme";
import { forecast } from "../lib/meteoFrance";

export default function HomeScreen({
  navigation,
}: RootStackScreenProps<"Home">) {
  const colorScheme = useColorScheme();

  const locationQuery = useQuery(["location"], async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return undefined;
    return Location.getCurrentPositionAsync({});
  });

  const forecastQuery = useQuery(
    [
      "forecast",
      locationQuery.data?.timestamp,
      locationQuery.data?.coords.latitude,
      locationQuery.data?.coords.longitude,
    ],
    async () => {
      if (locationQuery.data == null)
        throw new Error("Location data should not be null");

      return forecast(
        locationQuery.data.coords.latitude,
        locationQuery.data.coords.longitude
      );
    },
    {
      enabled: locationQuery.data != null,
    }
  );

  const isRefreshing = locationQuery.isFetching || forecastQuery.isFetching;

  useEffect(() => {
    if (typeof forecastQuery.data?.position?.name === "string")
      navigation.setOptions({ title: forecastQuery.data?.position?.name });
  }, [navigation, forecastQuery.data?.position?.name]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => locationQuery.refetch()}
          />
        }
      >
        {forecastQuery.data != null && (
          <>
            <Text style={styles.title}>
              {forecastQuery.data.forecast[0].T.value}°
            </Text>
            <View
              style={styles.separator}
              lightColor="#eee"
              darkColor="rgba(255,255,255,0.1)"
            />
            <Text
              style={styles.getStartedText}
              lightColor="rgba(0,0,0,0.8)"
              darkColor="rgba(255,255,255,0.8)"
            >
              {forecastQuery.data.forecast[0].weather.desc}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
    textAlign: "center",
  },
});
