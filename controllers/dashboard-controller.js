import { tripStore } from "../models/trip-store.js"
import { tripController } from "./trip-controller.js";
import { recordStatus } from "./trip-controller.js";
import { rpiStatus } from "../services/mqtt.js";
import { speed } from "../services/mqtt.js";



export const dashboardController = {
  async index(request, response) {
    let rpiOn
    let speedNumber
    if (rpiStatus == "online"){
      rpiOn = true
    } else {
      rpiOn = false
    }
    const trips = await tripStore.getAllTrips()

    trips.forEach(trip  => {
      trip.startingLocationLatitude = trip.telemetry[0].latitude
      trip.startingLocationLongitude = trip.telemetry[0].longitude
      console.log(trip.startingLocationLatitude, trip.startingLocationLongitude)
    });

    const viewData = {
      title: "Telemetry Dashboard",
      trips: trips,
      recordStatus: recordStatus, //control the record status from dashboard, avoid routing problems
      rpiStatus: rpiOn,
      speedNumber: speed
    };
    console.log(`rpi is${viewData.rpiStatus}`)
    console.log("dashboard rendering");
    response.render("dashboard-view", viewData);
  },

};
