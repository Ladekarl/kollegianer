import React, {Component} from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import colors from '../shared/colors';
import {strings} from '../shared/i18n';

export default class ViManglerScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: '',
      fetching: true,
      renderItems: [],
    };

    LocalStorage.getUser().then(user => {
      this.user = user;
    });
  }

  componentDidMount() {
    Database.listenViMangler(snapshot => {
      this.items = snapshot;
      this.setState({
        renderItems: this.renderItems(),
        fetching: false,
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

  checkItem = (key, item) => {
    item.checked = !item.checked;
    Database.updateViMangler(key, item).catch(error => console.log(error));
  };

  _itemTextStyle = item => {
    return {
      flex: 6,
      alignItems: 'center',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 5,
      marginRight: 5,
      textDecorationLine: item.checked ? 'line-through' : 'none',
    };
  };

  _rowContainerStyle = item => {
    return {
      backgroundColor: item.checked ? colors.lightRedColor : colors.whiteColor,
      borderColor: colors.inactiveTabColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      marginBottom: 5,
      padding: 10,
    };
  };

  showDeleteAlert = (renderItem, item) => {
    Alert.alert(
      strings('vi_mangler.delete_modal_title') + item.item,
      strings('vi_mangler.delete_modal_text') + item.item + '?',
      [
        {
          text: strings('vi_mangler.delete_modal_cancel'),
          onPress: () => {},
        },
        {
          text: strings('vi_mangler.delete_model_ok'),
          onPress: () => this.deleteItem(renderItem),
        },
      ],
      {cancelable: false},
    );
  };

  _renderItem = renderItem => {
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
        <TouchableOpacity
          style={styles.rowImageContainer}
          onPress={() => this.checkItem(renderItem.key, item)}>
          <Icon name="shopping-basket" style={styles.rowImage} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  submitItem = () => {
    if (this.state.item) {
      const date = new Date();
      let newItem = {
        room: this.user.room,
        item: this.state.item,
        date: date.getDate() + '/' + (date.getMonth() + 1),
      };
      Database.addViMangler(newItem).catch(error => console.log(error));
      this.setState({item: ''});
    }
  };

  deleteItem = item => {
    Database.deleteViMangler(item.key).catch(error => console.log(error));
  };

  updateItems = () => {
    this.setState({fetching: true});
    Database.getViMangler()
      .then(snapshot => {
        this.items = snapshot;
        this.setState({
          renderItems: this.renderItems(),
          fetching: false,
        });
      })
      .catch(error => {
        this.setState({fetching: false});
        console.log(error);
      });
  };

  onItemChange = item => {
    this.setState({item});
  };

  render() {
    const container = [
      styles.container,
      {backgroundColor: colors.backgroundColor},
    ];

    const rowPlusImageContainer = [
      styles.rowPlusImageContainer,
      {backgroundColor: colors.backgroundColor},
    ];
    return (
      <View style={container}>
        <View style={styles.newRowContainer}>
          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.newItemInput}
              placeholder={strings('vi_mangler.description')}
              placeholderTextColor={colors.inactiveTabColor}
              underlineColorAndroid={colors.inactiveTabColor}
              selectionColor={colors.inactiveTabColor}
              value={this.state.item}
              onChangeText={this.onItemChange}
            />
          </View>
          <TouchableOpacity
            style={rowPlusImageContainer}
            onPress={this.submitItem}>
            <Icon name="plus" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.state.fetching}
              onRefresh={this.updateItems}
            />
          }>
          <View style={styles.itemContainer}>{this.state.renderItems}</View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginRight: 10,
  },
  rowPlusImageContainer: {
    height: 35,
    width: 35,
    borderRadius: 100,
    marginLeft: 5,
    marginRight: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowImageContainer: {
    height: 35,
    width: 35,
    borderRadius: 100,
    marginLeft: 5,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.whiteColor,
  },
  descriptionContainer: {
    flex: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginRight: 5,
  },
  rowImage: {
    textAlign: 'center',
    color: colors.inactiveTabColor,
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    color: colors.inactiveTabColor,
  },
});
