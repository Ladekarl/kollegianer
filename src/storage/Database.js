import firebase from 'react-native-firebase';
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
            photo: user.photoURL
        };
        return firebase.database().ref().update(updates);
    }

    static async getUser(userId) {
        let userPath = '/user/' + userId;
        return firebase.database().ref(userPath).once('value');
    }

    static async updateUser(key, user) {
        return firebase.database().ref('/user/' + key).update(user);
    }

    static async deleteUser(userId) {
        await firebase.database().ref('/user/' + userId).remove();
    }

    static async deleteAccount(userId) {
        await Database.deleteUser(userId);
        const user = firebase.auth().currentUser;
        return user.delete();
    }

    static async listenUser(key, callback) {
        return firebase.database().ref('/user/' + key).on('value', callback);
    }

    static async getNotificationTokens(key) {
        return firebase.database().ref('/user/' + key + 'notificationTokens').once('value');
    }

    static async updateNotificationTokens(key, value) {
        return firebase.database().ref('/user/' + key + 'notificationTokens').update(value);
    }

    static async getUsers() {
        return firebase.database().ref('/user/').orderByChild('room').once('value');
    }

    static async listenUsers(callback) {
        return firebase.database().ref('/user/').orderByChild('room').on('value', callback);
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

    static async getGossip(limit) {
        return firebase.database().ref('/gossip/').limitToLast(limit).once('value');
    }

    static async listenGossip(limit, callback) {
        return firebase.database().ref('/gossip/').limitToLast(limit).on('value', callback);
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
        return firebase.database().ref(eventsPath).on('value', callback);
    }

    static async listenFish(callback) {
        let fishPath = '/fish/';
        return firebase.database().ref(fishPath).on('value', callback);
    }

    static async unListenFish() {
        let fishPath = '/fish/';
        return firebase.database().ref(fishPath).off('value');
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

    static async addGossipImage(image, imageName) {
        return firebase.storage().ref('gossip').child(imageName).put(image.path, {contentType: 'image/jpg'});
    }

    static async updateBeerAccount(data) {
        let beerAccount = {
            data: data,
            updatedOn: new Date()
        };
        return firebase.database().ref('/accounting/beerAccount').update(beerAccount);
    }

    static async updateKitchenAccount(data) {
        let kitchenAccount = {
            data: data,
            updatedOn: new Date()
        };
        return firebase.database().ref('/accounting/kitchenAccount').update(kitchenAccount);
    }

    static async getKeyphrase() {
        let keyphrasePath = '/keyphrase';
        return firebase.database().ref(keyphrasePath).once('value');
    }

}