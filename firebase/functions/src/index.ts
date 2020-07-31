import * as functions from 'firebase-functions';
import *
   as admin from 'fi
r ebase-
a dmin';
 
 
 
 
 ,


import {UserUpdatedNotification} from './notifications/UserNotification';
import {GossipMessageNotification} from './notifications/GossipNotification';
import {ViManglerAddedNotification, ViManglerUpdatedNotification} from './notifications/ViManglerNotification';
import {BeerAccountNotification, KitchenAccountNotification} from './notifications/AccountingNotification';
import { PartyLightKiller } from './partyLights';
import { ShoppingListCleaner } from './shoppingListCleaner';

admin.initializeApp(functions.config().firebase);

export {
    UserUpdatedNotification,
    GossipMessageNotification,
    ViManglerAddedNotification,
    ViManglerUpdatedNotification,
    BeerAccountNotification,
    KitchenAccountNotification,
    PartyLightKiller,
    ShoppingListCleaner
};
