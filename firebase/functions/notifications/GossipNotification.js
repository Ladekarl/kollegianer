'use strict';

const {
  buildNotification,
  getNotificationTokens,
  getValue,
  notifyOnWrite,
  publishNotification
} = require('./shared/NotificationHelper');

exports.GossipMessageNotification = notifyOnWrite('/gossip/{gossipUid}', (event) => {
  const newGossip = getValue(event);
  let message = newGossip.message;

  if (message.length > 50) {
    message = message.slice(0, 50) + '...';
  } else if (newGossip.photo) {
    message = 'Nogen har posted et billede!';
  }

  return publishNotification(event, (usersSnapshots, committingUid) =>
      getNotificationTokens(usersSnapshots, (userId) => committingUid !== userId),
    () =>
      buildNotification('Gossip!', message, 'fcm.GOSSIP')
  );
});