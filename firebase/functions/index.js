'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendUserUpdatedNotification = functions.database.ref('/user/{userUid}').onUpdate(event => {
  const userUid = event.params.userUid;
  const user = event.data.val();
  const previousUser = event.data.previous.val();
  const committingUid = event.auth.variable ? event.auth.variable.uid : '';
  if (!user) {
    return console.log(userUid, ' was deleted');
  }
  const getUsersPromise = admin.database().ref(`/user/`).once('value');

  return Promise.all([getUsersPromise]).then(results => {
    const usersSnapshots = results[0];
    let notificationTokens = [];
    let committingUser;
    usersSnapshots.forEach(userSnapshot => {
      // Find the user who actually did the update.
      if (committingUid === userSnapshot.key) {
        committingUser = userSnapshot.val();
      }
    });
    if (user.notificationToken && ((!previousUser.kitchenweek && user.kitchenweek) || (!previousUser.sheriff && user.sheriff))) {
      notificationTokens.push(user.notificationToken);
    }
    // Check if there are any device tokens.
    if (notificationTokens.length === 0) {
      return console.log('There are no notification tokens to send to.');
    }
    console.log('There are', notificationTokens.length, 'tokens to send notifications to.');

    // Notification details.
    const kitchenWeekUpdated = {
      notification: {
        title: 'Du har nu køkkenugen',
        body: `${committingUser.room} gav dig køkkenugen`,
        click_action: 'fcm.KITCHEN_WEEK'
      }
    };

    const sheriffUpdated = {
      notification: {
        title: 'Du er nu sheriff',
        body: `${committingUser.room} gjorde dig til sheriff`,
        click_action: 'fcm.SHERIFF'
      }
    };

    // Send notifications to all tokens.
    return admin.messaging().sendToDevice(notificationTokens, user.kitchenweek ? kitchenWeekUpdated : sheriffUpdated)
      .then(response => {
        // For each message check if there was an error.
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error('Failure sending notification to', notificationTokens[index], error);
            // Should remove the failed tokens and return them.
          }
        });
        return Promise.all([]);
      });
  });
});

exports.sendGossipMessageNotification = functions.database.ref('/gossip/{gossipUid}').onWrite(event => {
  const gossipUid = event.params.gossipUid;
  const gossip = event.data.val();
  const uid = event.auth.variable ? event.auth.variable.uid : '';
  let notificationTokens = [];

  // Notification details.
  const messageUpdated = {
    notification: {
      title: 'Ny besked i Gossip',
      body: `${committingUser.room} gav dig køkkenugen`,
      click_action: 'fcm.KITCHEN_WEEK'
    }
  };

  return admin.messaging().sendToDevice(notificationTokens, user.kitchenweek ? kitchenWeekUpdated : sheriffUpdated)
    .then(response => {
      // For each message check if there was an error.
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', notificationTokens[index], error);
          // Should remove the failed tokens and return them.
        }
      });
      return Promise
});

exports.sendViManglerNotification = functions.database.ref('/vimangler/{viManglerUid}').onWrite(event => {
  const viManglerUid = event.params.viManglerUid;
  const viMangler = event.data.val();
  const uid = event.auth.variable ? event.auth.variable.uid : '';
  // If delete ViMangler then exit the function.
  if (!viMangler) {
    return console.log(viManglerUid, ' was deleted');
  }
  // Get the list of device notification tokens.
  const getUsersPromise = admin.database().ref(`/user/`).once('value');

  return Promise.all([getUsersPromise]).then(results => {
    const usersSnapshots = results[0];
    let notificationTokens = [];
    let committingUser;
    usersSnapshots.forEach(userSnapshot => {
      const user = userSnapshot.val();
      // Find the user who actually did the update.
      if (uid === userSnapshot.key) {
        committingUser = userSnapshot.val();
      }
      // Do not push notification to user who updated and only push if duty is indkøber.
      else if (user.duty === 'Indkøber' && user.notificationToken) {
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
        body: `${viMangler.item} blev tilføjet af ${committingUser.room}`,
        click_action: 'fcm.VI_MANGLER'
      }
    };

    const viManglerChecked = {
      notification: {
        title: 'Der blev købt en ting på Vi Mangler',
        body: `${viMangler.item} blev købt af ${committingUser.room}`,
        click_action: 'fcm.VI_MANGLER'
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
            // Should remove the failed tokens and return them.
          }
        });
        return Promise.all([]);
      });
  });
});