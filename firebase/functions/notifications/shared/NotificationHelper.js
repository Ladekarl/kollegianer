'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendNotification = (notificationTokens, payload) => {
  return admin.messaging().sendToDevice(notificationTokens, payload)
    .then(response => {
      // For each message check if there was an error.
      let failedTokens = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', notificationTokens[index], error);
          failedTokens.push(notificationTokens[index]);
        }
      });
      return Promise.all([removeNotificationTokens(failedTokens)]);
    });
};

const removeNotificationTokens = (failedTokens) => {
  return new Promise(resolve => {
    let tokensToRemove = [];
    if (failedTokens.length > 0) {
      console.log('Removing failed notification tokens');
      readDatabase(`/user/`).then(results => {
        const userSnapshots = results[0];
        userSnapshots.forEach(snapshot => {
          let user = snapshot.val();
          failedTokens.forEach(token => {
            const tokenIndex = user.notificationTokens && user.notificationTokens.length > 0 ?
              user.notificationTokens.indexOf(token) : -1;
            if (tokenIndex !== -1) {
              user.notificationTokens.splice(tokenIndex, 1);
            }
          });
          tokensToRemove.push(snapshot.ref.set(user));
        });
        Promise.all(tokensToRemove).then(() => {
          resolve();
        });
      });
    }
  });
};

const findUser = (uid, userSnapshots) => {
  userSnapshots.forEach(snapshot => {
    if (uid === snapshot.key) {
      return snapshot.val();
    }
  });
};

const getNotificationTokens = (userSnapshots, conditionFn) => {
  let notificationTokens = [];
  userSnapshots.forEach(snapshot => {
    const user = snapshot.val();
    if (conditionFn(snapshot.key, user) && user.notificationTokens) {
      notificationTokens = notificationTokens.concat(user.notificationTokens);
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
    let notificationTokens = notificationTokenFn(usersSnapshots, committingUid);

    if (notificationTokens.length === 0) {
      return console.log('There are no notification tokens to send to.');
    }

    console.log('There are', notificationTokens.length, 'tokens to send notifications to.');

    return sendNotification(notificationTokens, notificationFn(committingUser));
  });
};

const notifyOnWrite = (path, fn) => {
  return functions.database.ref(path).onWrite(event => fn(event));
};

const notifyOnUpdate = (path, fn) => {
  return functions.database.ref(path).onUpdate(event => fn(event));
};

module.exports = {
  getNotificationTokens,
  buildNotification,
  getPreviousValue,
  getValue,
  publishNotification,
  notifyOnWrite,
  notifyOnUpdate
};