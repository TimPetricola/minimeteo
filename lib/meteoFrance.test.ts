import { parseForecastResponse, sanitizeForecast } from "./meteoFrance";

describe(".parseForecastResponse", () => {
  it("does nothing when valid", () => {
    expect(() =>
      parseForecastResponse(
        require("./__tests__/payloads/forecast/annecy-2021-09-24-09-14.json")
      )
    ).not.toThrow();
  });

  it("throws when invalid", () => {
    expect(() =>
      parseForecastResponse({
        ...require("./__tests__/payloads/forecast/annecy-2021-09-24-09-14.json"),
        position: "foo",
      })
    ).toThrow(/Invalid value/);
  });
});

it(".sanitizeForecast", () => {
  const data = sanitizeForecast(
    require("./__tests__/payloads/forecast/annecy-2021-09-24-09-14.json")
  );

  expect(data.position).toMatchInlineSnapshot(`
    Object {
      "altitude": 447,
      "isRainForecastAvailable": false,
      "latitude": 45.898493,
      "longitude": 6.128991,
      "name": "Annecy",
      "timeZone": "Europe/Paris",
    }
  `);
  expect(data.hourly).toMatchSnapshot();
  expect(data.daily).toMatchSnapshot();
});
