import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import UserStorage from '../storage/UserStorage';
import Database from '../storage/Database';

export default class ViManglerScreen extends Component {

  static navigationOptions = {
    title: 'Vi Mangler',
    drawerIcon: ({tintColor}) => ( <FontAwesome name='shopping-cart' size={20} style={{color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  items = [];

  constructor(props) {
    super(props);
    this.state = {
      item: '',
      renderItems: []
    };

    UserStorage.getUser().then(user => {
      this.user = user;
    });
  }

  componentDidMount() {
    Database.listenViMangler(snapshot => {
      this.items = snapshot;
      this.setState({renderItems: this.renderItems()});
    }).then(snapshot => {
      this.items = snapshot;
      this.setState({renderItems: this.renderItems()});
    });
  }

  user;

  renderItems() {
    let renderItems = [];
    this.items.forEach(item => {
      renderItems.push(this._renderItem(item));
    });
    return renderItems.reverse();
  }

  itemLongPressed(item) {
    this.deleteItem(item);
  }

  checkItem(key, item) {
    item.checked = !item.checked;
    Database.updateViMangler(key, item);
  }

  _itemTextStyle(item) {
    return {
      flex: 4,
      alignItems: 'center',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 5,
      marginRight: 5,
      textDecorationLine: (item.checked ? 'line-through' : 'none')
    }
  }

  showDeleteAlert(renderItem, item) {
    Alert.alert(
      'Delete ' + item.item,
      'Do you want to delete ' + item.item,
      [
        {text: 'Cancel', onPress: () => {}},
        {text: 'OK', onPress: () => this.deleteItem(renderItem)},
      ],
      { cancelable: false }
    )
  }

  _renderItem(renderItem) {
    const item = renderItem.val();
    return (
      <TouchableOpacity
        key={renderItem.key}
        style={styles.rowContainer}
        onLongPress={() => this.showDeleteAlert(renderItem, item)}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.roomItemText}>{item.room}</Text>
          <Text style={this._itemTextStyle(item)}>{item.item}</Text>
          <Text style={styles.dateItemText}>{item.date}</Text>
        </View>
        <TouchableOpacity style={styles.rowImageContainer} onPress={() => this.checkItem(renderItem.key, item)}>
          <FontAwesome name='remove' size={20} style={styles.rowImage}/>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  submitItem() {
    if (this.state.item) {
      const date = new Date();
      let newItem = {
        room: this.user.room,
        item: this.state.item,
        date: date.getDate() + '/' + date.getMonth(),
      };
      Database.addViMangler(newItem);
    }
  }

  deleteItem(item) {
    Database.deleteViMangler(item.key);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.newRowContainer}>
          <View style={styles.descriptionContainer}>
            <TextInput style={styles.newItemInput} placeholder='Beskrivelse' value={this.state.item}
                       placeholderTextColor='#a9a9a9'
                       onChangeText={(item) => this.setState({item})}/>
          </View>
          <TouchableOpacity style={styles.rowImageContainer} onPress={() => this.submitItem()}>
            <FontAwesome name='plus-circle' size={20} style={styles.rowImage}/>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.itemContainer}>
            {this.state.renderItems}
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