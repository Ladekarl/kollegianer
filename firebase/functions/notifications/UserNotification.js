'use strict';

const {
    buildNotification,
    getPreviousValue,
    getValue,
    notifyOnUpdate,
    publishNotification
} = require('./shared/NotificationHelper');

exports.UserUpdatedNotification = notifyOnUpdate('/user/{userUid}', event => {
    const user = getValue(event);
    const previousUser = getPreviousValue(event);

    const notificationTokens = () => getUserUpdatedNotificationTokens(user, previousUser);

    let notification = user.kitchenWeek ?
        (committingUser) => buildKitchenWeekNotification(committingUser) :
        (committingUser) => buildSheriffNotification(committingUser);

    return publishNotification(event, notificationTokens, notification);
});

const getUserUpdatedNotificationTokens = (user, previousUser) => {
    let notificationTokens = [];
    if (user.notificationTokens &&
        user.notificationTokens.length &&
        user.notificationTokens.length > 0 &&
        ((!previousUser.kitchenweek && user.kitchenweek) || (!previousUser.sheriff && user.sheriff))) {
        notificationTokens = user.notificationTokens.filter(t => t.token);
    }
    return notificationTokens;
};

const buildKitchenWeekNotification = (committingUser) => buildNotification('Du har nu køkkenugen', `${committingUser.room} gav dig køkkenugen`, 'fcm.KITCHEN_WEEK');
const buildSheriffNotification = (committingUser) => buildNotification('Du er nu sheriff', `${committingUser.room} gjorde dig til sheriff`, 'fcm.SHERIFF');