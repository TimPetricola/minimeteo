import * as React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import * as Location from "expo-location";
import { useEffect } from "react";
import { useQuery } from "react-query";
import useColorScheme from "../hooks/useColorScheme";

export default function HomeScreen({ navigation }: RootTabScreenProps<"Home">) {
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
      const response = await fetch(
        `https://meteo-api.vercel.app/api/forecasts?latitude=${locationQuery.data?.coords.latitude}&longitude=${locationQuery.data?.coords.longitude}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      return await response.json();
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
