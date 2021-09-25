import * as React from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import * as Location from "expo-location";
import { useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { fetchForecast } from "../lib/meteoFrance";
import { startOfHour } from "date-fns";
import { HourlyCell } from "../components/HourlyCell";
import { HourlyForecast } from "../lib/types";
import { WeatherIcon } from "../components/WeatherIcon";

export default function HomeScreen({
  navigation,
}: RootStackScreenProps<"Home">) {
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

      return fetchForecast(
        locationQuery.data.coords.latitude,
        locationQuery.data.coords.longitude
      );
    },
    {
      enabled: locationQuery.data != null,
    }
  );

  const renderHourlyForecast = ({ item }: { item: HourlyForecast }) => {
    return forecastQuery.data == null ? null : (
      <HourlyCell
        forecast={item}
        timeZone={forecastQuery.data.position.timeZone}
      />
    );
  };

  const now = useMemo(() => new Date(), []);

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
            <WeatherIcon
              style={styles.icon}
              id={forecastQuery.data.hourly[0].iconId}
            />
            <Text style={styles.title}>
              {Math.round(forecastQuery.data.hourly[0].temperature)}°
            </Text>
            <Text
              style={styles.getStartedText}
              lightColor="rgba(0,0,0,0.8)"
              darkColor="rgba(255,255,255,0.8)"
            >
              {forecastQuery.data.hourly[0].weatherDescription}
            </Text>

            <View
              style={styles.separator}
              lightColor="#eee"
              darkColor="rgba(255,255,255,0.1)"
            />

            <FlatList
              data={forecastQuery.data.hourly.filter(
                (hourly) => hourly.datetime >= startOfHour(now)
              )}
              renderItem={renderHourlyForecast}
              keyExtractor={(item) => item.datetime.toISOString()}
              horizontal
            />
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
  },
  icon: { width: 100, height: 100 },
});
