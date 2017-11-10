import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  CheckBox,
  TextInput
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

  constructor(props) {
    super(props);
    this.state = {
      room: '',
      value: '',
      date: ''
    }
  }

  renderItems() {
    let renderItems = [];
    // change this to use items from DB
    this.items.forEach(item => {
      renderItems.push(this._renderItem(item));
    });
    return renderItems;
  }

  items = [
    {
      id: 1,
      room: 'room1',
      value: 'value1',
      date: 'date1',
      checked: false
    },
    {
      id: 2,
      room: 'room2',
      value: 'value2',
      date: 'date3',
      checked: true
    },
    {
      id: 3,
      room: 'room3',
      value: 'value3',
      date: 'date3',
      checked: false
    },
  ];

  checkBoxClicked(id, value) {
    this.items.forEach(item => {
      if (item.id === id) {
        item.checked = value;
      }
    });
  }

  _renderItem(item) {
    return (
      <View key={item.id} style={styles.rowContainer}>
        <Text style={styles.itemText}>{item.room}</Text>
        <Text style={styles.itemText}>{item.value}</Text>
        <Text style={styles.itemText}>{item.date}</Text>
        <CheckBox value={item.checked}/>
      </View>
    );
  }

  submitItem() {
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.itemContainer}>
            {this.renderItems()}
            <View style={styles.rowContainer}>
              <TextInput style={styles.newItemInput} placeholder="Værelse"
                         placeholderTextColor="#a9a9a9"
                         value={this.state.room}
                         onChangeText={(room) => this.setState({room})}/>
              <TextInput style={styles.newItemInput} placeholder="Ting" value={this.state.value}
                         placeholderTextColor="#a9a9a9"
                         onChangeText={(value) => this.setState({value})}/>
              <TextInput style={styles.newItemInput} placeholder="Dato" value={this.state.date}
                         placeholderTextColor="#a9a9a9"
                         onChangeText={(date) => this.setState({date})}/>
              <TouchableOpacity style={styles.newItemImage} onPress={() => this.submitItem()}>
                <FontAwesome name="plus-circle" size={20} style={{color: 'black'}}/>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    height: '100%',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    width: '100%',
    alignItems: 'center'
  },
  itemContainer: {
    width: '100%',
    justifyContent: 'space-between',
  },
  rowContainer: {
    backgroundColor: '#eeeeee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 2,
    borderRadius: 1,
    elevation: 1
  },
  itemText: {
    margin: 5,
    textAlign: 'center'
  },
  newItemInput: {
    height: 40,
    marginLeft: 5,
    marginRight: 5,
    width: '25%'
  },
  newItemImage: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
});