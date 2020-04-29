import React, {Component} from 'react';

import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import {StackActions} from '@react-navigation/stack';
import {CommonActions} from '@react-navigation/native';

import LocalStorage from '../storage/LocalStorage';
import * as NavigationHelpers from '../shared/NavigationHelpers';

export default class LogoutScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: '',
    };
  }

  componentDidMount = () => {
    const user = auth().currentUser;
    if (user) {
      this._logoutAndRedirect();
    } else {
      this._redirectToLogin();
    }
  };

  _logoutAndRedirect = () => {
    this.setState({loading: true});
    auth()
      .signOut()
      .then(() => {
        LocalStorage.removeUser()
          .then(() => {
            this.setState({error: '', loading: false});
            this._redirectToLogin();
          })
          .catch(error => {
            this.setState({error: error.message, loading: false});
          });
      })
      .catch(error => {
        this.setState({error: error.message, loading: false});
      });
  };

  _redirectToLogin = () => {
    NavigationHelpers.navigateAndReset(
      this.props.navigation,
      'loginFlow',
      true,
      'Login',
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.error}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            animating={true}
            style={this.state.loading ? {opacity: 1} : {opacity: 0}}
            size="large"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
