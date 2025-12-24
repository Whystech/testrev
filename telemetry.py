from envsensors import *;
from spatialsensors import *;
from gpsReceiver import *;
import os, time, json;
import paho.mqtt.client as mqtt;
import sys, signal;
from random import *;
from rpmIndicatorv2 import *;

USER_ID = os.getenv("USER_ID", "ianuj")
BROKER  = os.getenv("MQTT_BROKER", "8cd1987612ce4be5a8a0228b31bd0975.s1.eu.hivemq.cloud") #experimenting with authentication so dat is not just publicly available
TELEMETRY_PERIOD_S = float(os.getenv("TELEMETRY_PERIOD_S", "10"))
PASSWORD = "HDIPiot2026@"
PORT = 8883

#Client Id's must be different (node/python)
client = mqtt.Client(
    client_id=f"{USER_ID}-python", 
    protocol=mqtt.MQTTv5,
    callback_api_version=mqtt.CallbackAPIVersion.VERSION2, #a lot of issues here.
)

#set username and password
client.username_pw_set(USER_ID, PASSWORD)

###Topics for MQTT 
SENSORS_TOPIC = f"/{USER_ID}/sensors"
STATUS_TOPIC = f"/{USER_ID}/status"


def on_connect(client, userdata, flags, reason_code, properties):
    print("MQTT connected:", reason_code)
    client.publish(STATUS_TOPIC, "online", qos=1, retain=True)

telemetry_enabled = True 
def on_message(client, userdata, msg):
    global telemetry_enabled
    try:
        data = json.loads(msg.payload.decode("utf-8"))
        state = data.get("state")
        if state == "on":
            telemetry_enabled = True
        else :
            telemetry_enabled = False
    #Used to turn telemetry ON/OFF
        
        print("Telemetry gathering:", telemetry_enabled)
    except Exception as e:
        print("on_message error:", e)


client.on_connect = on_connect
client.on_message = on_message

# Before connecting (will)
client.will_set(STATUS_TOPIC,payload="offline", qos=1, retain=True)

def shutdown(*_):
    try:
        client.publish(STATUS_TOPIC, "offline", qos=1, retain=True)
        time.sleep (0.1)
        client.disconnect()
    except Exception:
        pass
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

def publishTelemetry():
    speed = randint(0,300) #need to have in obd getSpeed
    coords = get_Coords()
    latitude = coords[0]
    longitude = coords[1]
   # if latitude is None:
       # latitude = 0
    #if longitude is None:
        #longitude = 0
    
    payload = {
            "userID": USER_ID,
            "temp": get_temp(),
            "humidity": get_humidity(),
            "ts": int(time.time()),
            "speed": speed,
            "latitude": latitude,
            "longitude": longitude,
            "rpm": get_rpm()
        }
    # QoS 0 for frequent telemetry; retain latest for late subscribers
    client.publish(SENSORS_TOPIC, json.dumps(payload), qos=0, retain=False)
    print("Telemetry:", payload)

def main():
    client.tls_set()
    client.connect(BROKER, PORT)
    client.loop_start()
    while True:
        # Process MQTT network I/O without using a background thread
        publishTelemetry()
        time.sleep(0.5)

main()
