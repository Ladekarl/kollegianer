import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const ShoppingListCleaner = functions.pubsub.schedule("0 5 1-31/2 * *") // Every second (ODD) day @  05:00
   .timeZone("Europe/Copenhagen")
   .onRun(() => {
      return admin.database().ref("vimangler")
         .once("value", (data) => {
            let returns: Promise<void>[] = []
            let count = 0
            data.forEach(entry => {
               if (entry.val().checked) {
                  returns.push(entry.ref.remove())
                  count++
               }
            })
            console.log(`Removed ${count} entries from 'vimangler'`)
            return Promise.all(returns)
         }, console.error)
   })
