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
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.itemContainer}>
            <Text>øl</Text>
          </View>
          <View style={styles.itemContainer}>
            <Text>øl</Text>
          </View>
        </ScrollView>
      </View>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});