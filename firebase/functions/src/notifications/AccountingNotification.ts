import {
    buildNotification,
    getNotificationTokens,
    notifyOnUpdate,
    publishNotification
} from './shared/NotificationHelper';

const buildAccountingNotification = (account: string) => buildNotification(
    'Nyt regnskab',
    `${account} blev opdateret`,
    'fcm.ACCOUNTING'
);
const buildBeerAccountingNotification = () => buildAccountingNotification('Ølregnskabet');
const buildKitchenAccountingNotification = () => buildAccountingNotification('Køkkenregnskabet');

export const BeerAccountNotification = notifyOnUpdate('/accounting/beerAccount', async (event, context) => {
    await publishNotification(context, getNotificationTokens, buildBeerAccountingNotification, 'kollegianer.beer_account');
});

export const KitchenAccountNotification = notifyOnUpdate('/accounting/kitchenAccount', async (event, context) => {
    await publishNotification(context, getNotificationTokens, buildKitchenAccountingNotification, 'kollegianer.kitchen_account');
});