import { number } from "fp-ts";
import { isLeft } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { HourlyForecast } from "./types";

const API_BASE_URL = "https://webservice.meteofrance.com";
const METEO_FRANCE_TOKEN = "__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__";
const LANG = "en";

const request = async <T>(
  path: string,
  params: Record<string, string>
): Promise<T> => {
  const searchParams = new URLSearchParams({
    ...params,
    lang: LANG,
    token: METEO_FRANCE_TOKEN,
  });
  const response = await fetch(
    `${API_BASE_URL}${path}?${searchParams.toString()}`
  );

  if (!response.ok) throw new Error("Network response was not ok");

  return response.json();
};

export const searchPlaces = async (query: string) => {
  const places = await request<
    {
      name: string;
      lat: number;
      lon: number;
      country: number;
    }[]
  >("/places", { q: query });

  return {
    places: places.map((place) => ({
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      country: place.country,
    })),
  };
};

export const parseResponse = <TData extends any = any, O = TData, I = unknown>(
  rawData: I,
  codec: t.Type<TData, O, I>
): TData => {
  const result = codec.decode(rawData);
  if (isLeft(result)) throw new Error(PathReporter.report(result).join("\n"));

  return result.right;
};

const RawForecast = t.type({
  position: t.type({
    lat: t.number,
    lon: t.number,
    alti: t.number,
    name: t.string,
    timezone: t.string,
  }),
  daily_forecast: t.array(
    t.type({
      dt: t.number,
      T: t.type({
        min: t.number,
        max: t.number,
      }),
    })
  ),
  forecast: t.array(
    t.type({
      dt: t.number,
      T: t.type({
        value: t.number,
        windchill: t.number,
      }),
      weather: t.type({
        icon: t.string,
        desc: t.string,
      }),
    })
  ),
});

export const parseForecastResponse = (payload: any) =>
  parseResponse(payload, RawForecast);

export const sanitizeForecast = (
  payload: t.TypeOf<typeof RawForecast>
): {
  position: {
    altitude: number;
    latitude: number;
    longitude: number;
    name: string;
    timeZone: string;
  };
  hourly: HourlyForecast[];
  daily: {
    datetime: Date;
    temperature: { min: number; max: number };
  }[];
} => {
  return {
    position: {
      altitude: payload.position.alti,
      latitude: payload.position.lat,
      longitude: payload.position.lon,
      name: payload.position.name,
      timeZone: payload.position.timezone,
    },
    hourly: payload.forecast
      .filter(
        (raw) =>
          typeof raw.T.windchill === "number" &&
          typeof raw.weather.icon === "string" &&
          typeof raw.weather.desc === "string"
      )
      .map((raw) => ({
        datetime: new Date(raw.dt * 1000),
        temperature: raw.T.value,
        perceivedTemperature: raw.T.windchill,
        weatherDescription: raw.weather.desc,
        iconId: raw.weather.icon,
      })),
    daily: payload.daily_forecast
      .filter(
        (raw) => typeof raw.T.min === "number" && typeof raw.T.max === "number"
      )
      .map((raw) => ({
        datetime: new Date(raw.dt * 1000),
        temperature: { min: raw.T.min, max: raw.T.max },
      })),
  };
};

export const fetchForecast = async (
  lat: string | number,
  lon: string | number
) => {
  const payload = await request<{
    position: {
      lat: number;
      lon: number;
      alt: number;
      name: string;
      rain_product_available: 0 | 1;
    };
  }>("/forecast", {
    lat: lat.toString(),
    lon: lon.toString(),
  });

  return sanitizeForecast(parseForecastResponse(payload));
};

export const rain = async (lat: string, lon: string) => {
  const rain = await request<unknown>(`/rain`, {
    lat,
    lon,
  });

  return rain;
};
