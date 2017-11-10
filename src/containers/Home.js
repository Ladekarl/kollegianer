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
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/køkkenuge.png')}/>
            <Text>Mathias 05</Text>
          </View>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/sheriff.png')}/>
            <Text>Kathrine</Text>
          </View>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/keep_calm_and_shots.png')}/>
            <Text>Mathias 02</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/beerpong.png')}/>
            <Text>JA</Text>
          </View>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/fox.png')}/>
            <Text>JA</Text>
          </View>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/mvp.png')}/>
            <Text>???</Text>
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
  columnContainer: {
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
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    height: 80,
    width: 80,
    margin: 10,
  },
});