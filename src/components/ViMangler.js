import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text
} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';

export default class ViManglerScreen extends Component {

  static navigationOptions = {
    title: 'Vi Mangler',
    drawerIcon: ({tintColor}) => ( <FontAwesome name="shopping-cart" size={20} style={{color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.itemContainer}>
          <View style={styles.rowContainer}>
            <Text>Hello</Text>
            <Text>Hello</Text>
          </View>
        </View>
      </ScrollView>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center'
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#b4ccff',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});