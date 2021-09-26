import React from "react";
import { format, utcToZonedTime } from "date-fns-tz";
import { DailyForecast } from "../lib/types";
import { WeatherIcon } from "./WeatherIcon";
import { isToday } from "date-fns";
import Box from "./Box";
import Text from "./Text";

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

  const subtitle = format(zonedDateTime, "MMM d", { timeZone });

  return (
    <Box
      flex={1}
      flexDirection="row"
      paddingHorizontal="xs"
      alignItems="center"
      marginHorizontal="xs"
      justifyContent="space-between"
    >
      <Box>
        <Text color="body">{title}</Text>
        <Text color="body" opacity={0.5}>
          {subtitle}
        </Text>
      </Box>
      <WeatherIcon style={{ width: 50, height: 50 }} id={forecast.iconId} />
      <Text color="body" fontSize={20} opacity={0.5}>
        {Math.round(forecast.temperature.min)}°
      </Text>
      <Text color="body" fontSize={20}>
        {Math.round(forecast.temperature.max)}°
      </Text>
    </Box>
  );
}
