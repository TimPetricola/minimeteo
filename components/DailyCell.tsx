import React from "react";
import { StyleSheet } from "react-native";
import { format, utcToZonedTime } from "date-fns-tz";
import { DailyForecast } from "../lib/types";
import { View, Text } from "./Themed";
import { WeatherIcon } from "./WeatherIcon";
import { isToday } from "date-fns";

export function DailyCell({
  forecast,
  timeZone,
}: {
  forecast: DailyForecast;
  timeZone: string;
}) {
  const zonedDateTime = utcToZonedTime(forecast.datetime, timeZone);
  const title = isToday(zonedDateTime)
    ? "Today"
    : format(zonedDateTime, "E ", { timeZone });

  const subtitle = isToday(zonedDateTime)
    ? format(zonedDateTime, "E, MMM d", { timeZone })
    : format(zonedDateTime, "MMM d", { timeZone });

  return (
    <View style={styles.cell}>
      <View>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
      </View>
      <WeatherIcon style={{ width: 50, height: 50 }} id={forecast.iconId} />
      <Text>
        {Math.round(forecast.temperature.min)}° -{" "}
        {Math.round(forecast.temperature.max)}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 5,
    alignItems: "center",
    marginHorizontal: 5,
    justifyContent: "space-between",
  },
});
