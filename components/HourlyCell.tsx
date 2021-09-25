import React from "react";
import { StyleSheet } from "react-native";
import { format, utcToZonedTime } from "date-fns-tz";
import { HourlyForecast } from "../lib/types";
import { View, Text } from "./Themed";
import { WeatherIcon } from "./WeatherIcon";

export function HourlyCell({
  forecast,
  timeZone,
}: {
  forecast: HourlyForecast;
  timeZone: string;
}) {
  return (
    <View style={styles.cell}>
      <Text>
        {format(utcToZonedTime(forecast.datetime, timeZone), "HH'h'", {
          timeZone: timeZone,
        })}
      </Text>
      <WeatherIcon style={{ width: 50, height: 50 }} id={forecast.iconId} />
      <Text>{Math.round(forecast.temperature)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    display: "flex",
    paddingHorizontal: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
});
