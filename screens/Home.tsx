import * as React from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import * as Location from "expo-location";
import { useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { fetchForecast } from "../lib/meteoFrance";
import { SvgUri, SvgXml } from "react-native-svg";
import { startOfHour } from "date-fns";
import { utcToZonedTime } from "date-fns-tz/esm";
import { format } from "date-fns-tz";
import { HourlyCell } from "../components/HourlyCell";

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
            {/* <SvgUri
              style={styles.icon}
              uri={`https://meteo-api.vercel.app/api/icons/${forecastQuery.data.hourly[0].iconId}.svg`}
            />
            <Text style={styles.title}>
              {Math.round(forecastQuery.data.hourly[0].temperature)}°
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
              {forecastQuery.data.hourly[0].weatherDescription}
            </Text> */}
            <Text>
              current date:{" "}
              {format(
                utcToZonedTime(now, forecastQuery.data.position.timeZone),
                "d.M.yyyy HH:mm:ss.SSS 'GMT' XXX (z)",
                { timeZone: forecastQuery.data.position.timeZone }
              )}
            </Text>
            <View>
              {forecastQuery.data.hourly
                .filter((hourly) => hourly.datetime >= startOfHour(now))
                .map((hourly) => (
                  <HourlyCell
                    key={hourly.datetime.toISOString()}
                    forecast={hourly}
                    timeZone={forecastQuery.data.position.timeZone}
                  />
                ))}
            </View>
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
    // alignItems: "center",
    // justifyContent: "center",
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
  icon: { width: 100, height: 100 },
});
