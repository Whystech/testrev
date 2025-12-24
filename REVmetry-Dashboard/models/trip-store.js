
import { initStore } from "../utils/store-utils.js";

const db = initStore("trips");

export const tripStore = {
  async getAllTrips() {
    await db.read();
    return db.data.trips;
  },

  async getTripsByUserId(userid) {
    await db.read();
    return db.data.trips.filter((trip) => trip.userid === userid);
  },

  async addTrip(trip) {
    await db.read();
    db.data.trips.push(trip);
    await db.write();
    return trip;
  },

  async getTripById(id) {
    await db.read();
    console.log(`model logging ${id}`)
    const trip = db.data.trips.find((trip) => trip._id === id);
    console.log(trip)
    return trip;
  },


  async deleteTripById(id) {
    await db.read();
    const index = db.data.trips.findIndex((trip) => trip._id === id);
    db.data.trips.splice(index, 1);
    await db.write();
  },

  async updateTripName(tripid, updatedTrip) {
    const trip = await this.getTripById(tripid);
    trip.telemetry = telemetry;
    await db.write();
  },

  async getLatestTelemetryData(tripid) {
    const trip = await this.getTripById(tripid);
    const getLatestTelemetryData = trip.telmetry[trip.telemetry.length-1]
    return getLatestTelemetryData
  },

  async deleteAllTrips() {
    //need await read here so I won't get null errors
    await db.read();
    db.data.trips = [];
    await db.write();
  },

  async getMinParameter(tripId, parameter) {
    await db.read();
    const telemetry = trip.telemetry
    if (reports.length !== 0) {
      ///same as sorting stations
      function sortedReportsFunc(a, b) {
        if (a[parameter] > b[parameter]) { //the string is passed here and the property is accessed neatly
          return 1
        }
        else {
          if (a[parameter] < b[parameter]) {
            return -1
          }
        }
      }
      const sortedReports = reports.sort(sortedReportsFunc);
      return sortedReports[0][parameter];
    }
    else {
      return 0;
    }
  },



  async getMaxParameter(tripId, parameter) {
    await db.read();
    const trips = await this.getAllTrips(tripId)
    if (trips.length !== 0) {
      ///same as above, as documentation points, only the return values have to be switched for min/max.
      function sortedTripsFunc(a, b) {
        if (a[parameter] > b[parameter]) {
          return -1
        }
        else {
          if (a[parameter] < b[parameter]) {
            return 1
          }
        }
      }
      const trips = trips.sort(sortedTripsFunc);
      return sortedTrips[0][parameter];
    }
    else {
      return 0;
    }
  },
};
