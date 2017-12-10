import * as firebase from 'firebase';

export default class Database {

  static async getUser(userId) {
    let userPath = '/user/' + userId;
    return firebase.database().ref(userPath).once('value');
  }

  static async updateUser(key, user) {
    return firebase.database().ref('/user/' + key).update(user);
  }

  static async updateNotificationToken(key, value) {
    return firebase.database().ref('/user/' + key + 'notificationToken').update(value);
  }

  static async getUsers() {
    let userPath = '/user/';
    return firebase.database().ref(userPath).orderByChild('room').once('value');
  }

  static async listenUsers(callback) {
    let userPath = '/user/';
    return firebase.database().ref(userPath).orderByChild('room').on('value', (snapshot) => {
      callback(snapshot);
    });
  }

  static async unListenUsers() {
    let userPath = '/user/';
    return firebase.database().ref(userPath).off('value');
  }

  static async getViMangler() {
    return firebase.database().ref('/vimangler/').once('value');
  }

  static async listenViMangler(callback) {
    let viManglerPath = '/vimangler/';
    return firebase.database().ref(viManglerPath).on('value', (snapshot) => {
      callback(snapshot);
    });
  }

  static async unListenViManger() {
    let viManglerPath = '/vimanger/';
    return firebase.database().ref(viManglerPath).off('value');
  };

  static async addViMangler(item) {
    let newViManglerKey = firebase.database().ref().child('vimangler').push().key;
    let updates = {};
    updates['/vimangler/' + newViManglerKey] = item;
    return firebase.database().ref().update(updates);
  }

  static async deleteViMangler(key) {
    let viManglerPath = '/vimangler/' + key;
    return firebase.database().ref(viManglerPath).remove();
  }

  static async updateViMangler(key, item) {
    return firebase.database().ref('/vimangler/' + key).update(item);
  }

  static async getGossip() {
    return firebase.database().ref('/gossip/').once('value');
  }

  static async listenGossip(callback) {
    return firebase.database().ref('/gossip/').on('value', (snapshot) => {
      callback(snapshot);
    });
  }

  static async unListenGossip() {
    return firebase.database().ref('/gossip/').off('value');
  };

  static async addGossip(message) {
    let newGossipPath = firebase.database().ref().child('/gossip/').push().key;
    let updates = {};
    updates['/gossip/' + newGossipPath] = message;
    return firebase.database().ref().update(updates);
  }

  static async deleteGossip(key) {
    let gossipPath = '/gossip/' + key;
    return firebase.database().ref(gossipPath).remove();
  }

  static async updateGossip(key, message) {
    return firebase.database().ref('/gossip/' + key).update(message);
  }

  static async getDuties() {
    return firebase.database().ref('/duties/').once('value');
  }

  static async listenEvents(callback) {
    let eventsPath = '/events/';
    return firebase.database().ref(eventsPath).on('value', (snapshot) => {
      callback(snapshot);
    });
  }

  static async unListenEvents() {
    let eventsPath = '/events/';
    return firebase.database().ref(eventsPath).off('value');
  }

  static async updateEvent(key, value) {
    let updates = {};
    updates['/events/' + key] = value;
    return firebase.database().ref().update(updates);
  }
}