import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Button,
  TextInput,
  Text,
  Platform,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import firebase from 'firebase';
import {NavigationActions} from 'react-navigation'
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';

export default class LoginScreen extends Component {

  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false,
    };

    const user = firebase.auth().currentUser;
    if (user) {
      this._navigateAndReset();
    }
  }

  componentWillMount() {
    LocalStorage.getUser().then(user => {
      if (user) {
        this.setState({email: user.email, password: user.password});
        this._login(user.email, user.password)
      }
    }).catch(error => {
      this.setState({error: error.message})
    });
  }

  onLoginPress() {
    Keyboard.dismiss();
    const {email, password} = this.state;
    this._login(email, password);
  }

  _login(email, password) {
    this.setState({error: '', loading: true});
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((user) => {
        Database.getUser(user.uid).then(snapshot => {
          const dbUser = snapshot.val();
          if (!dbUser) {
            this._stopLoadingAndSetError('User did not exist in database');
            return;
          }
          LocalStorage.getFcmToken().then(token => {
            if (token) {
              dbUser.notificationToken = token;
              Database.updateUser(user.uid, dbUser);
            }
          }).finally(() => {
            dbUser.uid = user.uid;
            dbUser.password = password;
            this._saveUserAndNavigate(dbUser);
          });
        }).catch(error => {
          this._stopLoadingAndSetError(error)
        });
      }).catch(error => {
      this._stopLoadingAndSetError(error)
    });
  }

  _saveUserAndNavigate(dbUser) {
    LocalStorage.setUser(dbUser).then(() => {
      this.setState({error: '', loading: false});
      this._navigateAndReset();
    }).catch(error => {
      this._stopLoadingAndSetError(error);
    });
  }

  _stopLoadingAndSetError(error) {
    this.setState({error: error.message, loading: false});
  }

  _navigateAndReset() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Home'})],
    });
    this.props.navigation.dispatch(resetAction);
  }

  _renderIos() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {this._renderShared()}
      </KeyboardAvoidingView>
    );
  }

  _renderAndroid() {
    return(
      <View style={styles.container}>
        {this._renderShared()}
      </View>
    );
  }

  _renderShared() {
    return (
      <View style={styles.innerContainer}>
        <View style={styles.topContainer}>
          <Image
            style={styles.image}
            source={require('../../img/kollegianer.png')}
          />
        </View>
        <View style={styles.keyboardAvoidContainer}>
          <View style={styles.loginFormContainer}>
            <View style={styles.inputContainer}>
              <TextInput style={styles.usernameInput}
                         placeholder='Email'
                         value={this.state.email}
                         onChangeText={email => this.setState({email})}/>
              <TextInput style={styles.passwordInput}
                         secureTextEntry={true}
                         placeholder='Password'
                         value={this.state.password}
                         onChangeText={password => this.setState({password})}/>
            </View>
            <Button title='Login' onPress={() => this.onLoginPress()}/>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{this.state.error}</Text>
          </View>
        </View>
        {this.state.loading &&
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
        </View>
        }
      </View>
    );
  }

  render() {
    if (Platform.OS === 'ios') {
      return this._renderIos();
    } else {
      return this._renderAndroid();
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20
  },
  keyboardAvoidContainer: {
    flex: 1,
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
    alignItems: 'center',
  },
  loginFormContainer: {
    flex: 5,
    justifyContent: 'flex-end'
  },
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
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
    justifyContent: 'center'
  },
  image: {
    width: 200,
    height: 200,
    opacity: 0.8
  },
  usernameInput: {
    width: '100%',
    fontSize: 16,
    padding: 10,
    marginBottom: 10
  },
  passwordInput: {
    width: '100%',
    fontSize: 16,
    padding: 10,
    marginBottom: 10
  },
  errorText: {
    textAlign: 'center',
    color: 'red'
  }
});