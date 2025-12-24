
import mqtt from "mqtt";
import { v4 } from "uuid";
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';


const USER_ID = 'ianuj'
const broker = 'ssl://8cd1987612ce4be5a8a0228b31bd0975.s1.eu.hivemq.cloud'
const options = {
  username: "ianuj",
  password: "HDIPiot2026@",
  protocolVersion: 5,
  clientId: `${USER_ID}-node`,
  port: 8883
}
const client = mqtt.connect(broker, options)
const SENSORS_TOPIC = `/${USER_ID}/sensors`;
const STATUS_TOPIC = `/${USER_ID}/status`;
const topics = [STATUS_TOPIC, SENSORS_TOPIC]


//initialize vars
//need to know the rpiStatus so I can disable trip recording

let telemetryRecorded = []
let telemetryInterval = null;
let telemetry;
export let rpiStatus;
export let speed;
export let rpm;
export const statusEmit = new EventEmitter()
const wss = new WebSocketServer({ port: 8080 })


//MQTT
client.on('connect', () => {
  console.log('Connected to mqtt server')
  topics.forEach(element => {
    client.subscribe(element)
    console.log(`Subscribed to ${element}`)
  });
})

client.on('disconnect', () => {
  console.log('Disconnected')
    ;
})

//get offline status and telemetry
client.on('message', (topic, message) => {
  const msgStr = message.toString();
  if (topic === STATUS_TOPIC) {
    //Status messages as plain string
    rpiStatus = msgStr;
    console.log(`Pi status: ${rpiStatus}`);

    if (rpiStatus == "offline") {
      statusEmit.emit("offlineStatus", rpiStatus)
    }
  }
  if (topic === SENSORS_TOPIC) { //differentiate between status and telmetry
    try {
      telemetry = JSON.parse(msgStr);
      speed = telemetry.speed
      rpm = telemetry.rpm
    } catch (err) {
      console.error('Error parsing telemetry JSON:', err);
    }
  }
}
)

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

//get stream
function getTelemetry() {
  return telemetry
}

///functions used to record / send telemetry to the controller
export const telemetryFuncs = {
  recordTelemetry() {
    let telemetryBuffer;
    telemetryInterval = setInterval(() => {
      if (!telemetry)
        return; // telemetry might be 0 if it's a fresh start
      telemetryBuffer = getTelemetry()
      telemetryBuffer._id = v4();
      // optional: skip duplicates
      const last = telemetryRecorded[telemetryRecorded.length - 1];
      if (!last || JSON.stringify(last) !== JSON.stringify(telemetryBuffer)) {
        telemetryRecorded.push(telemetryBuffer);
      }
      console.log("Telemetry Buffer:", telemetryBuffer);
    }, 1000);

  },

  sendTelemetry() {
    return telemetryRecorded
  },

  stopRecording(id) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
    telemetryRecorded = [] //clear any stored values
  },
}


