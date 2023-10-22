const PROXY_CONFIG = [{
    context: [
        "/WeatherForecast",
    ],
    target: 'http://localhost:5000',
    secure: false,
}]

module.exports = PROXY_CONFIG;
