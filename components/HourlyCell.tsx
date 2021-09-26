import React from "react";
import { format, utcToZonedTime } from "date-fns-tz";
import { HourlyForecast } from "../lib/types";
import { WeatherIcon } from "./WeatherIcon";
import Box from "./Box";
import Text from "./Text";

export function HourlyCell({
  forecast,
  timeZone,
}: {
  forecast: HourlyForecast;
  timeZone: string;
}) {
  return (
    <Box
      flex={1}
      paddingHorizontal="xs"
      alignItems="center"
      marginHorizontal="s"
    >
      <Text color="body" opacity={0.8}>
        {format(utcToZonedTime(forecast.datetime, timeZone), "HH'h'", {
          timeZone: timeZone,
        })}
      </Text>
      <Box marginVertical="xs">
        <WeatherIcon style={{ width: 50, height: 50 }} id={forecast.iconId} />
      </Box>
      <Text color="body" fontSize={20}>
        {Math.round(forecast.temperature)}°
      </Text>
    </Box>
  );
}
