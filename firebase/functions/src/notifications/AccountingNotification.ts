import {
    buildNotification,
    getNotificationTokens,
    notifyOnUpdate,
    publishNotification
} from './shared/NotificationHelper';
import { Action } from './shared/Constants';

const buildAccountingNotification = (account: string) => buildNotification(
    'Nyt regnskab',
    `${account} blev opdateret`,
    Action.Accounting
);
const buildBeerAccountingNotification = () => buildAccountingNotification('Ølregnskabet');
const buildKitchenAccountingNotification = () => buildAccountingNotification('Køkkenregnskabet');

export const BeerAccountNotification = notifyOnUpdate('/accounting/beerAccount', async (_event, context) => {
    await publishNotification(context, getNotificationTokens, buildBeerAccountingNotification, Action.Accounting);
});

export const KitchenAccountNotification = notifyOnUpdate('/accounting/kitchenAccount', async (_event, context) => {
    await publishNotification(context, getNotificationTokens, buildKitchenAccountingNotification, Action.Accounting);
});