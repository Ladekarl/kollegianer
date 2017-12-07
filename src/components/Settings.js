import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Button,
  Picker,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal
} from 'react-native';
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import colors from "../shared/colors";
import firebase from 'firebase';

export default class SettingsScreen extends Component {

  static navigationOptions = {
    title: 'Indstillinger',
    headerTitleStyle: {
      fontSize: 15
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
      pickerItems: [],
      selectedDuty: '',
      dutyModalVisible: false
    };
    this._getUser();
    this._getDuties();
    this.auth = firebase.auth();
  }

  componentWillMount() {
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

  changeDuty() {
    if (this.state.selectedDuty) {
      let user = this.state.user;
      user.duty = this.state.selectedDuty;
      this._updateUser(user);
    }
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
      Alert.alert(this.currentSheriff.name + ' er allerede sheriff');
    } else {
      let user = this.state.user;
      user.sheriff = value;
      this._updateUser(user);
    }
  }

  _updateUser(user) {
    this.setState({user: user});
    Database.updateUser(user.uid, user).then(() => {
      LocalStorage.setUser(user);
    });
  }

  _getUser() {
    LocalStorage.getUser().then(user => {
      Database.getUser(user.uid).then(snapshot => {
        this.setState({user: snapshot.val()});
        this.forceUpdate();
      });
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

  setDutyModalVisible(visible) {
    this.setState({selectedDuty: this.state.user.duty, dutyModalVisible: visible});
  }

  changePasswordAlert() {
    Alert.alert('Er du sikker?',
      'Du vil modtage en mail på ' + this.state.user.email,
      [
        {text: 'Annullér', onPress: () => {}},
        {text: 'OK', onPress: () => this._changePassword()},
      ])
  }

  _changePassword() {
    this.auth.sendPasswordResetEmail(this.state.user.email);
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
          <TouchableOpacity style={styles.rightText} onPress={() => {this.setDutyModalVisible(true)}}>
            <Text>{this.state.user.duty}</Text>
          </TouchableOpacity>
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
        <View style={styles.changePasswordRowContainer}>
          <Button title='Skift Adgangskode'
                  color={colors.logoutTextColor}
                  onPress={() => this.changePasswordAlert()} />
        </View>
        <Modal
          animationType='fade'
          transparent={true}
          onRequestClose={() => {
          }}
          visible={this.state.dutyModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalPickerContainer}>
              <Text>Vælg en tjans</Text>
              <Picker onValueChange={(itemValue) => this.setState({selectedDuty: itemValue})}
                      selectedValue={this.state.selectedDuty}
                      mode='dialog'>
                {this.state.pickerItems}
              </Picker>
              <View style={styles.modalPickerRowContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => this.setDutyModalVisible(false)}>
                  <Text>Annullér</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    this.changeDuty();
                    this.setDutyModalVisible(false);
                  }}>
                  <Text>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    borderColor: colors.overviewIconColor,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 7,
    padding: 15,
  },
  changePasswordRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    borderColor: colors.overviewIconColor,
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
  modalContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPickerContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 5,
    opacity: 1,
    backgroundColor: colors.modalBackgroundColor
  },
  modalPickerRowContainer: {
    flexDirection: 'row',
    margin: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  modalButton: {
    marginLeft: 40
  }
});
