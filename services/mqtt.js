
//MQTT
import mqtt from "mqtt";
import EventEmitter from "events";

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
//MQTT

//initialize vars
//need to know the rpiStatus so I can disable trip recording
let telemetryBuffer
let telemetryRecorded = [];
let telemetryInterval = null;
let telemetry;
export let rpiStatus;
export let speed;
export const statusEmit = new EventEmitter() //construct emitter

client.on('connect', () => {
  console.log('Connected to mqtt server')
  topics.forEach(element => {
    client.subscribe(element)
    console.log(`Subscribed to ${element}`)
  });
})

//get offline status
client.on('message', (topic, message) => {
  const msgStr = message.toString();
  if (topic === STATUS_TOPIC) {
//Status messages as plain string
    rpiStatus = msgStr;
    console.log(`Pi status: ${rpiStatus}`);
  }
   if (rpiStatus == "offline")
    statusEmit.emit("offlineStatus", rpiStatus)
  }
)


//get telemetry data
client.on('message', (topic, message) => {
  const msgStr = message.toString();
  if (topic === SENSORS_TOPIC) { //differentiate between status and telmetry
    try {
      telemetry = JSON.parse(msgStr);
      speed = telemetry.speed
    } catch (err) {
      console.error('Error parsing telemetry JSON:', err);
    }
  }
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

//get stream
function getTelemetry() {
  return telemetry
}

///functions used to record / send telemetry to the controller
export const telemetryFuncs = {

  recordTelemetry(id) {
    telemetryBuffer = [] ///clear buffer
    telemetryInterval = setInterval(() => {
      telemetryBuffer = getTelemetry();
      telemetryRecorded.tripId = id; // associate with trip
      telemetryRecorded.push(telemetryBuffer); // put values in the trip object
      console.log("Telemetry Bffer:")
      console.log(telemetryBuffer);
    }, 1000); // record every 1 second

  },

  sendTelemetry() {
    return telemetryRecorded
  },

  stopRecording(id) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
    telemetryBuffer = [] //clear buffer
    telemetryRecorded = [] //clear any stored values
  },



}