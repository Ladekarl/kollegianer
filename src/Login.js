import React, {Component} from 'react';
import {StyleSheet, View, Button, TextInput, Text, ActivityIndicator, Image} from 'react-native';
import firebase from 'firebase';

export default class Login extends Component {

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
    this.setState({error: '', loading: true});
    const {email, password} = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({error: '', loading: false});
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
            source={require('../img/gylden_dame.jpg')}
          />
        </View>
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
          <Button title="Login" onPress={this.onLoginPress.bind(this)}/>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{this.state.error}</Text>
          <ActivityIndicator animating={this.state.loading} size='large'/>
        </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginLeft: 10,
    marginRight: 10,
    padding: 20
  },
  topContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50
  },
  loginFormContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%'
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