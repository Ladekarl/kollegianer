'use strict';

const {
  buildNotification,
  getNotificationTokens,
  notifyOnUpdate,
  publishNotification
} = require('./shared/NotificationHelper');

exports.BeerAccountNotification = notifyOnUpdate('/accounting/beerAccount', event => {
  publishNotification(event, (usersSnapshots, committingUid) =>
      getNotificationTokens(usersSnapshots, (userId) => committingUid !== userId),
    () => buildNotification(
      'Nyt regnskab', 'Ølregnskabet blev opdateret', 'fcm.ACCOUNTING'
    )
  );
});

exports.KitchenAccountNotification = notifyOnUpdate('/accounting/kitchenAccount', event => {
  publishNotification(event, (usersSnapshots, committingUid) =>
      getNotificationTokens(usersSnapshots, (userId) => String.valueOf(committingUid) !== String.valueOf(userId)),
    () => buildNotification(
      'Nyt regnskab', 'Køkkenregnskabet blev opdateret', 'fcm.ACCOUNTING'
    )
  );
});