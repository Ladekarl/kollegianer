'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const {UserUpdatedNotification} = require('./notifications/UserNotification');
const {GossipMessageNotification} = require('./notifications/GossipNotification');
const {ViManglerNotification} = require('./notifications/ViManglerNotification');
const {BeerAccountNotification, KitchenAccountNotification} = require('./notifications/AccountingNotification');

admin.initializeApp(functions.config().firebase);

module.exports = {
  UserUpdatedNotification,
  GossipMessageNotification,
  ViManglerNotification,
  BeerAccountNotification,
  KitchenAccountNotification
};