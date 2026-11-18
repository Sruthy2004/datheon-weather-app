const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const message = document.getElementById("message");

function getWeatherInfo(code) {
    const conditions = {
        0: ["☀️", "Clear sky"],
        1: ["🌤️", "Mainly clear"],
        2: ["⛅", "Partly cloudy"],
        3: ["☁️", "Overcast"],
        45: ["🌫️", "Fog"],
        48: ["🌫️", "Rime fog"],
        51: ["🌦️", "Light drizzle"],
        53: ["🌦️", "Drizzle"],
        55: ["🌧️", "Heavy drizzle"],
        61: ["🌧️", "Light rain"],
        63: ["🌧️", "Moderate rain"],
        65: ["🌧️", "Heavy rain"],
        71: ["❄️", "Light snow"],
        73: ["❄️", "Moderate snow"],
        75: ["❄️", "Heavy snow"],
        80: ["🌦️", "Rain showers"],
        81: ["🌧️", "Moderate rain showers"],
        82: ["⛈️", "Heavy rain showers"],
        95: ["⛈️", "Thunderstorm"],
        96: ["⛈️", "Thunderstorm with hail"],
        99: ["⛈️", "Thunderstorm with heavy hail"]
    };

    return conditions[code] || ["🌡️", "Weather condition unavailable"];
}

async function getWeather(city) {
    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    searchBtn.disabled = true;
    message.textContent = "Loading weather...";

    try {
        const geocodingUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geocodingUrl);
        if (!geoResponse.ok) {
            throw new Error("Could not search for that city. Please try again.");
        }

        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling and try again.");
        }

        const place = geoData.results[0];

        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error("Weather service is unavailable. Please try later.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        if (!current) {
            throw new Error("Current weather data was not returned.");
        }

        const [icon, condition] = getWeatherInfo(current.weather_code);

        cityName.textContent = `${place.name}, ${place.country}`;
        temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
        weatherIcon.textContent = icon;
        description.textContent = condition;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        windSpeed.textContent = `${current.wind_speed_10m} km/h`;

        message.textContent = "";
    } catch (error) {
        message.textContent = error.message || "Something went wrong. Check your internet connection.";
    } finally {
        searchBtn.disabled = false;
    }
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    getWeather(cityInput.value.trim());
});