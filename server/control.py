import requests
import ssl
import sys
import json

# Get user settings from the config.json file
with open("config.json") as f:
    settings = json.load(f)

user = settings["settings"]["bridgeuser"]
light = ["settings"]["light"]


# Sends PUT-request to turn on/off the light
# Boolean parameter turn: true -> on, false -> off
def switch(turn):
    msg = {
        "on": turn
    }

    address = settings["settings"]["bridge"] + "api/" + user + "/lights/" + light + "/state"

    response = requests.put(address, json=msg, verify=ssl.CERT_NONE)
    print(response)


# Checks and returns the status of the light (on/off mode)
def getStatus():    
    address = settings["settings"]["bridge"] + "api/" + user + "/lights/" + light

    response = requests.get(address, verify=ssl.CERT_NONE)
    return response.json()['state']['on']