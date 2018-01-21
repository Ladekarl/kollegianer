'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendNotification = (notificationTokens, payload) => {
  return admin.messaging().sendToDevice(notificationTokens, payload)
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
};

const findUser = (uid, userSnapshots) => {
  userSnapshots.forEach(snapshot => {
    if (uid === snapshot.key) {
      return snapshot.val();
    }
  });
};

const getNotificationTokens = (userSnapshots, condition) => {
  let notificationTokens = [];
  userSnapshots.forEach(snapshot => {
    const user = snapshot.val();
    if (condition(snapshot.key, user) && user.notificationToken) {
      notificationTokens.push(user.notificationToken);
    }
  });
  return notificationTokens;
};

const buildNotification = (title, body, clickAction) => {
  return {
    notification: {
      title: title,
      body: body,
      click_action: clickAction
    }
  };
};

const getPreviousValue = (event) => {
  return event.data.previous.val();
};

const getValue = (event) => {
  return event.data.val()
};

const getCommittingId = (event) => {
  return event.auth.variable ? event.auth.variable.uid : '';
};

const readDatabase = (path) => {
  let pathPromise = admin.database().ref(path).once('value');
  return Promise.all([pathPromise]);
};

const publishNotification = (event, notificationTokenFn, notificationFn) => {
  const committingUid = getCommittingId(event);
  return readDatabase(`/user/`).then(results => {
    const usersSnapshots = results[0];
    let committingUser = findUser(committingUid, usersSnapshots);
    let notificationTokens = notificationTokenFn(usersSnapshots);

    if (notificationTokens.length === 0) {
      return console.log('There are no notification tokens to send to.');
    }

    console.log('There are', notificationTokens.length, 'tokens to send notifications to.');

    return sendNotification(notificationTokens, notificationFn(committingUser));
  });
};

const notifyOn = (path) => {
  return functions.database.ref(path);
};

module.exports = {
  sendNotification,
  findUser,
  getNotificationTokens,
  buildNotification,
  getPreviousValue,
  getValue,
  getCommittingId,
  readDatabase,
  publishNotification,
  notifyOn
};