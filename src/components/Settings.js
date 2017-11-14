import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Picker
} from 'react-native';
import UserStorage from '../storage/UserStorage';
import Database from '../storage/Database';

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
      }
    };
  }

  componentDidMount() {
    UserStorage.getUser().then(user => {
      this.setState({user});
    });
  }

  changeDuty(value) {
    let user = this.state.user;
    user.duty = value;
    this._updateUser(user);
  }

  changeKitchenweek(value) {
    let user = this.state.user;
    user.kitchenweek = value;
    this._updateUser(user);
  }

  changeSheriff(value) {
    let user = this.state.user;
    user.sheriff = value;
    this._updateUser(user);
  }

  _updateUser(user) {
    Database.updateUser(user.uid, user);
    this.setState({user});
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Navn:</Text>
          <Text style={styles.rightText}>{this.state.user.name}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Email:</Text>
          <Text style={styles.rightText}>{this.state.user.email}</Text>
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
                  mode="dialog"
                  itemStyle={styles.pickerItemStyle}>
            <Picker.Item label="Panter + filter" value="Panter + filter"/>
            <Picker.Item label="Ovnmand" value="Ovnmand"/>
            <Picker.Item label="Regnskab" value="Regnskab"/>
            <Picker.Item label="Vaskemand" value="Vaskemand"/>
            <Picker.Item label="Regnskabsmand/vaskemand" value="Regnskabsmand/vaskemand"/>
            <Picker.Item label="Formand" value="Formand"/>
            <Picker.Item label="Indkøber" value="Indkøber"/>
            <Picker.Item label="Sedler" value="Sedler"/>
            <Picker.Item label="Recycler" value="Recycler"/>
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#e3f2fd',
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
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  pickerItemStyle: {
    textAlign: 'right'
  }
});
