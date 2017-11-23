import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import Icon from 'react-native-fa-icons';
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import colors from "../shared/colors";

export default class ViManglerScreen extends Component {

  static navigationOptions = {
    title: 'Vi Mangler',
    drawerIcon: ({tintColor}) => ( <Icon name='shopping-cart' style={{fontSize: 18, color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      item: '',
      fetching: false,
      renderItems: []
    };

    LocalStorage.getUser().then(user => {
      this.user = user;
    });
  }

  componentDidMount() {
    this.setState({fetching: true});
    Database.listenViMangler(snapshot => {
      this.items = snapshot;
      this.setState({
        renderItems: this.renderItems(),
        fetching: false
      });
    }).catch(error => {
      this.setState({fetching: false});
    });
  }

  componentWillUnmount() {
    Database.unListenViManger();
  }

  renderItems() {
    let renderItems = [];
    this.items.forEach(item => {
      renderItems.push(this._renderItem(item));
    });
    return renderItems.reverse();
  }

  checkItem(key, item) {
    item.checked = !item.checked;
    Database.updateViMangler(key, item);
  }

  _itemTextStyle(item) {
    return {
      flex: 6,
      alignItems: 'center',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 5,
      marginRight: 5,
      textDecorationLine: (item.checked ? 'line-through' : 'none'),

    }
  }

  _rowContainerStyle(item) {
    return {
      borderWidth: 5,
      borderColor: (item.checked ? colors.redColor : colors.blueColor),
      flexDirection: 'row',
      marginLeft: 5,
      marginRight: 5,
      marginBottom: 7,
      padding: 5,
      borderRadius: 0
    }
  }

  showDeleteAlert(renderItem, item) {
    Alert.alert(
      'Slet ' + item.item,
      'Er du nu helt sikker på at du vil slette ' + item.item + '?',
      [
        {
          text: 'Annullér', onPress: () => {
        }
        },
        {text: 'Slet', onPress: () => this.deleteItem(renderItem)},
      ],
      {cancelable: false}
    );
  }

  _renderItem(renderItem) {
    const item = renderItem.val();
    return (
      <TouchableOpacity
        key={renderItem.key}
        style={this._rowContainerStyle(item)}
        onLongPress={() => this.showDeleteAlert(renderItem, item)}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.roomItemText}>{item.room}</Text>
          <Text style={this._itemTextStyle(item)}>{item.item}</Text>
          <Text style={styles.dateItemText}>{item.date}</Text>
        </View>
        <TouchableOpacity style={styles.rowImageContainer} onPress={() => this.checkItem(renderItem.key, item)}>
          <Text style={{margin: 10, fontSize: 15, textAlign: 'left'}}>
            <Icon name='shopping-basket' style={styles.rowImage}/>
          </Text>
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
        date: date.getDate() + '/' + (date.getMonth() + 1),
      };
      Database.addViMangler(newItem);
      this.setState({item: ''});
    }
  }

  deleteItem(item) {
    Database.deleteViMangler(item.key);
  }

  updateItems() {
    this.setState({fetching: true});
    Database.getViMangler().then((snapshot) => {
      this.items = snapshot;
      this.setState({
        renderItems: this.renderItems(),
        fetching: false
      });
    }).catch((error) => {
      this.setState({fetching: false});
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.newRowContainer}>
          <View style={styles.descriptionContainer}>
            <TextInput style={styles.newItemInput} placeholder='Beskrivelse' value={this.state.item}
                       onChangeText={(item) => this.setState({item})}/>
          </View>
          <TouchableOpacity style={styles.rowImageContainer} onPress={() => this.submitItem()}>
            <Icon name='plus-circle' style={{fontSize: 20, color: 'black'}}/>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.fetching}
                        onRefresh={() => this.updateItems()}
                      />
                    }>
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
    backgroundColor: colors.backgroundColor,
  },
  scrollContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  itemContainer: {
    width: '100%',
    justifyContent: 'space-between',
  },
  newRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10
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
    flex: 2,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  dateItemText: {
    flex: 2,
    marginLeft: 2,
    marginRight: 2,
    alignSelf: 'center',
    justifyContent: 'center',
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