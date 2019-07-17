import {
    buildNotification,
    getNotificationTokens,
    notifyOnCreate,
    publishNotification
} from './shared/NotificationHelper';
import { Action } from './shared/Constants';

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
        message = 'Someone posted a picture!';
    }

    const buildGossipNotification = () => buildNotification('Gossip!', message, Action.Gossip);

    return publishNotification(context, getNotificationTokens, buildGossipNotification, Action.Gossip);
});