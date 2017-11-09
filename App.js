import React, {Component} from 'react';
import Login from './src/Login';
import firebase from 'firebase';
import {
  FIREBASE_API_KEY,
  FIREBASE_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBAE_MESSAGE_SENDER_ID
} from 'react-native-dotenv';

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
      <Login/>
    );
  }
}
