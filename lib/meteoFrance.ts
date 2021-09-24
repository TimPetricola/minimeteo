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

export const forecast = async (lat: string | number, lon: string | number) => {
  const forecast = await request<{
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

  return forecast;
};

export const rain = async (lat: string, lon: string) => {
  const rain = await request<unknown>(`/rain`, {
    lat,
    lon,
  });

  return rain;
};
