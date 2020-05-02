import React, {Component} from 'react';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import LocalStorage from './storage/LocalStorage';
import Database from './storage/Database';
import colors from './shared/colors';
import AppNavigation from './navigation/AppNavigation';
import {NavigationContainer} from '@react-navigation/native';
import {
  navigateAndReset,
  navigateOnNotification,
} from './shared/NavigationHelpers';
import {signIn} from './shared/AuthenticationHelpers';

const handledNotifications = [];

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    messaging()
      .hasPermission()
      .then(enabled => {
        if (!enabled) {
          return messaging().requestPermission();
        }
      })
      .then(() => {
        this.registerNotificationHandlers();
        this.registerTokenRefreshListener();
        return messaging()
          .getToken()
          .then(token => {
            if (token) {
              const newToken = {token: token, isIos: Platform.OS === 'ios'};
              return LocalStorage.setFcmToken(newToken);
            }
          });
      })
      .catch(this.onErrorTrySignIn);
  }

  supportedNotifications = ['fcm.VI_MANGLER', 'fcm.GOSSIP', 'fcm.ACCOUNTING'];

  getInitialNotification = () => {
    return new Promise((resolve, reject) => {
      messaging()
        .getInitialNotification()
        .then(notification => {
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
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  registerNotificationHandlers = () => {
    this.getInitialNotification()
      .then(this.openedOnNotification)
      .catch(this.onErrorTrySignIn);

    this.removeNotificationOpenedListener = messaging().onNotificationOpenedApp(
      this.openedOnNotification,
    );
  };

  openedOnNotification = notification => {
    console.log('Launched from notification');
    if (
      notification &&
      handledNotifications.indexOf(
        notification.notification._notificationId,
      ) === -1
    ) {
      signIn()
        .then(() => {
          navigateOnNotification(this.navigator, notification.notification);
        })
        .catch(error => {
          console.log(error);
          navigateAndReset(this.navigator, 'Login');
        })
        .finally(() => {
          this.removeInitialNotification(
            notification.notification._notificationId,
          );
        });
    }
  };

  onErrorTrySignIn = error => {
    console.log(error);
    return signIn()
      .then(() => {
        navigateAndReset(this.navigator, 'mainFlow');
      })
      .catch(catchError => {
        console.log(catchError);
        navigateAndReset(this.navigator, 'Login');
      });
  };

  registerTokenRefreshListener = () => {
    this.removeTokenRefreshListener = messaging().onTokenRefresh(token => {
      const user = auth().currentUser;
      if (user && token) {
        const newToken = {token: token, isIos: Platform.OS === 'ios'};
        LocalStorage.setFcmToken(newToken).catch(error => console.log(error));
        Database.getNotificationTokens(user.uid)
          .then(snapshot => {
            let tokens = snapshot.val();
            let tokenFound = false;
            tokens.forEach(t => {
              if (
                String(t.token).valueOf() === String(newToken.token).valueOf()
              ) {
                tokenFound = true;
              }
            });
            if (!tokenFound) {
              tokens.push(newToken);
              Database.updateNotificationTokens(user.uid, tokens).catch(error =>
                console.log(error),
              );
            }
          })
          .catch(error => console.log(error));
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

  setRef = navigator => {
    this.navigator = navigator;
  };

  render() {
    StatusBar.setBarStyle('light-content', true);

    const KollegianerTheme = {
      dark: true,
      colors: {
        primary: colors.activeTabColor,
        background: colors.inactiveTabColor,
        card: colors.backgroundColor,
        text: colors.backgroundColor,
        border: colors.inactiveTabColor,
      },
    };

    return (
      <View style={styles.container}>
        <NavigationContainer theme={KollegianerTheme} ref={this.setRef}>
          <AppNavigation />
        </NavigationContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
});
