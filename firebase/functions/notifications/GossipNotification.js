'use strict';

const {
    buildNotification,
    getNotificationTokens,
    getValue,
    notifyOnCreate,
    publishNotification
} = require('./shared/NotificationHelper');

exports.GossipMessageNotification = notifyOnCreate('/gossip/{gossipUid}', (event) => {
    const newGossip = getValue(event);
    let message = newGossip.message;

    if (message.length > 50) {
        message = message.slice(0, 50) + '...';
    } else if (newGossip.photo) {
        message = 'Nogen har posted et billede!';
    }

    const buildGossipNotification = () => buildNotification('Gossip!', message, 'fcm.GOSSIP');

    return publishNotification(event, getNotificationTokens, buildGossipNotification, 'kollegianer.gossip');
});