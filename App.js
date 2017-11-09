import React, {Component} from 'react';
import firebase from 'firebase';
import {
  FIREBASE_API_KEY,
  FIREBASE_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBAE_MESSAGE_SENDER_ID
} from 'react-native-dotenv';

import {
  Platform,
  View,
  StyleSheet,
} from 'react-native';

import MainNavigator from "./src/Main";

export default class App extends Component {
  componentWillMount() {
    firebase.initializeApp({
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_DOMAIN,
      databaseURL: FIREBASE_DATABASE_URL,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBAE_MESSAGE_SENDER_ID
    })
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
    paddingTop: Platform.OS === 'ios' ? 0 : Expo.Constants.statusBarHeight,
    flex: 1,
    backgroundColor: '#fff',
  }
});