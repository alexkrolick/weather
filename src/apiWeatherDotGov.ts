import { useAsync } from "react-async-hook";

// https://www.weather.gov/documentation/services-web-api

type UrlMaker = (...options: any[]) => string;

const fetchify = (getUrl: UrlMaker) => ({
  async fetch(...options: any[]) {
    const res = await fetch(getUrl(...options));
    return res.json();
  },
  stringify(...options: any[]): string {
    return getUrl(...options);
  },
});

// const defaultAuth = "weather-gov-app-sBpynqRNf4NADjkd"; // send as user-agent

const urlBase = "https://api.weather.gov";

const urlStateAlerts = fetchify(
  (state: string) => urlBase + `/alerts?area=${state}&active=true`,
);

const urlForecast = fetchify(
  (stationId: string, gridX: number, gridY: number) =>
    urlBase + `/gridpoints/${stationId}/${gridX},${gridY}/forecast`,
);

const urlGridpoints = fetchify(
  (lat: number, lon: number) => urlBase + `/points/${lat},${lon}`,
);

function useAlerts({ state = "CA" } = {}) {
  return useAsync(urlStateAlerts.fetch, [state]);
}

function useGridpoints({ lat = 32, lon = -120 } = {}) {
  return useAsync(urlGridpoints.fetch, [lat, lon]);
}

function useForecast({ gridX = 50, gridY = 50, station = "TOP" } = {}) {
  return useAsync(urlForecast.fetch, [station, gridX, gridY]);
}

export { useAlerts, useGridpoints, useForecast };
