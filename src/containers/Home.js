import React, {Component} from 'react';

import {
  View,
  Image,
  StyleSheet,
  Text,
} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';

export default class HomeScreen extends Component {

  static navigationOptions = {
    title: 'Home',
    drawerIcon: ({tintColor}) => ( <FontAwesome name="home" size={20} style={{color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <View style={styles.stackContainer}>
            <Image style={styles.kokkenugeImage} source={require('../../img/køkkenuge.png')}/>
            <Text>Mathias 05</Text>
          </View>
          <View style={styles.stackContainer}>
            <Image style={styles.sheriffImage} source={require('../../img/sheriff.png')}/>
            <Text>Kathrine</Text>
          </View>
          <View style={styles.stackContainer}>
            <Image style={styles.shotsImage} source={require('../../img/keep_calm_and_shots.png')}/>
            <Text>Mathias 02</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stackContainer: {
    backgroundColor: '#eeeeee',
    borderRadius: 2,
    elevation: 2,
    alignSelf: 'flex-end',
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 10,
    padding: 10
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kokkenugeImage: {
    height: 80,
    width: 80,
    margin: 10,
  },
  sheriffImage: {
    height: 80,
    width: 80,
    margin: 10
  },
  shotsImage: {
    height: 80,
    width: 80,
    margin: 10
  }
});