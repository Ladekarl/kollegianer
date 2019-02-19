import {
    buildNotification,
    getNotificationTokens,
    notifyOnUpdate,
    publishNotification
} from './shared/NotificationHelper';

const buildAccountingNotification = (account) => buildNotification(
    'Nyt regnskab',
    `${account} blev opdateret`,
    'fcm.ACCOUNTING'
);
const buildBeerAccountingNotification = () => buildAccountingNotification('Ølregnskabet');
const buildKitchenAccountingNotification = () => buildAccountingNotification('Køkkenregnskabet');

export const BeerAccountNotification = notifyOnUpdate('/accounting/beerAccount', async event => {
    await publishNotification(event, getNotificationTokens, buildBeerAccountingNotification, 'kollegianer.beer_account');
});

export const KitchenAccountNotification = notifyOnUpdate('/accounting/kitchenAccount', async event => {
    await publishNotification(event, getNotificationTokens, buildKitchenAccountingNotification, 'kollegianer.kitchen_account');
});