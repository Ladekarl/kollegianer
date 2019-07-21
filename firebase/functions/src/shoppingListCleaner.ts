import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const ShoppingListCleaner = functions.pubsub.schedule("0 5 1-31/2 * *") // Every second (ODD) day @  05:00
   .timeZone("Europe/Copenhagen")
   .onRun(() => {
      // Retrive all the entries that should be kept:
      return admin.database().ref("vimangler")
         .orderByChild("checked")
         .equalTo(null)
         .once("value", (data) => {
            // and set the node to only contain those, effectively removing all the checked entries
            return admin.database().ref("vimangler").set(data.val(), (error?) => {
               if (error) {
                  console.error(error)
               } else {
                  console.log("Successfully deleted crossed out shopping items.")
               }
            })
         }, console.error)
   })
