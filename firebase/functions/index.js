'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const {sendUserUpdatedNotification} = require('./notifications/UserNotification');
const {sendGossipMessageNotification} = require('./notifications/GossipNotification');
const {sendViManglerNotification} = require('./notifications/ViManglerNotification');

admin.initializeApp(functions.config().firebase);

module.exports = {
  sendUserUpdatedNotification,
  sendGossipMessageNotification,
  sendViManglerNotification
};