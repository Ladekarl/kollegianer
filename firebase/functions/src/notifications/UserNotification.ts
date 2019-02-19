import {
    buildNotification,
    getPreviousValue,
    getValue,
    NotificationToken,
    notifyOnUpdate,
    publishNotification,
    User
} from './shared/NotificationHelper';


const buildKitchenWeekNotification = (committingUser: User | null) =>
    buildNotification(
        'Du har nu køkkenugen',
        committingUser ? `${committingUser.room} gav dig køkkenugen` : '',
        'fcm.KITCHEN_WEEK');
const buildSheriffNotification = (committingUser: User | null) =>
    buildNotification(
        'Du er nu sheriff',
        committingUser ? `${committingUser.room} gjorde dig til sheriff` : '',
        'fcm.SHERIFF');

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

    const tag = user.kitchenweek ? 'kollegianer.kitchen_week' : 'kollegianer.sheriff';

    return publishNotification(context, notificationTokens, notification, tag);
});