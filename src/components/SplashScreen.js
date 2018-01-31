import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import LocalStorage from '../storage/LocalStorage';
import colors from '../shared/colors';
import FitImage from 'react-native-fit-image';
import Drawer from '../navigation/Drawer';
import {NavigationActions} from 'react-navigation';
import firebase from 'firebase';

export default class SplashScreen extends Component {

  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    this.props.screenProps.getInitialNotification().then(() => {
      this.props.screenProps.setInitialNotification(undefined);
      LocalStorage.getUser().then(user => {
        firebase.auth().signInWithEmailAndPassword(user.email, user.password).catch(() => {
          this._navigateAndReset('Login');
        });
      });
    }).catch(() => {
      LocalStorage.getUser().then(user => {
        if (user && user.email && user.password && user.uid) {
          this._navigateAndReset('Drawer');
          firebase.auth().signInWithEmailAndPassword(user.email, user.password).catch(() => {
            this._navigateAndReset('Login');
          });
        } else {
          this._navigateAndReset('Login');
        }
      }).catch(() => {
          this._navigateAndReset('Login');
        }
      );
    });
  }

  _navigateAndReset = (routeName) => {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: routeName})],
    });
    this.props.navigation.dispatch(resetAction);
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.topContainer}>
            <FitImage
              resizeMode='contain'
              style={styles.image}
              source={require('../../img/kollegianer.png')}
            />
          </View>
        </View>
      </View>
    );
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'center',
  },
  topContainer: {
    marginTop: '10%',
    marginBottom: '20%',
    marginLeft: '10%',
    marginRight: '10%',
    position: 'absolute',
    width: '100%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
    width: undefined,
    height: undefined,
    opacity: 0.8
  }
});