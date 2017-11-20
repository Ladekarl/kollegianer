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
} from 'react-native';
import MainNavigator from './navigation/MainNavigator';
import LocalStorage from './storage/LocalStorage';
import FCM, {
  FCMEvent,
  RemoteNotificationResult, WillPresentNotificationResult, NotificationType
} from 'react-native-fcm';

// this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
FCM.on(FCMEvent.Notification, async (notif) => {
  // there are two parts of notif.
  // notif.notification contains the notification payload, notif.data contains data payload
  if (notif.local_notification) {
    //this is a local notification
  }
  if (notif.opened_from_tray) {
    //iOS: app is open/resumed because user clicked banner
    //Android: app is open/resumed because user clicked banner or tapped app icon
  }
  // await someAsyncCall();

  if (Platform.OS === 'ios') {
    // optional
    // iOS requires developers to call completionHandler to end notification process.
    // If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
    //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
    //notif._notificationType is available for iOS platfrom
    switch (notif._notificationType) {
      case NotificationType.Remote:
        notif.finish(RemoteNotificationResult.NewData); //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
        break;
      case NotificationType.NotificationResponse:
        notif.finish();
        break;
      case NotificationType.WillPresent:
        notif.finish(WillPresentNotificationResult.All); //other types available: WillPresentNotificationResult.None
        break;
    }
  }
});
FCM.on(FCMEvent.RefreshToken, (token) => {
  if (token) {
    LocalStorage.setFcmToken(token);
  }
});

export default class App extends Component {
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
    // iOS: show permission prompt for the first call. Later just check permission in user settings
    // Android: check permission in user settings
    FCM.requestPermissions()
      .catch(() => Alert.alert('Tilladelse afvist',
        'Du afviste tilladelsen. Du er da smart hva. Prøv lige igen.'));

    FCM.getFCMToken().then(token => {
      if (token) {
        LocalStorage.setFcmToken(token);
      }
    });

    // initial notification contains the notification that launches the app. If user launches app by clicking banner, the banner notification info will be here rather than through FCM.on event
    // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
    // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
    FCM.getInitialNotification().then(notif => {
      // If this is a ViMangler notification, navigate to ViMangler screen
    });
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