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
            readDatabaseOnce(`/user/`).then(results => {
                const userSnapshots = results[0];
                let removeTokensPromises = [];
                userSnapshots.forEach(snapshot => {
                    let user = snapshot.val();
                    if (user.notificationTokens && user.notificationTokens.length && user.notificationTokens.length > 0) {
                        failedTokens.forEach(token => {
                            for (let i = 0; i < user.notificationTokens.length; i++) {
                                let notificationToken = user.notificationTokens[i];
                                if (notificationToken.token && String(notificationToken.token).valueOf() == String(token).valueOf()) {
                                    user.notificationTokens.splice(i, 1);
                                    removeTokensPromises.push(snapshot.ref.set(user));
                                }
                            }
                        });
                    }
                });
                Promise.all(removeTokensPromises).then(() => {
                    console.log('Removed', removeTokensPromises.length, 'tokens');
                    resolve();
                }).catch(error => {
                    console.error('Error when removing notification tokens', error);
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
    let user = null;
    userSnapshots.forEach(snapshot => {
        if (String(uid).valueOf() == String(snapshot.key).valueOf()) {
            user = snapshot.val();
        }
    });
    return user;
};

const getNotificationTokens = (userSnapshots, committingUid, conditionFn) => {
    let notificationTokens = [];
    const userIsNotCommitting = (committingUid, userId) => String(committingUid).valueOf() != String(userId).valueOf();
    userSnapshots.forEach(snapshot => {
        const user = snapshot.val();
        if (user.notificationTokens &&
            user.notificationTokens.length &&
            user.notificationTokens.length > 0 &&
            userIsNotCommitting(committingUid, snapshot.key) &&
            (!conditionFn || conditionFn && conditionFn(snapshot.key, user))) {
            notificationTokens = notificationTokens
                .filter(t => t.token)
                .concat(user.notificationTokens);
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

const readDatabaseOnce = (path) => {
    return admin.database().ref(path).once('value');
};

const publishNotification = (event, notificationTokenFn, notificationFn) => {
    const committingUid = getCommittingId(event);
    return readDatabaseOnce(`/user/`).then(usersSnapshots => {
        let committingUser = findUser(committingUid, usersSnapshots);
        let notificationTokens = notificationTokenFn(usersSnapshots, committingUid);

        if (notificationTokens.length === 0) {
            return console.log('There are no notification tokens to send to.');
        }

        const iosNotifTokens = notificationTokens.filter(n => n.token && n.isIos).map(n => n.token);
        const androidNotifTokens = notificationTokens.filter(n => n.token && !n.isIos).map(n => n.token);

        console.log('There are', notificationTokens.length, 'tokens to send notifications to.', iosNotifTokens.length, 'iOS and', androidNotifTokens.length, 'android');

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

const notifyOnCreate = (path, fn) => {
    return functions.database.ref(path).onCreate(event => fn(event));
};

const notifyOnUpdate = (path, fn) => {
    return functions.database.ref(path).onUpdate(event => fn(event));
};

const notifyOnDelete = (path, fn) => {
    return functions.database.ref(path).onDelete(event => fn(event));
};

module.exports = {
    getNotificationTokens,
    buildNotification,
    getPreviousValue,
    getValue,
    publishNotification,
    notifyOnWrite,
    notifyOnCreate,
    notifyOnUpdate,
    notifyOnDelete
};