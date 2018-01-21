'use strict';

const {
  buildNotification,
  getNotificationTokens,
  getValue,
  notifyOn,
  publishNotification
} = require('./shared/NotificationHelper');

exports.sendGossipMessageNotification = notifyOn('/gossip/{gossipUid}').onWrite(event => {
  const newGossip = getValue(event);
  let message = newGossip.message;

  if (message.length > 25) {
    message = message.slice(0, 25) + '...'
  } else if (message.photo) {
    message = 'Nogen har posted et billede!';
  }

  return publishNotification(event, (usersSnapshots) =>
      getNotificationTokens(usersSnapshots, () => true),
    () =>
      buildNotification('Gossip!', message, 'fcm.GOSSIP')
  );
});