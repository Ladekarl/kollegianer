import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'rn-fetch-blob';

const polyfill = RNFetchBlob.polyfill;
window.XMLHttpRequest = polyfill.XMLHttpRequest;
window.Blob = polyfill.Blob;

export default class Database {
  static async addUser(user) {
    let updates = {};
    updates['/user/' + user.uid] = {
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
    };
    return database()
      .ref()
      .update(updates);
  }

  static async getUser(userId) {
    let userPath = '/user/' + userId;
    return database()
      .ref(userPath)
      .once('value');
  }

  static async updateUser(key, user) {
    return database()
      .ref('/user/' + key)
      .update(user);
  }

  static async deleteUser(userId) {
    await database()
      .ref('/user/' + userId)
      .remove();
  }

  static async deleteAccount(userId) {
    await Database.deleteUser(userId);
    const user = auth().currentUser;
    return user.delete();
  }

  static async listenUser(key, callback) {
    return database()
      .ref('/user/' + key)
      .on('value', callback);
  }

  static async getNotificationTokens(key) {
    return database()
      .ref('/user/' + key + 'notificationTokens')
      .once('value');
  }

  static async updateNotificationTokens(key, value) {
    return database()
      .ref('/user/' + key + 'notificationTokens')
      .update(value);
  }

  static async getUsers() {
    return database()
      .ref('/user/')
      .orderByChild('room')
      .once('value');
  }

  static async listenUsers(callback) {
    return database()
      .ref('/user/')
      .orderByChild('room')
      .on('value', callback);
  }

  static async unListenUsers() {
    let userPath = '/user/';
    return database()
      .ref(userPath)
      .off('value');
  }

  static async getViMangler() {
    return database()
      .ref('/vimangler/')
      .once('value');
  }

  static async listenViMangler(callback) {
    let viManglerPath = '/vimangler/';
    return database()
      .ref(viManglerPath)
      .on('value', snapshot => {
        callback(snapshot);
      });
  }

  static async unListenViManger() {
    let viManglerPath = '/vimanger/';
    return database()
      .ref(viManglerPath)
      .off('value');
  }

  static async addViMangler(item) {
    let newViManglerKey = database()
      .ref()
      .child('vimangler')
      .push().key;
    let updates = {};
    updates['/vimangler/' + newViManglerKey] = item;
    return database()
      .ref()
      .update(updates);
  }

  static async deleteViMangler(key) {
    let viManglerPath = '/vimangler/' + key;
    return database()
      .ref(viManglerPath)
      .remove();
  }

  static async updateViMangler(key, item) {
    return database()
      .ref('/vimangler/' + key)
      .update(item);
  }

  static async getGossip(limit) {
    return database()
      .ref('/gossip/')
      .limitToLast(limit)
      .once('value');
  }

  static async listenGossip(limit, callback) {
    return database()
      .ref('/gossip/')
      .limitToLast(limit)
      .on('value', callback);
  }

  static async unListenGossip() {
    return database()
      .ref('/gossip/')
      .off('value');
  }

  static async addGossip(message) {
    let newGossipPath = database()
      .ref()
      .child('/gossip/')
      .push().key;
    let updates = {};
    updates['/gossip/' + newGossipPath] = message;
    return database()
      .ref()
      .update(updates);
  }

  static async deleteGossip(key) {
    let gossipPath = '/gossip/' + key;
    return database()
      .ref(gossipPath)
      .remove();
  }

  static async updateGossip(key, message) {
    return database()
      .ref('/gossip/' + key)
      .update(message);
  }

  static async getDuties() {
    return database()
      .ref('/duties/')
      .once('value');
  }

  static async listenEvents(callback) {
    let eventsPath = '/events/';
    return database()
      .ref(eventsPath)
      .on('value', callback);
  }

  static async listenFish(callback) {
    let fishPath = '/fish/';
    return database()
      .ref(fishPath)
      .on('value', callback);
  }

  static async unListenFish() {
    let fishPath = '/fish/';
    return database()
      .ref(fishPath)
      .off('value');
  }

  static async unListenEvents() {
    let eventsPath = '/events/';
    return database()
      .ref(eventsPath)
      .off('value');
  }

  static async updateEvent(key, value) {
    let updates = {};
    updates['/events/' + key] = value;
    return database()
      .ref()
      .update(updates);
  }

  static async addGossipImage(image, imageName) {
    return storage()
      .ref('gossip')
      .child(imageName)
      .put(image.path, {contentType: 'image/jpg'});
  }

  static async updateBeerAccount(data) {
    let beerAccount = {
      data: data,
      updatedOn: new Date(),
    };
    return database()
      .ref('/accounting/beerAccount')
      .update(beerAccount);
  }

  static async updateKitchenAccount(data) {
    let kitchenAccount = {
      data: data,
      updatedOn: new Date(),
    };
    return database()
      .ref('/accounting/kitchenAccount')
      .update(kitchenAccount);
  }

  static async getKeyphrase() {
    let keyphrasePath = '/keyphrase';
    return database()
      .ref(keyphrasePath)
      .once('value');
  }
}
