package com.github.thebloodyamateur.incx.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.thebloodyamateur.incx.dto.WeatherQuery;
import com.github.thebloodyamateur.incx.dto.WeatherResponse;

import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class WeatherService {

    private static final String OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
    private static final String OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherResponse getCurrentWeather(WeatherQuery query) {
        JsonNode root = fetchFromOpenMeteo(query.latitude(), query.longitude());

        JsonNode current = root.path("current_weather");
        JsonNode hourly = root.path("hourly");

        Double temperature = current.hasNonNull("temperature") ? current.get("temperature").asDouble() : null;
        Double windSpeed = current.hasNonNull("windspeed") ? current.get("windspeed").asDouble() : null;
        Integer weatherCode = current.hasNonNull("weathercode") ? current.get("weathercode").asInt() : null;

        Double humidity = extractFirst(hourly, "relativehumidity_2m");
        Double cloudCover = extractFirst(hourly, "cloudcover");
        Double precipitation = extractFirst(hourly, "precipitation");

        // God-Mode-Overrides
        boolean isGodMode = "god".equalsIgnoreCase(query.viewMode());

        if (isGodMode) {
            if (query.temperatureOverride() != null) {
                temperature = query.temperatureOverride();
            }
            if (query.windSpeedOverride() != null) {
                windSpeed = query.windSpeedOverride();
            }
            if (query.humidityOverride() != null) {
                humidity = query.humidityOverride();
            }
            if (query.cloudCoverOverride() != null) {
                cloudCover = query.cloudCoverOverride();
            }
            if (query.precipitationOverride() != null) {
                precipitation = query.precipitationOverride();
            }
        }

        String autoMode = deriveWeatherMode(weatherCode, precipitation, temperature, windSpeed, cloudCover);

        String activeMode = autoMode;
        if (isGodMode && query.weatherModeOverride() != null && !query.weatherModeOverride().isBlank()) {
            activeMode = query.weatherModeOverride().toLowerCase();
        }

        return new WeatherResponse(
                query.viewMode(),
                activeMode,
                query.latitude(),
                query.longitude(),
                temperature,
                windSpeed,
                humidity,
                cloudCover,
                precipitation,
                weatherCode,
                root
        );
    }

    public WeatherResponse getCurrentWeatherByCity(WeatherQuery baseQuery, String cityName) {
        Coordinates coords = geocodeCity(cityName);
        WeatherQuery queryWithCoords = new WeatherQuery(
                coords.latitude,
                coords.longitude,
                baseQuery.viewMode(),
                baseQuery.temperatureOverride(),
                baseQuery.windSpeedOverride(),
                baseQuery.humidityOverride(),
                baseQuery.cloudCoverOverride(),
                baseQuery.precipitationOverride(),
                baseQuery.weatherModeOverride()
        );
        return getCurrentWeather(queryWithCoords);
    }

    private static final class Coordinates {
        final double latitude;
        final double longitude;

        Coordinates(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }

    private Coordinates geocodeCity(String cityName) {
        HttpUrl url = HttpUrl.parse(OPEN_METEO_GEOCODING_URL).newBuilder()
                .addQueryParameter("name", cityName)
                .addQueryParameter("count", "1")
                .addQueryParameter("language", "de")
                .addQueryParameter("format", "json")
                .build();

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful() || response.body() == null) {
                throw new IOException("Unexpected HTTP code " + response);
            }
            String body = response.body().string();
            JsonNode root = objectMapper.readTree(body);
            JsonNode results = root.path("results");
            if (!results.isArray() || results.isEmpty()) {
                throw new RuntimeException("Keine Koordinaten für Ort gefunden: " + cityName);
            }
            JsonNode first = results.get(0);
            double lat = first.path("latitude").asDouble();
            double lon = first.path("longitude").asDouble();
            return new Coordinates(lat, lon);
        } catch (IOException e) {
            throw new RuntimeException("Geocoding fehlgeschlagen für: " + cityName, e);
        }
    }

    private JsonNode fetchFromOpenMeteo(double latitude, double longitude) {
        HttpUrl url = HttpUrl.parse(OPEN_METEO_URL).newBuilder()
                .addQueryParameter("latitude", String.valueOf(latitude))
                .addQueryParameter("longitude", String.valueOf(longitude))
                .addQueryParameter("current_weather", "true")
                .addQueryParameter("hourly", "temperature_2m,relativehumidity_2m,precipitation,cloudcover,windspeed_10m,weathercode")
                .addQueryParameter("timezone", "auto")
                .build();

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected HTTP code " + response);
            }
            if (response.body() == null) {
                throw new IOException("Empty response body from Open-Meteo");
            }
            String body = response.body().string();
            return objectMapper.readTree(body);
        } catch (IOException e) {
            throw new RuntimeException("Failed to fetch weather from Open-Meteo", e);
        }
    }

    private Double extractFirst(JsonNode hourly, String fieldName) {
        JsonNode array = hourly.path(fieldName);
        if (array.isArray() && array.size() > 0 && array.get(0).isNumber()) {
            return array.get(0).asDouble();
        }
        return null;
    }

    private String deriveWeatherMode(Integer weatherCode, Double precipitation, Double temperature, Double windSpeed, Double cloudCover) {
        if (weatherCode == null) {
            return "sun";
        }

        // Snow: 71, 73, 75, 77, 85, 86
        if (weatherCode == 71 || weatherCode == 73 || weatherCode == 75 || weatherCode == 77 || weatherCode == 85 || weatherCode == 86) {
            return "snow";
        }

        // Fog: 45, 48
        if (weatherCode == 45 || weatherCode == 48) {
            return "fog";
        }

        // Thunderstorm / Storm: 95, 96, 99 or very high wind
        if (weatherCode == 95 || weatherCode == 96 || weatherCode == 99 || (windSpeed != null && windSpeed >= 70)) {
            return "storm";
        }

        // Rain / Drizzle / Showers: 51–57, 61–67, 80–82
        if (weatherCode == 51 || weatherCode == 53 || weatherCode == 55 || weatherCode == 56 || weatherCode == 57
                || weatherCode == 61 || weatherCode == 63 || weatherCode == 65 || weatherCode == 66 || weatherCode == 67
                || weatherCode == 80 || weatherCode == 81 || weatherCode == 82
                || (precipitation != null && precipitation > 0.2)) {
            if (temperature != null && temperature <= 0) {
                return "snow";
            }
            return "rain";
        }

        // Strong wind without thunderstorm
        if (windSpeed != null && windSpeed >= 35) {
            return "wind";
        }

        // Cloudy
        if (cloudCover != null && cloudCover > 80) {
            return "sun";
        }

        return "sun";
    }
}
