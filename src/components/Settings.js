import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Picker,
  Alert,
  ScrollView
} from 'react-native';
import UserStorage from '../storage/UserStorage';
import Database from '../storage/Database';
import colors from "../shared/colors";

export default class SettingsScreen extends Component {

  static navigationOptions = {
    title: 'Indstillinger',
    headerTitleStyle: {
      fontSize: 18
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      user: {
        birthday: '',
        duty: '',
        email: '',
        kitchenweek: false,
        name: '',
        room: '',
        sheriff: false,
        uid: ''
      },
      pickerItems: []
    };
    this._getUser();
    this._getDuties();
  }

  componentDidMount() {
    Database.listenUsers(snapshot => {
      let currentSheriff = null;
      let currentKitchenWeek = null;
      snapshot.forEach(snap => {
        const user = snap.val();
        if (user.sheriff) {
          currentSheriff = user;
        }
        if (user.kitchenweek) {
          currentKitchenWeek = user;
        }
      });
      this.currentSheriff = currentSheriff;
      this.currentKitchenWeek = currentKitchenWeek;
    });
  }

  componentWillUnmount() {
    Database.unListenUsers();
  }

  changeDuty(value) {
    let user = this.state.user;
    user.duty = value;
    this._updateUser(user);
  }

  changeKitchenweek(value) {
    if (value && this.currentKitchenWeek) {
      Alert.alert(this.currentKitchenWeek.name + ' har allerede køkkenugen');
    } else {
      let user = this.state.user;
      user.kitchenweek = value;
      this._updateUser(user);
    }
  }

  changeSheriff(value) {
    if (value && this.currentSheriff) {
      Alert.alert(this.currentSheriff.name + ' har allerede køkkenugen');
    } else {
      let user = this.state.user;
      user.sheriff = value;
      this._updateUser(user);
    }
  }

  _updateUser(user) {
    this.setState({user: user});
    Database.updateUser(user.uid, user).then(() => {
      UserStorage.setUser(user);
    });
  }

  _getUser() {
    UserStorage.getUser().then(snapshot => {
      this.setState({user: snapshot});
    });
  }

  _getDuties() {
    Database.getDuties().then(snapshot => {
      this._renderPickerItems(snapshot);
    });
  }

  _renderPickerItems(snapshot) {
    let pickerItems = [];
    snapshot.forEach(child => {
      pickerItems.push(
        <Picker.Item key={child.key} label={child.val()} value={child.val()}/>
      )
    });
    this.setState({pickerItems})
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Navn:</Text>
          <Text style={styles.rightText}>{this.state.user.name}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Email:</Text>
          <Text style={styles.rightText}>{this.state.user.email}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Fødselsdato:</Text>
          <Text style={styles.rightText}>{this.state.user.birthday}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Værelse:</Text>
          <Text style={styles.rightText}>{this.state.user.room}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Tjans:</Text>
          <Picker style={styles.rightPicker}
                  onValueChange={(itemValue) => this.changeDuty(itemValue)}
                  selectedValue={this.state.user.duty}
                  mode='dialog'>
            {this.state.pickerItems}
          </Picker>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Køkkenuge:</Text>
          <Switch style={styles.rightText}
                  value={this.state.user.kitchenweek}
                  onValueChange={(value) => this.changeKitchenweek(value)}/>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Sheriff:</Text>
          <Switch style={styles.rightText}
                  value={this.state.user.sheriff}
                  onValueChange={(value) => this.changeSheriff(value)}/>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: colors.blueColor,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 7,
    padding: 15,
  },
  leftText: {
    fontWeight: 'bold',
    marginLeft: 10
  },
  rightText: {
    marginRight: 10,
  },
  rightPicker: {
    marginRight: 10,
    width: '50%',
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  }
});
