'use strict';

const {
    buildNotification,
    getNotificationTokens,
    getValue,
    notifyOnCreate,
    notifyOnUpdate,
    publishNotification
} = require('./shared/NotificationHelper');

exports.ViManglerAddedNotification = notifyOnCreate('/vimangler/{viManglerUid}', event => {
    const viMangler = getValue(event);
    return publishNotification(event, getNotificationTokensForViMangler, () => buildViManglerAddedNotification(viMangler));
});

exports.ViManglerUpdatedNotification = notifyOnUpdate('/vimangler/{viManglerUid}', event => {
    const viMangler = getValue(event);

    let notification = viMangler.checked ?
        (committingUser) => buildViManglerUpdatedNotification(committingUser, viMangler) :
        () => buildViManglerAddedNotification(viMangler);
    return publishNotification(event, getNotificationTokensForViMangler, notification, 'kollegianer.vi_mangler_updated');
});

const userIsShopper = (user) => user.duty.toLowerCase().indexOf('indkøber') !== -1;

const getNotificationTokensForViMangler = (usersSnapshots, committingUid) =>
    getNotificationTokens(usersSnapshots, committingUid,
        (userId, user) => userIsShopper(user)
    );

const buildViManglerAddedNotification = (viMangler) => buildNotification(
    'Der blev tilføjet en ting til Vi Mangler',
    `${viMangler.item} blev tilføjet af ${viMangler.room}`,
    'fcm.VI_MANGLER'
);

const buildViManglerUpdatedNotification = (committingUser, viMangler) => buildNotification(
    'Der blev købt en ting på Vi Mangler',
    `${viMangler.item} blev købt af ${committingUser.room}`,
    'fcm.VI_MANGLER');