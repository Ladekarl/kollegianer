// @flow
import React, {Component} from 'react';
import firebase from 'react-native-firebase';
import {Alert, Platform, StyleSheet, View, StatusBar} from 'react-native';
import LocalStorage from './storage/LocalStorage'
import Database from './storage/Database';
import {NavigationActions} from 'react-navigation';
import colors from './shared/colors';
import {navigateTo} from './containers/Home';
import {
    setCustomActivityIndicator,
    setCustomText,
    setCustomTextInput,
    setCustomTouchableOpacity,
} from 'react-native-global-props';
import AppNavigation from './navigation/AppNavigation';
import type { RemoteMessage, NotificationOpen } from 'react-native-firebase';
export default class App extends Component {

    constructor(props) {
        super(props);

        const customTextProps = {
            style: {
                fontFamily: 'Lato'
            }
        };
        const customTouchableOpacityProps = {
            hitSlop: {top: 15, right: 15, left: 15, bottom: 15}
        };
        const customActivityIndicator = {
            color: colors.inactiveTabColor
        };

        setCustomText(customTextProps);
        setCustomTouchableOpacity(customTouchableOpacityProps);
        setCustomActivityIndicator(customActivityIndicator);
        setCustomTextInput(customTextProps);
    }

    componentDidMount() {
        firebase.messaging().hasPermission().then(enabled => {
            if (enabled) {
                this.registerMessageListener();
            } else {
                firebase.messaging().requestPermission()
                    .then(() => {
                        this.registerMessageListener();
                    })
                    .catch(() => Alert.alert('Tilladelse afvist',
                        'Du afviste tilladelsen. Prøv lige igen.'));
            }
        });

        firebase.messaging().getToken().then(token => {
            if (token) {
                const newToken = {token: token, isIos: Platform.OS === 'ios'};
                LocalStorage.setFcmToken(newToken).catch(error => console.log(error));
            }
        }).catch(error => console.log(error));

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

        this.getInitialNotification().then(notification => {
            if (notification) {
                this._navigateOnNotification(notification);
            }
        }).catch(error => console.log(error));
    }

    getInitialNotification = () => {
        return new Promise((resolve, reject) => {
            firebase.messaging().getInitialNotification().then((notification: NotificationOpen) => {
                if (notification) {
                    const action = notification.action;
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
        if(this.messageListener) {
            this.messageListener();
        }
        if(this.onTokenRefreshListener) {
            this.onTokenRefreshListener();
        }
    }

    registerMessageListener = () => {
        this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
            this._navigateOnNotification(notification);
            const action = (Platform.OS === 'ios' ? notification.apns.action_category : notification.fcm.action);
            switch (action) {
                case 'fcm.VI_MANGLER':
                    navigateTo('ViMangler');
                    break;
                case 'fcm.GOSSIP':
                    navigateTo('Gossip');
                    break;
                case 'fcm.ACCOUNTING':
                    navigateTo('Regnskab');
                    break;
            }
        });
    };

    _navigateOnNotification(notification: NotificationOpen) {
        const action = notification.action;
        switch (action) {
            // Switch on current_action from FCM payload
            case 'fcm.VI_MANGLER':
                this._navigate('Home', 'ViMangler');
                break;
            case 'fcm.GOSSIP':
                this._navigate('Home', 'Gossip');
                break;
            case 'fcm.ACCOUNTING':
                this._navigate('Home', 'Regnskab');
                break;
        }
    }

    _navigate = (firstRouteName, secondRouteName) => {
        this.navigator.dispatch(NavigationActions.navigate({
            routeName: firstRouteName,
            params: {
                action: secondRouteName
            }
        }));
    };

    setRef = (navigator) => {
        this.navigator = navigator;
    };

    supportedNotifications = ['fcm.VI_MANGLER', 'fcm.GOSSIP', 'fcm.ACCOUNTING'];

    render() {
        if(Platform.OS === 'ios') {
            StatusBar.setBarStyle('light-content', true);
        }
        return (
            <View style={styles.container}>
                <AppNavigation ref={this.setRef} screenProps={{
                    getInitialNotification: () => this.getInitialNotification(),
                    setInitialNotification: (notification) => this.setInitialNotification(notification),
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