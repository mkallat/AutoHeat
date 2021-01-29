import requests
import json
import datetime
from datetime import date
from datetime import datetime
from datetime import timedelta

# Returns the current temperature in celcius degrees
def getCurrentWeather():
    with open("config.json") as f:
        settings = json.load(f)

    api_key = settings["settings"]["owmkey"]
    lat = settings["settings"]["location"]["latitude"]
    lon = settings["settings"]["location"]["longitude"]
    url = "https://api.openweathermap.org/data/2.5/onecall?lat=%s&lon=%s&appid=%s&units=metric&lang=fi" % (lat, lon, api_key)

    response = requests.get(url)
    data = json.loads(response.text)

    return data["current"]["temp"]


# Calculates and returns the start time of heating
def calculateHeatTime(time):
    temp = getCurrentWeather()

    if temp <= 5 and temp >= -5:
        time = time - timedelta(minutes=30)
    elif temp < -5 and temp >= -10:
        time = time - timedelta(hours=1)
    elif temp < -10:
        time = time - timedelta(hours=2)

    return time

# Returns the time needed for the heating
def getTime():
    temp = getCurrentWeather()

    if temp <= 5 and temp >= -5:
        return 0.5
    elif temp < -5 and temp >= -10:
        return 1
    elif temp < -10:
        return 2

# Updates the status of the current temperature
def updateWeather():
    with open("time.json", "r") as jsonFile:
        data = json.load(jsonFile)

    data["weather"] = getCurrentWeather()

    with open("time.json", "w") as jsonFile:
        json.dump(data, jsonFile)


print(getCurrentWeather())