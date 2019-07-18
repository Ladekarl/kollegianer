import React, {Component} from 'react';
import firebase from 'react-native-firebase';
import {Alert, Platform, StatusBar, StyleSheet, View} from 'react-native';
import LocalStorage from './storage/LocalStorage';
import Database from './storage/Database';
import colors from './shared/colors';
import AppNavigation from './navigation/AppNavigation';
import {navigateAndReset, navigateOnNotification} from './shared/NavigationHelpers';
import {signIn} from './shared/AuthenticationHelpers';

const handledNotifications = [];

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
            this.registerNotificationHandlers();
            this.registerTokenRefreshListener();
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

    supportedNotifications = ['fcm.VI_MANGLER', 'fcm.GOSSIP', 'fcm.ACCOUNTING'];

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

    registerNotificationHandlers = () => {
        this.getInitialNotification()
            .then(this.openedOnNotification)
            .catch(this.onNotificationError);

        this.removeNotificationOpenedListener = firebase.notifications()
            .onNotificationOpened(this.openedOnNotification);
    };

    openedOnNotification = notification => {
        console.log('Launched from notification');
        if (notification && handledNotifications.indexOf(notification.notification._notificationId) === -1) {
            signIn().then(() => {
                navigateOnNotification(this.navigator, notification.notification);
            }).catch(error => {
                console.log(error);
                navigateAndReset(this.navigator, 'Login');
            }).finally(() => {
                this.removeInitialNotification(notification);
            });
        }
    };

    removeInitialNotification = (notification) => {
        const notificationId = notification.notification._notificationId;
        firebase.notifications().cancelNotification(notificationId);
        firebase.notifications().removeDeliveredNotification(notificationId);
        handledNotifications.push(notificationId);
    };

    onNotificationError = error => {
        console.log(error);
        signIn().then(() => {
            navigateAndReset(this.navigator, 'mainFlow', true);
        }).catch((error) => {
                console.log(error);
                navigateAndReset(this.navigator, 'Login');
            }
        );
    };

    registerTokenRefreshListener = () => {
        this.removeTokenRefreshListener = firebase.messaging().onTokenRefresh(token => {
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

    componentWillUnmount() {
        if (this.removeTokenRefreshListener) {
            this.removeTokenRefreshListener();
        }
        if (this.removeNotificationOpenedListener) {
            this.removeNotificationOpenedListener();
        }
    }

    setRef = (navigator) => {
        this.navigator = navigator;
    };

    render() {
        if (Platform.OS === 'ios') {
            StatusBar.setBarStyle('light-content', true);
        }

        return (
            <View style={styles.container}>
                <AppNavigation ref={this.setRef}/>
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