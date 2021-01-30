# AutoHeat
Car Heating Scheduler with Python Flask

## Requirements
- Python 3.8
- Mobile device for the front end application
  - Currently there is full support for Android only
- OpenWeatherMap API key
- Philips Hue Bridge
- Philips Smart Plug

## Configuration

`src/config.json` need to be set before use:
- bridgeuser: User key that you get from the `https://<bridge ip address>/debug/clip.html`
- owmkey: API key from OpenWeatherMap
- server: Address of the server machine that hosts the Flask application
- bridge: Address of the Philips Hue Bridge device
- location: Latitude and longitude of the location that you want to use for the forecast

## Known issues
- DateTimePicker works only on Android

## Todos
- Notification system in case the server crashes
- Decent handling for status codes that are get from the requests
- Tests
