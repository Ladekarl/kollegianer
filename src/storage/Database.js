import * as firebase from 'firebase';

export default class Database {

  static async getUser(userId) {
    let userPath = '/user/' + userId;

    return firebase.database().ref(userPath).once('value');
  }

  static async getUsers() {
    let userPath = '/user/';
    return firebase.database().ref(userPath).once('value');
  }

  static async listenViMangler(callback) {
    let viManglerPath = '/vimangler/';
    return firebase.database().ref(viManglerPath).on('value', (snapshot) => {
      callback(snapshot);
    });
  }

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
}