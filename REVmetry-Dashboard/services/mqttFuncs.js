
import mqtt from "mqtt";

export  const mqttFuncs = {

  mqttConnect(topics)  {
  client.on('connect', () => {
  console.log('Connected to mqtt server')
  topics.forEach(element => {
    client.subscribe(element)
    console.log(`Subscribed to ${element}`)
  });
})},

mqttDisconnect() {
client.on('disconnect', () => {
  console.log('Disconnected')
  ;
})},

mqttStatus() {
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
)},


//get telemetry data
mqttGetTelemetry(){
client.on('message', (topic, message) => {
  const msgStr = message.toString();
  if (topic === SENSORS_TOPIC) { //differentiate between status and telmetry
    try {
      telemetry = JSON.parse(msgStr);
      speed = telemetry.speed
      rpm = telemetry.rpm        
    } catch (err) {
      console.error('Error parsing telemetry JSON:', err);
    }
  }}
);},
mqttError(){
client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});
}}