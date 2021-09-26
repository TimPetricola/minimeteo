import * as React from "react";
import { FlatList, RefreshControl, ScrollView } from "react-native";

import Text from "../components/Text";
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
import Box from "./Box";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@shopify/restyle";
import { Theme } from "../lib/theme";

const HORIZONTAL_PADDING = "m";

function Inner({
  forecast,
  rain,
}: {
  forecast: ForecastResponse;
  rain: RainForecastResponse | undefined;
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

  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box
      paddingHorizontal={HORIZONTAL_PADDING}
      style={{ marginTop: insets.top, marginBottom: insets.bottom }}
    >
      <Text variant="header" marginBottom="l">
        {forecast.position.name}
      </Text>
      <Box
        flex={1}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="cardBackground"
        borderRadius={12}
        padding="m"
        marginBottom="l"
      >
        <Box>
          <Text fontSize={48} color="body">
            {Math.round(currentForecast.temperature)}°
          </Text>
          <Text color="body" opacity={0.8}>
            Feels like {Math.round(currentForecast.perceivedTemperature)}°
          </Text>
        </Box>
        <Box>
          <WeatherIcon height={120} width={120} id={currentForecast.iconId} />
        </Box>
      </Box>

      {/* {typeof rain !== "undefined" && (
        <>
          <Text>{JSON.stringify(rain)}</Text>
        </>
      )} */}

      <Box marginBottom="l">
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
          style={{ marginHorizontal: -1 * theme.spacing[HORIZONTAL_PADDING] }}
          contentContainerStyle={{
            marginHorizontal: theme.spacing[HORIZONTAL_PADDING],
          }}
        />
      </Box>

      {forecast.daily.map((daily) => (
        <DailyCell
          key={daily.datetime.toISOString()}
          forecast={daily}
          timeZone={forecast.position.timeZone}
        />
      ))}
    </Box>
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
