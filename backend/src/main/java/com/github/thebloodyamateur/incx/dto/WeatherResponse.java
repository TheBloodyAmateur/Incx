package com.github.thebloodyamateur.incx.dto;

public record WeatherResponse(
        String viewMode,
        String mode,
        double latitude,
        double longitude,
        Double temperature,
        Double windSpeed,
        Double humidity,
        Double cloudCover,
        Double precipitation,
        Integer weatherCode,
        Object raw
) {
}

