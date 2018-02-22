'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const {UserUpdatedNotification} = require('./notifications/UserNotification');
const {GossipMessageNotification} = require('./notifications/GossipNotification');
const {ViManglerAddedNotification, ViManglerUpdatedNotification} = require('./notifications/ViManglerNotification');
const {BeerAccountNotification, KitchenAccountNotification} = require('./notifications/AccountingNotification');

admin.initializeApp(functions.config().firebase);

module.exports = {
    UserUpdatedNotification,
    GossipMessageNotification,
    ViManglerAddedNotification,
    ViManglerUpdatedNotification,
    BeerAccountNotification,
    KitchenAccountNotification
};