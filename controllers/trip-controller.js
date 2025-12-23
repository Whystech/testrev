import { tripStore } from "../models/trip-store.js";
import { v4 } from "uuid";
import axios from "axios";
import { telemetryFuncs } from "../services/mqtt.js"
import { statusEmit } from "../services/mqtt.js";
import dayjs from "dayjs";



//End trip if the script/connection suddenly stops, assign telemetry obtained up until disconnect, status saved to indicate "why" the trip recording was stopped
//Pretty much the same as the "endTrip" function
//limited knowledge on WebSockets and other "live" stuff, since node.js is server side can't use DOM manipulation, can't use window.reload()
statusEmit.on("offlineStatus", async (newStatus) => {
  if (newStatus === "offline" && recordStatus) {
    newTrip.endedAt = Date.now();
    newTrip.telemetry = telemetryFuncs.sendTelemetry()
    newTrip.status = "Disconnected"
    //set record status to false
    recordStatus = false;
    telemetryFuncs.stopRecording()
    await tripStore.addTrip(newTrip);
    console.log(`adding trip ${newTrip.id}`);
    newTrip = null; //reset trip
  }
});


export let recordStatus = false //for disabling record button, exported to Dashboard Controller
let newTrip; //initialize trip
export const tripController = {
  async index(request, response) {
    const id = request.params.id;
    const trip = await tripStore.getTripById(id);
    const telemetry = trip.telemetry
    let hasComments = false

    //Format received data
    telemetry.forEach(telemetryPoint => {
      telemetryPoint.comments = []
      telemetryPoint.formattedTemp = Number(telemetryPoint.temp.toString().substring(0, 4))
      telemetryPoint.formattedHumidity = Number(telemetryPoint.humidity.toString().substring(0, 4))
      telemetryPoint.formattedTimeStamp = dayjs.unix(telemetryPoint.ts).format('YYYY-MM-DD HH:mm:ss')
      telemetryPoint.formattedLatitude = Number(telemetryPoint.latitude.toFixed(5))
      telemetryPoint.formattedLongitude = Number(telemetryPoint.longitude.toFixed(5));
      if (telemetryPoint.speed > 120){
        telemetryPoint.comments.push("Speed Violation")
        hasComments = true;
      }
      if (telemetryPoint.rpm > 4000){
        telemetryPoint.comments.push("Over Rev")
        hasComments = true;
      }
    });
    const startingLocationCoords = [telemetry[0].latitude, telemetry[0].longitude]
    const endingLocationCoords = [telemetry[telemetry.length - 1].latitude, telemetry[telemetry.length - 1].longitude]
    //const maxSpeed = await tripStore.getMaxParameter(id, "speed");
    //const maxRpm = await tripStore.getMinParameter(id, "rpm");
    ///TREND DATA
    let graph = {};
    //graph.trendTemps = [];
    //graph.trendDates = [];
    const viewData = {
      title: "trip",
      trip: trip,
      telemetry: trip.telemetry,
      startingLocationLatitude: startingLocationCoords[0],
      startingLocationLongitude: startingLocationCoords[1],
      endingLocationLatitude: endingLocationCoords[0],
      endingLocationLongitude: endingLocationCoords[1], 
      hasComments: hasComments
      //graph: graph,
    };
    console.log(telemetry)
    response.render("trip-view", viewData);
  },

  async startTrip(request, response) {
    newTrip = {
      startedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      _id: v4(),
    };
    //record state set to on
    recordStatus = true
    telemetryFuncs.recordTelemetry(newTrip.id)
    console.log(`starting trip ${newTrip.id}`);
    response.redirect("/dashboard");
  },

  async endTrip(request, response) {
    newTrip.endedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    //add collected telemetry data to the trip
    newTrip.telemetry = telemetryFuncs.sendTelemetry()
    //stop recording/clear buffers in mqtt
    telemetryFuncs.stopRecording();
    //record state set to off
    recordStatus = false;
    //end early if the record stop button is spammed so there are no empty trips
    if (newTrip.telemetry.length === 0) {
      console.log(`Trip discarded`);
      response.redirect("/dashboard")
    }
    else {
      newTrip.status = "Ended by user"
      //add the trip
      await tripStore.addTrip(newTrip);
      console.log(`adding trip ${newTrip.id}`);
      newTrip = null; //reset trip
      response.redirect("/dashboard");
    }
  },

  async deleteTrip(request, response) {
    const tripid = request.params.id;
    console.log(`Deleting trip ${tripid}`);
    await tripStore.deleteTripById(tripid);
    response.redirect("/dashboard")
  },

  async editTripName(request, response) {
    const tripid = request.params.id;
    const updatedTrip = {
      name: request.body.name,
    };
    console.log(`Updating the name for trip ${tripid}`);
    const trip = await tripStore.getTripById(tripid);
    await tripStore.updateTripName(tripid, updatedTrip);
    ///redirect directly to edited trip
    response.redirect(`/trip/${tripid}`);
  },
}
