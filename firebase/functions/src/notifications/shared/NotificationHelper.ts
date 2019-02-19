import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import DataSnapshot = admin.database.DataSnapshot;

export const readDatabaseOnce = (path) => {
    return admin.database().ref(path).once('value');
};

export const removeNotificationTokens = (failedTokens) => {
    return new Promise((resolve, reject) => {
        if (failedTokens.length > 0) {
            console.log('Removing failed notification tokens');
            readDatabaseOnce(`/user/`).then(results => {
                const userSnapshots = results[0];
                let removeTokensPromises: Array<any> = [];
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
        } else {
            resolve();
        }
    });
};

export const sendNotification = (notificationTokens, payload) => {
    const options = {priority: 'high'};
    return admin.messaging().sendToDevice(notificationTokens, payload, options)
        .then(response => {
            // For each message check if there was an error.
            let failedTokens: Array<any> = [];
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

export const findUser = (uid: string, userSnapshots: DataSnapshot) => {
    let user = null;
    userSnapshots.forEach(snapshot => {
        if (String(uid).valueOf() == String(snapshot.key).valueOf()) {
            user = snapshot.val();
        }
    });
    return user;
};

export const getNotificationTokens = (userSnapshots, committingUid, conditionFn) => {
    let notificationTokens: Array<any> = [];
    const userIsNotCommitting = (uid, userId) => String(uid).valueOf() != String(userId).valueOf();
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

export const buildNotification = (title, body, clickAction) => {
    return {
        title: title,
        body: body,
        click_action: clickAction
    }
};

export const buildNotificationIos = (payload) => {
    return {
        notification: payload
    }
};

export const buildNotificationAndroid = (payload, tag) => {
    return {
        data: {
            custom_notification: JSON.stringify(Object.assign({
                priority: 'high',
                show_in_foreground: true,
                tag: tag
            }, payload))
        }
    };
};

export const getPreviousValue = (event) => {
    return event.data.previous.val();
};

export const getValue = (event) => {
    return event.data.val()
};

export const getCommittingId = (event) => {
    return event.auth.variable ? event.auth.variable.uid : '';
};

export const publishNotification = async (event, notificationTokenFn, notificationFn, tag) => {
    const committingUid = getCommittingId(event);
    const usersSnapshots = await readDatabaseOnce(`/user/`);

    let committingUser = findUser(committingUid, usersSnapshots);
    let notificationTokens = notificationTokenFn(usersSnapshots, committingUid);

    if (notificationTokens.length === 0) {
        console.log('There are no notification tokens to send to.');
        return Promise.resolve();
    }

    const iosNotifTokens = notificationTokens.filter(n => n.token && n.isIos).map(n => n.token);
    const androidNotifTokens = notificationTokens.filter(n => n.token && !n.isIos).map(n => n.token);

    console.log('There are', notificationTokens.length, 'tokens to send notifications to.', iosNotifTokens.length, 'iOS and', androidNotifTokens.length, 'android');

    const notificationPayload = notificationFn(committingUser);

    return Promise.all([
        sendNotification(iosNotifTokens, buildNotificationIos(notificationPayload)),
        sendNotification(androidNotifTokens, buildNotificationAndroid(notificationPayload, tag))
    ]);
};

export const notifyOnWrite = (path, fn) => {
    return functions.database.ref(path).onWrite(event => fn(event));
};

export const notifyOnCreate = (path, fn) => {
    return functions.database.ref(path).onCreate(event => fn(event));
};

export const notifyOnUpdate = (path, fn) => {
    return functions.database.ref(path).onUpdate(event => fn(event));
};

export const notifyOnDelete = (path, fn) => {
    return functions.database.ref(path).onDelete(event => fn(event));
};