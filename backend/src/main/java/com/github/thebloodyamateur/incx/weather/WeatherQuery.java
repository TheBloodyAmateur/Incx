package com.github.thebloodyamateur.incx.weather;

public record WeatherQuery(
        double latitude,
        double longitude,
        String viewMode,
        Double temperatureOverride,
        Double windSpeedOverride,
        Double humidityOverride,
        Double cloudCoverOverride,
        Double precipitationOverride,
        String weatherModeOverride
) {
}

