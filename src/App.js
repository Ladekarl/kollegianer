import React, {Component} from 'react';
import firebase from 'firebase';
import {
  FIREBASE_API_KEY,
  FIREBASE_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGE_SENDER_ID
} from 'react-native-dotenv';
import {
  Platform,
  Alert,
  View,
  StyleSheet,
  AppState
} from 'react-native';
import MainNavigator from './navigation/MainNavigator';
import LocalStorage from './storage/LocalStorage'
import Database from './storage/Database';
import {NavigationActions} from 'react-navigation'
import FCM, {
  FCMEvent,
  RemoteNotificationResult, WillPresentNotificationResult, NotificationType
} from 'react-native-fcm';

let initialNotification;
let openedFromTray = false;

FCM.on(FCMEvent.Notification, async (notif) => {
  if (notif.local_notification) {
  }
  if (notif.opened_from_tray) {
    openedFromTray = true;
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
    Database.updateNotificationToken(user.uid);
  }
});

export default class App extends Component {

  state = {
    appState: AppState.currentState
  };

  componentWillMount() {
    firebase.initializeApp({
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_DOMAIN,
      databaseURL: FIREBASE_DATABASE_URL,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGE_SENDER_ID
    })
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    FCM.requestPermissions()
      .catch(() => Alert.alert('Tilladelse afvist',
        'Du afviste tilladelsen. Du er da smart hva. Prøv lige igen.'));

    FCM.getFCMToken().then(token => {
      if (token) {
        LocalStorage.setFcmToken(token);
      }
    });

    if (openedFromTray) {
      this._openedFromTray();
    }

    // Not always triggered. Only if Android killed background activity and boots up from notification click.
    FCM.getInitialNotification().then(notif => {
      initialNotification = notif;
      this._openedFromTray();
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    // Check if app was opened by clicking notification
    if (this.state.appState.match(/inactive|background/)
      && nextAppState === 'active'
      && openedFromTray) {
      this._openedFromTray();
    }
    this.setState({appState: nextAppState});
  };

  _openedFromTray() {
    openedFromTray = false;
    this._navigateOnInitialNotification(initialNotification);
  };

  _navigateOnInitialNotification(notification) {
    const action = (Platform.OS === 'ios' ? notification.apns.action_category : notification.fcm.action);
    const user = firebase.auth().currentUser;
    if (!user) {
      return;
    }
    switch (action) {
      // Switch on current_action from FCM payload
      case 'fcm.VI_MANGLER': {
        const navigateAction = NavigationActions.navigate({
          routeName: 'Home',
          // Nested navigation param
          action: NavigationActions.navigate({routeName: 'ViMangler'})
        });
        this.props.navigation.dispatch(navigateAction);
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <MainNavigator/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});