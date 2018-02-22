'use strict';

const {
    buildNotification,
    getNotificationTokens,
    notifyOnUpdate,
    publishNotification
} = require('./shared/NotificationHelper');

exports.BeerAccountNotification = notifyOnUpdate('/accounting/beerAccount', event => {
    publishNotification(event, getNotificationTokens, buildBeerAccountingNotification);
});

exports.KitchenAccountNotification = notifyOnUpdate('/accounting/kitchenAccount', event => {
    publishNotification(event, getNotificationTokens, buildKitchenAccountingNotification);
});

const buildBeerAccountingNotification = () => buildAccountingNotification('Ølregnskabet');
const buildKitchenAccountingNotification = () => buildAccountingNotification('Køkkenregnskabet');
const buildAccountingNotification = (account) => buildNotification(
    'Nyt regnskab',
    `${account} blev opdateret`,
    'fcm.ACCOUNTING'
);