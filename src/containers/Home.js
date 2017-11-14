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
    title: 'Hjem',
    drawerIcon: ({tintColor}) => ( <FontAwesome name="home" size={20} style={{color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.textHeader}>Velkommen til Køkken1700 </Text>
            <Image style={styles.image} source={require('../../img/baggrund_guld.png')}/>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/køkkenuge.png')}/>
            <Text style={styles.text}>Ida</Text>
          </View>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/sheriff.png')}/>
            <Text style={styles.text}>Niels</Text>
          </View>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/mvp.png')}/>
            <Text style={styles.text}>Niels igen</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/keep_calm_and_shots.png')}/>
            <Text style={styles.text}>Sondrup Larsen</Text>
          </View>
          <View style={styles.columnContainer}>
            <Text style={styles.text}>Beer pong?</Text>
            <Image style={styles.image} source={require('../../img/beerpong.png')}/>
            <Text style={styles.text}>Nah fam</Text>
          </View>
          <View style={styles.columnContainer}>
            <Text style={styles.text}>Har vi ræv?</Text>
            <Image style={styles.image} source={require('../../img/fox.png')}/>
            <Text style={styles.text}>ofc</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Text style={styles.text}>Ølregnskab</Text>
            <Image style={styles.image} source={require('../../img/olregnskab.png')}/>
          </View>
          <View style={styles.columnContainer}>
            <Text style={styles.text}>VIP club</Text>
            <Image style={styles.image} source={require('../../img/vip_logo2.png')}/>
          </View>
          <View style={styles.columnContainer}>
            <Text style={styles.text}>Gossip club</Text>
            <Image style={styles.image} source={require('../../img/gossip_icon.png')}/>
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
    alignItems: 'flex-start'
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
    padding: 5
  },
  headerContainer: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 10,
    padding: 5
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 1
  },
  image: {
    height: 60,
    width: 60,
    margin: 10,
  },
  image: {
    height: 60,
    width: 60,
    margin: 10,
  },
  text: {
    textAlign: 'center'
  },
  textHeader: {
    textAlign: 'center',
    fontWeight: 'bold'
  }
});