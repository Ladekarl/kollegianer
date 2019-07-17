import {
    buildNotification,
    getNotificationTokens,
    notifyOnCreate,
    publishNotification
} from './shared/NotificationHelper';

interface GossipPhoto {
    height: number;
    url: string;
    width: number;
}

interface GossipMessage {
    date: string;
    message: string;
    photo?: GossipPhoto;
}

export const GossipMessageNotification = notifyOnCreate('/gossip/{gossipUid}', (event, context) => {
    const newGossip: GossipMessage = event.val();
    let message = newGossip.message;

    if (message.length > 50) {
        message = message.slice(0, 50) + '...';
    } else if (newGossip.photo) {
        message = 'Nogen har posted et billede!';
    }

    const buildGossipNotification = () => buildNotification('Gossip!', message, 'fcm.GOSSIP');

    return publishNotification(context, getNotificationTokens, buildGossipNotification, 'kollegianer.gossip');
});