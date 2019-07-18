import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import {UserUpdatedNotification} from './notifications/UserNotification';
import {GossipMessageNotification} from './notifications/GossipNotification';
import {ViManglerAddedNotification, ViManglerUpdatedNotification} from './notifications/ViManglerNotification';
import {BeerAccountNotification, KitchenAccountNotification} from './notifications/AccountingNotification';
import { PartyLightKiller } from './partyLights';

admin.initializeApp(functions.config().firebase);

export {
    UserUpdatedNotification,
    GossipMessageNotification,
    ViManglerAddedNotification,
    ViManglerUpdatedNotification,
    BeerAccountNotification,
    KitchenAccountNotification,
    PartyLightKiller
};
