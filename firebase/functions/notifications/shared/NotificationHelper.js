'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendNotification = (notificationTokens, payload) => {
  const options = {priority: 'high'};
  return admin.messaging().sendToDevice(notificationTokens, payload, options)
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
  return new Promise((resolve, reject) => {
    if (failedTokens.length > 0) {
      console.log('Removing failed notification tokens');
      readDatabase(`/user/`).then(results => {
        const userSnapshots = results[0];
        let removeTokensPromises = [];
        userSnapshots.forEach(snapshot => {
          let user = snapshot.val();
          failedTokens.forEach(token => {
            for (let i = 0; i < user.notificationTokens.length; i++) {
              let notifToken = user.notificationTokens[i];
              if (notifToken.token && String(notifToken.token).valueOf() == String(token).valueOf()) {
                user.notificationTokens.splice(i, 1);
                removeTokensPromises.push(snapshot.ref.set(user));
              }
            }
          });
        });
        Promise.all(removeTokensPromises).then(() => {
          console.log('Removed', removeTokensPromises.length, 'tokens');
          resolve();
        }).catch(error => {
          console.error('Error when removing notification tokens', error,);
          reject(error);
        });
      }).catch(error => {
        reject(error);
      });
    }
    else {
      resolve();
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
    title: title,
    body: body,
    click_action: clickAction
  }
};

const buildNotificationIos = (payload) => {
  return {
    notification: payload
  }
};

const buildNotificationAndroid = (payload) => {
  return {
    data: {
      custom_notification: JSON.stringify(Object.assign({
        priority: 'high',
        show_in_foreground: true
      }, payload))
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

    const iosNotifTokens = notificationTokens.filter(n => n.token && n.isIos).map(n => n.token);
    const androidNotifTokens = notificationTokens.filter(n => n.token && !n.isIos).map(n => n.token);

    console.log('There are', iosNotifTokens.length, 'iOS notifications');
    console.log('There are', androidNotifTokens.length, 'android notifications');

    const notificationPayload = notificationFn(committingUser);
    return Promise.all([
      sendNotification(iosNotifTokens, buildNotificationIos(notificationPayload)),
      sendNotification(androidNotifTokens, buildNotificationAndroid(notificationPayload))
    ]);
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