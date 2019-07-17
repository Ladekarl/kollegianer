import React, {Component} from 'react';
import firebase from 'react-native-firebase';
import {Alert, Platform, StatusBar, StyleSheet, View} from 'react-native';
import LocalStorage from './storage/LocalStorage';
import Database from './storage/Database';
import colors from './shared/colors';
import AppNavigation from './navigation/AppNavigation';
import {navigateOnNotification} from './shared/NavigationHelpers';

export default class App extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        firebase.messaging().hasPermission().then(enabled => {
            if (!enabled) {
                return firebase.messaging().requestPermission();
            }
        }).then(() => {
            this.registerTokenRefreshListener();
            this.removeNotificationOpenedListener = firebase.notifications().onNotificationOpened(notification => {
                if (notification) {
                    navigateOnNotification(this.navigator, notification.notification);
                    this.removeInitialNotification(notification);
                }
            });
            firebase.messaging().getToken().then(token => {
                if (token) {
                    const newToken = {token: token, isIos: Platform.OS === 'ios'};
                    LocalStorage.setFcmToken(newToken).catch(error => console.log(error));
                }
            }).catch(error => console.log(error));
        }).catch((error) => {
            console.log(error);
            Alert.alert('Tilladelse afvist',
                'Du afviste tilladelsen. Prøv lige igen.');
        });
    }

    registerTokenRefreshListener = () => {
        this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(token => {
            const user = firebase.auth().currentUser;
            if (user && token) {
                const newToken = {token: token, isIos: Platform.OS === 'ios'};
                LocalStorage.setFcmToken(newToken).catch(error => console.log(error));
                Database.getNotificationTokens(user.uid).then(snapshot => {
                    let tokens = snapshot.val();
                    let tokenFound = false;
                    tokens.forEach(t => {
                        if (String(t.token).valueOf() == String(newToken.token).valueOf()) {
                            tokenFound = true;
                        }
                    });
                    if (!tokenFound) {
                        tokens.push(newToken);
                        Database.updateNotificationTokens(user.uid, tokens).catch(error => console.log(error));
                    }
                }).catch(error => console.log(error));
            }
        });
    };

    getInitialNotification = () => {
        return new Promise((resolve, reject) => {
            firebase.notifications().getInitialNotification().then((notification) => {
                if (notification) {
                    const action = notification.notification.data.action;
                    if (this.supportedNotifications.indexOf(action) !== -1) {
                        resolve(notification);
                    } else {
                        reject('Initial notification not supported');
                    }
                } else {
                    reject('No initial notification');
                }
            }).catch(error => {
                reject(error);
            });
        });
    };

    componentWillUnmount() {
        if (this.onTokenRefreshListener) {
            this.onTokenRefreshListener();
        }
        if (this.removeNotificationOpenedListener) {
            this.removeNotificationOpenedListener();
        }
    }

    setRef = (navigator) => {
        this.navigator = navigator;
    };

    removeInitialNotification = (notification) => {
        firebase.notifications().removeDeliveredNotification(notification.notification._notificationId);
    };

    supportedNotifications = ['fcm.VI_MANGLER', 'fcm.GOSSIP', 'fcm.ACCOUNTING'];

    render() {
        if (Platform.OS === 'ios') {
            StatusBar.setBarStyle('light-content', true);
        }
        return (
            <View style={styles.container}>
                <AppNavigation ref={this.setRef} screenProps={{
                    getInitialNotification: () => this.getInitialNotification(),
                    removeInitialNotification: (notification) => this.removeInitialNotification(notification),
                }}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    }
});