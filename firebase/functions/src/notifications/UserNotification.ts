import {
    buildNotification,
    getPreviousValue,
    getValue,
    NotificationToken,
    notifyOnUpdate,
    publishNotification,
    User
} from './shared/NotificationHelper';
import { Action } from './shared/Constants';

const buildKitchenWeekNotification = (committingUser: User | null) =>
    buildNotification(
        'Du har nu køkkenugen',
        committingUser ? `${committingUser.room} gav dig køkkenugen` : '',
        Action.KitchenWeek);
const buildSheriffNotification = (committingUser: User | null) =>
    buildNotification(
        'Du er nu sheriff',
        committingUser ? `${committingUser.room} gjorde dig til sheriff` : '',
        Action.Sheriff);

const getUserUpdatedNotificationTokens = (user: User, previousUser: User) => {
    let notificationTokens: NotificationToken[] = [];
    if (user.notificationTokens &&
        user.notificationTokens.length &&
        user.notificationTokens.length > 0 &&
        ((!previousUser.kitchenweek && user.kitchenweek) || (!previousUser.sheriff && user.sheriff))) {
        notificationTokens = user.notificationTokens.filter(t => t.token);
    }
    return notificationTokens;
};

export const UserUpdatedNotification = notifyOnUpdate('/user/{userUid}', (event, context) => {
    const user = getValue(event);
    const previousUser = getPreviousValue(event);

    const notificationTokens = () => getUserUpdatedNotificationTokens(user, previousUser);

    const notification = user.kitchenweek ?
        (committingUid: string, committingUser: User | null) => buildKitchenWeekNotification(committingUser) :
        (committingUid: string, committingUser: User | null) => buildSheriffNotification(committingUser);

    return publishNotification(context, notificationTokens, notification, user.kitchenweek ? Action.KitchenWeek : Action.Sheriff);
});