import {
    buildNotification,
    getNotificationTokens,
    getValue,
    notifyOnCreate,
    notifyOnUpdate,
    publishNotification,
    User
} from './shared/NotificationHelper';
import * as admin from "firebase-admin";
import DataSnapshot = admin.database.DataSnapshot;
import { Action } from './shared/Constants';

interface ViMangler {
    checked: boolean;
    date: string;
    item: string;
    room: string;
}

const userIsShopper = (user: User) => user.duty.toLowerCase().indexOf('indkøber') !== -1;

const getNotificationTokensForViMangler = (usersSnapshots: DataSnapshot, committingUid: string) =>
    getNotificationTokens(usersSnapshots, committingUid,
        (userId, user) => userIsShopper(user)
    );

const buildViManglerAddedNotification = (viMangler: ViMangler) => buildNotification(
    'Der blev tilføjet en ting til Vi Mangler',
    `${viMangler.item} blev tilføjet af ${viMangler.room}`,
    Action.ViMangler
);

const buildViManglerUpdatedNotification = (committingUser: User | null, viMangler: ViMangler) => buildNotification(
    'Der blev købt en ting på Vi Mangler',
    `${viMangler.item} blev købt` + (committingUser ? `af ${committingUser.room}` : ''),
    Action.ViMangler);

export const ViManglerAddedNotification = notifyOnCreate('/vimangler/{viManglerUid}', (event, context) => {
    const viMangler = event.val();
    return publishNotification(context, getNotificationTokensForViMangler, () => buildViManglerAddedNotification(viMangler), Action.ViMangler);
});

export const ViManglerUpdatedNotification = notifyOnUpdate('/vimangler/{viManglerUid}', (event, context) => {
    const viMangler = getValue(event);

    const notification = viMangler.checked ?
        (committingUid: string, committingUser: User | null) => buildViManglerUpdatedNotification(committingUser, viMangler) :
        () => buildViManglerAddedNotification(viMangler);
    return publishNotification(context, getNotificationTokensForViMangler, notification, Action.ViMangler);
});