'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendViManglerNotification = functions.database.ref('/vimangler/{viManglerUid}').onWrite(event => {
  const viManglerUid = event.params.viManglerUid;
  const viMangler = event.data.val();
  const uid = event.auth.variable ? event.auth.variable.uid : '';
  // If delete ViMangler then exit the function.
  if (!viMangler) {
    return console.log(viManglerUid,' was deleted');
  }
  // Get the list of device notification tokens.
  const getUsersPromise = admin.database().ref(`/user/`).once('value');

  return Promise.all([getUsersPromise]).then(results => {
    const usersSnapshots = results[0];
    let notificationTokens = [];
    usersSnapshots.forEach(userSnapshot => {
      const user = userSnapshot.val();
      if (uid !== userSnapshot.key && user.duty === "Indkøber" && user.notificationToken) {
        notificationTokens.push(user.notificationToken);
      }
    });
    // Check if there are any device tokens.
    if (notificationTokens.length === 0) {
      return console.log('There are no notification tokens to send to.');
    }
    console.log('There are', notificationTokens.length, 'tokens to send notifications to.');

    // Notification details.
    const viManglerAdded = {
      notification: {
        title: 'Der blev tilføjet en ting til Vi Mangler',
        body: `${viMangler.item} blev tilføjet af ${viMangler.room}`,
        click_action: "fcm.VI_MANGLER"
      }
    };

    const viManglerChecked = {
      notification: {
        title: 'Der blev købt en ting på Vi Mangler',
        body: `${viMangler.item} blev købt`,
        click_action: "fcm.VI_MANGLER"
      }
    };

    // Send notifications to all tokens.
    return admin.messaging().sendToDevice(notificationTokens, viMangler.checked ? viManglerChecked : viManglerAdded)
      .then(response => {
      // For each message check if there was an error.
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', notificationTokens[index], error);
        }
      });
      return Promise.all([]);
    });
  });
});