import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';

export default class ViManglerScreen extends Component {

  static navigationOptions = {
    title: 'Vi Mangler',
    drawerIcon: ({tintColor}) => ( <FontAwesome name='shopping-cart' size={20} style={{color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  items = [
    {
      id: 1,
      room: '1709',
      value: 'value1',
      date: 'date1'
    },
    {
      id: 2,
      room: '1709',
      value: 'value2',
      date: 'date3'
    },
    {
      id: 3,
      room: '1709',
      value: 'value3',
      date: 'date3'
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }

  renderItems() {
    let renderItems = [];
    // TODO get from server
    this.items.forEach(item => {
      renderItems.push(this._renderItem(item));
    });
    return renderItems.reverse();
  }

  _renderItem(item) {
    return (
      <View key={item.id} style={styles.rowContainer}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.roomItemText}>{item.room}</Text>
          <Text style={styles.itemText}>{item.value}</Text>
          <Text style={styles.dateItemText}>{item.date}</Text>
        </View>
        <TouchableOpacity style={styles.rowImageContainer} onPress={() => this.deleteItem(item)}>
          <FontAwesome name='remove' size={20} style={styles.rowImage}/>
        </TouchableOpacity>
      </View>
    );
  }

  submitItem() {
    // TODO Add to server
    if (this.state.value) {
      const date = new Date();
      this.items.push({
        id: this.items.length + 1,
        room: '1712',
        value: this.state.value,
        date: date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear(),
      });
      this.forceUpdate();
    }
  }

  deleteItem(item) {
    // TODO delete from server
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
    this.forceUpdate();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.newRowContainer}>
          <View style={styles.descriptionContainer}>
            <TextInput style={styles.newItemInput} placeholder='Beskrivelse' value={this.state.value}
                       placeholderTextColor='#a9a9a9'
                       onChangeText={(value) => this.setState({value})}/>
          </View>
          <TouchableOpacity style={styles.rowImageContainer} onPress={() => this.submitItem()}>
            <FontAwesome name='plus-circle' size={20} style={styles.rowImage}/>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.itemContainer}>
            {this.renderItems()}
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
  },
  scrollContainer: {
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  itemContainer: {
    width: '100%',
    justifyContent: 'space-between',
  },
  rowContainer: {
    backgroundColor: '#e3f2fd',
    flexDirection: 'row',
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 7,
    padding: 5,
    borderRadius: 0,
    elevation: 1
  },
  newRowContainer: {
    backgroundColor: '#f9fbe7',
    opacity: 0.7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 0.2,
    marginBottom: 5
  },
  rowImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  descriptionContainer: {
    flex: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemText: {
    flex: 4,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5
  },
  roomItemText: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  dateItemText: {
    flex: 3,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  newItemInput: {
    flex: 1,
    height: 40,
    textAlign: 'center',
    marginLeft: 5,
    marginRight: 5
  },
  rowImage: {
    textAlign: 'center',
    color: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  }
});