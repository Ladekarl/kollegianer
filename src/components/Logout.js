import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import firebase from 'firebase';
import {NavigationActions} from 'react-navigation'
import {FontAwesome} from '@expo/vector-icons';
import {removeUser} from '../storage/UserStorage';

export default class LogoutScreen extends Component {

  static navigationOptions = {
    title: 'Logout',
    drawerLabel: 'Logout',
    drawerIcon: ({tintColor}) => ( <FontAwesome name="sign-out" size={20} style={{color: '#dd1d00'}}/>),
    headerTitleStyle: {
      fontSize: 18
    },
    labelStyle: {
      color: '#dd1d00'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: '',
    };
  }

  componentWillMount() {
    const user = firebase.auth().currentUser;
    if (user) {
      this._logoutAndRedirect();
    } else {
      this._redirectToLogin();
    }
  }

  _logoutAndRedirect() {
    this.setState({loading: true});
    firebase.auth().signOut()
      .then(() => {
        removeUser().then(() => {
          this.setState({error: '', loading: false});
          this._redirectToLogin();
        }).catch((error) => {
          this.setState({error: error.message, loading: false});
        });
      })
      .catch((error) => {
        this.setState({error: error.message, loading: false});
      });
  }

  _redirectToLogin() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Login'})],
    });
    this.props.navigation.dispatch(resetAction);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.error}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} style={this.state.loading ? {opacity: 1} : {opacity: 0}} size='large'/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});