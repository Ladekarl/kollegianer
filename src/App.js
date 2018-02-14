import React, {Component} from 'react';
import firebase from 'firebase';
import {
  FIREBASE_API_KEY,
  FIREBASE_DATABASE_URL,
  FIREBASE_DOMAIN,
  FIREBASE_MESSAGE_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET
} from 'react-native-dotenv';
import {Alert, Platform, StyleSheet, Text, View} from 'react-native';
import Stack from './navigation/Stack';
import LocalStorage from './storage/LocalStorage'
import Database from './storage/Database';
import {NavigationActions} from 'react-navigation';
import colors from './shared/colors';
import FCM, {
  FCMEvent,
  NotificationType,
  RemoteNotificationResult,
  WillPresentNotificationResult
} from 'react-native-fcm';
import {navigateTo} from './containers/Home';

let initialNotification;

FCM.on(FCMEvent.Notification, async (notif) => {
  if (notif.local_notification) {
  }
  if (notif.opened_from_tray) {
    initialNotification = notif;
  }

  if (Platform.OS === 'ios') {
    switch (notif._notificationType) {
      case NotificationType.Remote:
        notif.finish(RemoteNotificationResult.NewData);
        break;
      case NotificationType.NotificationResponse:
        notif.finish();
        break;
      case NotificationType.WillPresent:
        notif.finish(WillPresentNotificationResult.All);
        break;
    }
  }
});

FCM.on(FCMEvent.RefreshToken, (token) => {
  const user = firebase.auth().currentUser;
  LocalStorage.setFcmToken(token);
  if (user && token) {
    Database.getNotificationTokens(user.uid).then(snapshot => {
      let tokens = snapshot.val();
      if (tokens.indexOf(token) === -1) {
        tokens.push(token);
        Database.updateNotificationTokens(user.uid, tokens);
      }
    });
  }
});

export default class App extends Component {

  constructor(props) {
    super(props);
    Text.defaultProps.style = {fontFamily: 'Roboto'};
  }

  componentWillMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_DOMAIN,
        databaseURL: FIREBASE_DATABASE_URL,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: FIREBASE_STORAGE_BUCKET,
        messagingSenderId: FIREBASE_MESSAGE_SENDER_ID
      });
    }
  }

  componentDidMount() {
    FCM.requestPermissions()
      .catch(() => Alert.alert('Tilladelse afvist',
        'Du afviste tilladelsen. Prøv lige igen.'));

    FCM.getFCMToken().then(token => {
      if (token) {
        LocalStorage.setFcmToken(token);
      }
    });

    FCM.on(FCMEvent.Notification, async (notification) => {
      this._navigateOnNotification(notification);
      const action = (Platform.OS === 'ios' ? notification.apns.action_category : notification.fcm.action);
      switch (action) {
        case 'fcm.VI_MANGLER':
          navigateTo('ViMangler');
          break;
        case 'fcm.GOSSIP':
          navigateTo('Gossip');
          break;
      }
    });

    this.getInitialNotification().then(notification => {
      if (notification) {
        this._navigateOnNotification(notification);
      }
    });
  }

  _navigateOnNotification(notification) {
    if (Platform.OS === 'ios' && !notification.apns) {
      return;
    }
    const action = (Platform.OS === 'ios' ? notification.apns.action_category : notification.fcm.action);
    switch (action) {
      // Switch on current_action from FCM payload
      case 'fcm.VI_MANGLER':
        this.navigator.dispatch(NavigationActions.navigate({
          routeName: 'Drawer',
          // Nested navigation param
          action: NavigationActions.navigate({
            routeName: 'Home',
            params: {
              action: 'ViMangler'
            }
          })
        }));
        break;
      case 'fcm.GOSSIP':
        this.navigator.dispatch(NavigationActions.navigate({
          routeName: 'Drawer',
          // Nested navigation param
          action: NavigationActions.navigate({
            routeName: 'Home',
            params: {
              action: 'Gossip'
            }
          })
        }));
        break;
      case 'fcm.ACCOUNTING':
        this.navigator.dispatch(NavigationActions.navigate({
          routeName: 'Drawer',
          // Nested navigation param
          action: NavigationActions.navigate({
            routeName: 'Home',
            params: {
              action: 'Regnskab'
            }
          })
        }));
        break;
    }
  }

  setRef = (navigator) => {
    this.navigator = navigator;
  };

  getInitialNotification = () => {
    let resolved = false;
    return new Promise((resolve, reject) => {
      if (initialNotification) {
        const action = Platform.OS === 'ios' ? initialNotification.apns.action_category : initialNotification.fcm.action;
        if (this.supportedNotifications.indexOf(action) !== -1) {
          resolved = true;
          resolve(initialNotification);
        } else {
          reject();
        }
      } else {
        FCM.getInitialNotification().then(notification => {
          if (notification) {
            const action = Platform.OS === 'ios' ? notification.apns.action_category : notification.fcm.action;
            if (this.supportedNotifications.indexOf(action) !== -1) {
              resolved = true;
              resolve(notification);
            } else {
              reject();
            }
          } else {
            reject();
          }
        }).finally(() => {
          if (!resolved) {
            reject();
          }
        });
      }
    });
  };

  supportedNotifications = ['fcm.VI_MANGLER', 'fcm.GOSSIP', 'fcm.ACCOUNTING'];

  setInitialNotification = (notification) => {
    initialNotification = notification;
  };

  render() {
    return (
      <View style={styles.container}>
        <Stack ref={this.setRef} screenProps={{
          getInitialNotification: () => this.getInitialNotification(),
          setInitialNotification: (notification) => this.setInitialNotification(notification)
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