import * as React from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "./Themed";
import { useCallback, useMemo } from "react";
import { useQuery } from "react-query";
import { fetchForecast, fetchRainForecast } from "../lib/meteoFrance";
import { isAfter, isBefore, isEqual, startOfHour } from "date-fns";
import { HourlyCell } from "./HourlyCell";
import {
  ForecastResponse,
  HourlyForecast,
  RainForecastResponse,
} from "../lib/types";
import { WeatherIcon } from "./WeatherIcon";
import { DailyCell } from "./DailyCell";

function Inner({
  forecast,
  rain,
}: {
  forecast: ForecastResponse;
  rain: RainForecastResponse;
}) {
  const now = useMemo(() => new Date(), []);

  const renderHourlyForecast = useCallback(
    ({ item }: { item: HourlyForecast }) => {
      return (
        <HourlyCell forecast={item} timeZone={forecast.position.timeZone} />
      );
    },
    [forecast]
  );

  const currentForecast = useMemo(() => {
    const reversed = forecast.hourly.slice().reverse();
    const current = reversed.find((hourly) => isBefore(hourly.datetime, now));
    if (typeof current === "undefined") throw new Error("No current forecast");
    return current;
  }, [forecast, now]);

  return (
    <>
      <Text style={styles.title}>{forecast.position.name}</Text>
      <WeatherIcon style={styles.icon} id={currentForecast.iconId} />
      <Text style={styles.title}>
        {Math.round(currentForecast.temperature)}°
      </Text>
      <Text
        style={styles.getStartedText}
        lightColor="rgba(0,0,0,0.8)"
        darkColor="rgba(255,255,255,0.8)"
      >
        {currentForecast.weatherDescription}
      </Text>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {rain != null && (
        <>
          <Text>{JSON.stringify(rain)}</Text>
          <View
            style={styles.separator}
            lightColor="#eee"
            darkColor="rgba(255,255,255,0.1)"
          />
        </>
      )}

      <FlatList
        data={forecast.hourly.filter(
          (hourly) =>
            isEqual(hourly.datetime, startOfHour(now)) ||
            isAfter(hourly.datetime, startOfHour(now))
        )}
        renderItem={renderHourlyForecast}
        keyExtractor={(item) => item.datetime.toISOString()}
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      {forecast.daily.map((daily) => (
        <DailyCell
          key={daily.datetime.toISOString()}
          forecast={daily}
          timeZone={forecast.position.timeZone}
        />
      ))}
    </>
  );
}

export default function LocationWeather({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const forecastQuery = useQuery(
    ["forecast", latitude, longitude],
    async () => {
      return fetchForecast(latitude, longitude);
    }
  );

  const rainForecastQuery = useQuery(
    ["rain", latitude, longitude],
    async () => {
      return fetchRainForecast(latitude, longitude);
    },
    {
      enabled: forecastQuery.data?.position?.isRainForecastAvailable === true,
    }
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={forecastQuery.isFetching}
          onRefresh={() => {
            forecastQuery.refetch();
            rainForecastQuery.refetch();
          }}
        />
      }
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {forecastQuery.data != null && (
        <Inner forecast={forecastQuery.data} rain={rainForecastQuery.data} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
