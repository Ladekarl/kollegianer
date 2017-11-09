import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Button,
  TextInput,
  Text,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import firebase from 'firebase';

export default class LoginScreen extends Component {

  static navigationOptions = {
    title: 'Login',
    headerTitleStyle: {
      fontSize: 18
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false,
    }
  }

  onLoginPress() {
    Keyboard.dismiss();
    this.setState({error: '', loading: true});
    const {email, password} = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({error: '', loading: false});
        this.props.navigation.navigate('Home');
      })
      .catch((error) => {
        this.setState({error: error.message, loading: false});
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image
            style={styles.image}
            source={require('../../img/gylden_dame.jpg')}
          />
        </View>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidContainer}>
          <View style={styles.loginFormContainer}>
            <View style={styles.inputContainer}>
              <TextInput style={styles.usernameInput}
                         placeholder="Username"
                         onChangeText={email => this.setState({email})}/>
              <TextInput style={styles.passwordInput}
                         secureTextEntry={true}
                         placeholder="Password"
                         onChangeText={password => this.setState({password})}/>
            </View>
            <Button title="Login" onPress={() => this.onLoginPress()}/>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{this.state.error}</Text>
          </View>
        </KeyboardAvoidingView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} style={this.state.loading ? {opacity: 1} : {opacity: 0}} size='large'/>
        </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
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
    width: 100,
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