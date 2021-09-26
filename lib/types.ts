export type HourlyForecast = {
  datetime: Date;
  temperature: number;
  perceivedTemperature: number;
  weatherDescription: string;
  iconId: string;
};

export type DailyForecast = {
  datetime: Date;
  temperature: { min: number; max: number };
  weatherDescription: string;
  iconId: string;
};
