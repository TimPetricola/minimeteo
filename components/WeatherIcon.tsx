import React from "react";
import { SvgUri, UriProps } from "react-native-svg";

export function WeatherIcon({
  id,
  ...rest
}: {
  id: string;
} & Omit<UriProps, "uri">) {
  return (
    <SvgUri
      {...rest}
      uri={`https://meteo-api.vercel.app/api/icons/${id}.svg`}
    />
  );
}
