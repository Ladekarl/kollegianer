import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import DataSnapshot = admin.database.DataSnapshot;
import MessagingPayload = admin.messaging.MessagingPayload;
import MessagingOptions = admin.messaging.MessagingOptions;
import NotificationMessagePayload = admin.messaging.NotificationMessagePayload;
import EventContext = functions.EventContext;
import Change = functions.Change;

export interface NotificationToken {
    token: string;
    isIos: boolean;
}

interface Account {
    data: string[][];
    updatedOn: Date;
}


export interface User {
    beerAccount: Account
    birthday: string;
    duty: string;
    email: string;
    kitchenAccount: Account
    kitchenweek: boolean;
    name: string;
    notificationTokens: NotificationToken[];
    room: string;
    sheriff: boolean;
}

export const readDatabaseOnce = (path: string) => {
    return admin.database().ref(path).once('value');
};

export const removeNotificationTokens = (failedTokens: string[]) => {
    return new Promise((resolve, reject) => {
        if (failedTokens.length > 0) {
            console.log('Removing failed notification tokens');
            readDatabaseOnce(`/user/`).then(results => {
                const removeTokensPromises: Promise<void>[] = [];
                results.forEach(snapshot => {
                    const user: User = snapshot.val();
                    if (user.notificationTokens && user.notificationTokens.length && user.notificationTokens.length > 0) {
                        failedTokens.forEach(token => {
                            for (let i = 0; i < user.notificationTokens.length; i++) {
                                const notificationToken = user.notificationTokens[i];
                                if (notificationToken.token && String(notificationToken.token).valueOf() === String(token).valueOf()) {
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

export const sendNotification = async (notificationTokens: string[], payload: MessagingPayload) => {
    const options: MessagingOptions = {
        priority: 'high'
    };

    const response = await admin.messaging().sendToDevice(notificationTokens, payload, options);

    // For each message check if there was an error.
    const failedTokens: string[] = [];

    response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
            console.error('Failure sending notification to', notificationTokens[index], error);
            failedTokens.push(notificationTokens[index]);
        }
    });

    return removeNotificationTokens(failedTokens);
};

export const findUser = (uid: string, userSnapshots: DataSnapshot): User | null => {
    let user = null;
    userSnapshots.forEach(snapshot => {
        if (String(uid).valueOf() === String(snapshot.key).valueOf()) {
            user = snapshot.val();
        }
    });
    return user;
};

export const getNotificationTokens = (userSnapshots: DataSnapshot,
                                      committingUid: string,
                                      conditionFn?: (key: string | null, user: User) => boolean) => {
    let notificationTokens: NotificationToken[] = [];
    const userIsNotCommitting = (uid: string, userId: string | null) => String(uid).valueOf() !== String(userId).valueOf();
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

export const buildNotification = (title: string, body: string, clickAction: string): NotificationMessagePayload => {
    return {
        title,
        body,
        clickAction,
        click_action: clickAction
    }
};

export const buildNotificationIos = (payload: NotificationMessagePayload): MessagingPayload => {
    return {
        notification: payload
    }
};

export const buildNotificationAndroid = (payload: NotificationMessagePayload, tag?: string): MessagingPayload => {
    return {
        data: {
            custom_notification: JSON.stringify(Object.assign({
                priority: 'high',
                show_in_foreground: true,
                tag
            }, payload))
        }
    };
};

export const getPreviousValue = (event: Change<DataSnapshot>) => {
    return event.before ? event.before.val() : null;
};

export const getValue = (event: Change<DataSnapshot>) => {
    return event.after ? event.after.val() : null;
};

export const getCommittingId = (context: EventContext) => {
    return context.auth ? context.auth.uid : '';
};

export const publishNotification = async (context: EventContext,
                                          notificationTokenFn: (userSnapshots: DataSnapshot, committingUid: string) => NotificationToken[],
                                          notificationFn: (committingUid: string, committingUser: User | null) => NotificationMessagePayload,
                                          tag?: string) => {
    const committingUid = getCommittingId(context);
    const usersSnapshots = await readDatabaseOnce(`/user/`);

    const committingUser = findUser(committingUid, usersSnapshots);
    const notificationTokens = notificationTokenFn(usersSnapshots, committingUid);

    if (notificationTokens.length === 0) {
        console.log('There are no notification tokens to send to.');
        return Promise.resolve();
    }

    const iosNotifTokens = notificationTokens.filter(n => n.token && n.isIos).map(n => n.token);
    const androidNotifTokens = notificationTokens.filter(n => n.token && !n.isIos).map(n => n.token);

    console.log('There are', notificationTokens.length, 'tokens to send notifications to.', iosNotifTokens.length, 'iOS and', androidNotifTokens.length, 'android');

    const notificationPayload = notificationFn(committingUid, committingUser);

    return Promise.all([
        sendNotification(iosNotifTokens, buildNotificationIos(notificationPayload)),
        sendNotification(androidNotifTokens, buildNotificationAndroid(notificationPayload, tag))
    ]);
};

export const notifyOnWrite = (path: string, fn: (change: Change<DataSnapshot>, context: EventContext) => PromiseLike<any> | any) => {
    return functions.database.ref(path).onWrite(fn);
};

export const notifyOnCreate = (path: string, fn: (snapshot: DataSnapshot, context: EventContext) => PromiseLike<any> | any) => {
    return functions.database.ref(path).onCreate(fn);
};

export const notifyOnUpdate = (path: string, fn: (snapshot: Change<DataSnapshot>, context: EventContext) => PromiseLike<any> | any) => {
    return functions.database.ref(path).onUpdate(fn);
};

export const notifyOnDelete = (path: string, fn: (snapshot: DataSnapshot, context: EventContext) => PromiseLike<any> | any) => {
    return functions.database.ref(path).onDelete(fn);
};