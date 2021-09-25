import React from "react";
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
    <View
      style={{
        borderWidth: 1,
        borderColor: "red",
        marginBottom: 10,
      }}
    >
      <Text>
        {format(utcToZonedTime(forecast.datetime, timeZone), "HH'h'", {
          timeZone: timeZone,
        })}
      </Text>
      <Text>
        {Math.round(forecast.temperature)}° (ressentie:
        {Math.round(forecast.perceivedTemperature)}°)
      </Text>
      <WeatherIcon style={{ width: 50, height: 50 }} id={forecast.iconId} />
      <Text>{forecast.weatherDescription}</Text>
    </View>
  );
}
