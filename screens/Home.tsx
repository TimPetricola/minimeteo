import * as React from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import * as Location from "expo-location";
import { useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { fetchForecast, fetchRainForecast } from "../lib/meteoFrance";
import { addHours, isAfter, isBefore, startOfHour } from "date-fns";
import { HourlyCell } from "../components/HourlyCell";
import { DailyForecast, HourlyForecast } from "../lib/types";
import { WeatherIcon } from "../components/WeatherIcon";
import { format, utcToZonedTime } from "date-fns-tz";
import { DailyCell } from "../components/DailyCell";
import { SafeAreaView } from "react-native-safe-area-context";
import PagerView from "react-native-pager-view";

export default function HomeScreen({
  navigation,
}: RootStackScreenProps<"Home">) {
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

  const rainForecastQuery = useQuery(
    [
      "rain",
      locationQuery.data?.timestamp,
      locationQuery.data?.coords.latitude,
      locationQuery.data?.coords.longitude,
    ],
    async () => {
      if (locationQuery.data == null)
        throw new Error("Location data should not be null");

      return fetchRainForecast(
        locationQuery.data.coords.latitude,
        locationQuery.data.coords.longitude
      );
    },
    {
      enabled: forecastQuery.data?.position?.isRainForecastAvailable === true,
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
    <SafeAreaView style={styles.container}>
      <PagerView style={styles.pagerView} initialPage={0}>
        <View key="1">
          <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => locationQuery.refetch()}
              />
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {forecastQuery.data != null && (
              <>
                <Text style={styles.title}>
                  {forecastQuery.data.position.name}
                </Text>
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

                {/* {rainForecastQuery.data != null && (
              <>
                <Text>{JSON.stringify(rainForecastQuery.data)}</Text>
                <View
                  style={styles.separator}
                  lightColor="#eee"
                  darkColor="rgba(255,255,255,0.1)"
                />
              </>
            )} */}

                <FlatList
                  data={forecastQuery.data.hourly.filter((hourly) =>
                    isAfter(hourly.datetime, startOfHour(now))
                  )}
                  renderItem={renderHourlyForecast}
                  keyExtractor={(item) => item.datetime.toISOString()}
                  horizontal
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                />

                {forecastQuery.data.daily.map((daily) => (
                  <DailyCell
                    key={daily.datetime.toISOString()}
                    forecast={daily}
                    timeZone={forecastQuery.data.position.timeZone}
                  />
                ))}
              </>
            )}
          </ScrollView>
        </View>
        <View key="2">
          <Text>Second page</Text>
        </View>
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
