import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const PartyLightKiller = functions.pubsub.schedule("every day 05:00")
   .timeZone("Europe/Copenhagen")
   .onRun((context) => {
      return admin.database().ref("events/partymode").set("", (error?) => {
         if (error && error !== undefined) {
            console.log("Successfully turned off partylights @", context.timestamp)
         } else {
            console.error(error)
         }
      })
   })
