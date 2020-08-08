import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { appendToSheet } from "./Shared";


const CONFIG_SHEET_ID = "1CNTG1y0_9p2oowt_t1ZBDkOeOH_5tEsntuYNIzKV_7o"
const CONFIG_DATA_PATH = "vimangler"

const enum ACTIONS {
   NEW = "New",
   UPDATED = "Updated",
   DELETED = "Deleted"
}

// trigger function to write to Sheet when new data comes in on CONFIG_DATA_PATH
export const ShoppingListStatistics = functions.database.ref(`${CONFIG_DATA_PATH}/{ITEM}`).onWrite(
   async (change, context) => {
      let action = ACTIONS.UPDATED
      let room = (await admin.database().ref(`/user/${context.auth?.uid}`).once("value")).val()?.room || "SYSTEM"
      if (!change.before.exists()) { // New entry
         action = ACTIONS.NEW
         room = change.after.val().room
      } else if (!change.after.exists()) // Deleted
         action = ACTIONS.DELETED

      const item = change.after.val()?.item || change.before.val()?.item || "Unknown";
      const checked = change.after.val()?.checked || false

      return appendToSheet(CONFIG_SHEET_ID, 'Shopping!A:E',
      [`=${Date.now()}/86400000+DATE(1970;1;1)`, room, action, checked, item])
   });

// HTTPS function to write new data to CONFIG_DATA_PATH, for testing
export const testsheetwrite = functions.https.onRequest(async (_, res) => {
   const random1 = Math.floor(Math.random() * 100);
   const random2 = Math.floor(Math.random() * 100);
   const random3 = Math.floor(Math.random() * 100);
   const ID = new Date().getUTCMilliseconds();
   await admin.database().ref(`${CONFIG_DATA_PATH}/${ID}`).set({
      date: random1,
      item: random2,
      room: random3
   });
   res.send(`Wrote ${random1}, ${random2}, ${random3} to DB, trigger should now update Sheet.`);
});
