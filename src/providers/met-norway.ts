import { boundedQuery, fetchProviderJson, type ProviderFetcher } from "../http.js";
import type { SourceProvider } from "../registry.js";

function coordinate(value: unknown, minimum: number, maximum: number, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) throw new Error(`${label} is invalid`);
  return Math.round(parsed * 10000) / 10000;
}

export function metNorwayAdapter(userAgent: string, fetcher: ProviderFetcher = fetch) {
  const agent = boundedQuery(userAgent, 200);
  if (agent.length < 8) throw new Error("MET Norway requires an identifying User-Agent");
  return async (input: Record<string, unknown>, provider: SourceProvider) => {
    const lat = coordinate(input.lat, -90, 90, "Latitude");
    const lon = coordinate(input.lon, -180, 180, "Longitude");
    const url = new URL("/weatherapi/locationforecast/2.0/compact", provider.baseUrl);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    if (input.altitude !== undefined) {
      const altitude = Math.round(Number(input.altitude));
      if (!Number.isFinite(altitude) || altitude < -500 || altitude > 9000) throw new Error("Altitude is invalid");
      url.searchParams.set("altitude", String(altitude));
    }
    const payload = await fetchProviderJson(url, { fetcher, allowedOrigin: new URL(provider.baseUrl).origin, headers: { "user-agent": agent } });
    const properties = payload.properties && typeof payload.properties === "object" && !Array.isArray(payload.properties) ? payload.properties as Record<string, unknown> : {};
    const timeseries = Array.isArray(properties.timeseries) ? properties.timeseries.slice(0, 48) : [];
    const data = timeseries.flatMap((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
      const row = entry as Record<string, unknown>;
      const block = row.data && typeof row.data === "object" && !Array.isArray(row.data) ? row.data as Record<string, unknown> : {};
      const instant = block.instant && typeof block.instant === "object" && !Array.isArray(block.instant) ? block.instant as Record<string, unknown> : {};
      const details = instant.details && typeof instant.details === "object" && !Array.isArray(instant.details) ? instant.details as Record<string, unknown> : {};
      return [{ kind: "weather-forecast", time: boundedQuery(row.time, 40), airTemperature: typeof details.air_temperature === "number" ? details.air_temperature : null, relativeHumidity: typeof details.relative_humidity === "number" ? details.relative_humidity : null, windSpeed: typeof details.wind_speed === "number" ? details.wind_speed : null, windDirection: typeof details.wind_from_direction === "number" ? details.wind_from_direction : null, verificationStatus: "official-source" }];
    });
    return { data, sourceObservedAt: new Date().toISOString() };
  };
}
