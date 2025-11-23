package com.github.thebloodyamateur.incx.weather;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/current")
    public ResponseEntity<WeatherResponse> getCurrentWeather(
            @RequestParam(name = "name", required = false) String cityName,
            @RequestParam(name = "lat", required = false) Double latitude,
            @RequestParam(name = "lon", required = false) Double longitude,
            @RequestParam(name = "viewMode", defaultValue = "normal") String viewMode,
            @RequestParam(name = "temperature", required = false) Double temperatureOverride,
            @RequestParam(name = "windSpeed", required = false) Double windSpeedOverride,
            @RequestParam(name = "humidity", required = false) Double humidityOverride,
            @RequestParam(name = "cloudCover", required = false) Double cloudCoverOverride,
            @RequestParam(name = "precipitation", required = false) Double precipitationOverride,
            @RequestParam(name = "weatherMode", required = false) String weatherModeOverride
    ) {
        // Fallback auf Berlin, wenn keine Koordinaten & kein Name angegeben
        double effectiveLat = latitude != null ? latitude : 52.52;
        double effectiveLon = longitude != null ? longitude : 13.41;

        WeatherQuery baseQuery = new WeatherQuery(
                effectiveLat,
                effectiveLon,
                viewMode,
                temperatureOverride,
                windSpeedOverride,
                humidityOverride,
                cloudCoverOverride,
                precipitationOverride,
                weatherModeOverride
        );

        WeatherResponse response;
        if (cityName != null && !cityName.isBlank()) {
            response = weatherService.getCurrentWeatherByCity(baseQuery, cityName);
        } else {
            response = weatherService.getCurrentWeather(baseQuery);
        }
        return ResponseEntity.ok(response);
    }
}
