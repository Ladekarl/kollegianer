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
import ModalScreen from './Modal';

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
        name: '',
        birthday: '',
        duty: '',
        email: '',
        kitchenweek: false,
        room: '',
        sheriff: false,
        uid: ''
      },
      dutyPickerItems: [],
      userPickerItems: [],
      selectedDuty: '',
      selectedKitchenWeek: '',
      selectedSheriff: '',
      dutyModalVisible: false,
      kitchenWeekModalVisible: false,
      sheriffModalVisible: false
    };
    this._getUser();
    this._getDuties();
    this.auth = firebase.auth();
  }

  componentDidMount() {
    Database.listenUsers(snapshot => {
      this.users = snapshot;
      snapshot.forEach(snap => {
        const user = snap.val();
        if (user.sheriff) {
          this.currentSheriff = snap;
        }
        if (user.kitchenweek) {
          this.currentKitchenWeek = snap;
        }
      });
      this._renderUserPickerItems(snapshot);
    });
  }

  componentWillUnmount() {
    Database.unListenUsers();
  }

  changeDuty = () => {
    if (this.state.selectedDuty) {
      let user = this.state.user;
      user.duty = this.state.selectedDuty;
      this._updateUser(user, this.localUser.uid, true);
    }
  };

  switchKitchenWeek = (value) => {
    if (this.currentKitchenWeek) {
      if (value && this.localUser.uid !== this.currentKitchenWeek.key) {
        Alert.alert(this.currentKitchenWeek.val().name + ' har allerede køkkenugen');
      } else if (!value && this.localUser.uid === this.currentKitchenWeek.key) {
        this.setKitchenWeekModalVisible(true);
      }
    }
  };

  switchSheriff = (value) => {
    if (this.currentSheriff) {
      if (value && this.localUser.uid !== this.currentSheriff.key) {
        Alert.alert(this.currentSheriff.val().name + ' er allerede sheriff');
      } else if (!value && this.localUser.uid === this.currentSheriff.key) {
        this.setSheriffModalVisible(true);
      }
    }
  };

  changeKitchenWeek = () => {
    if (this.state.user) {
      let user = this.state.user;
      user.kitchenweek = false;
      let newKitchenWeekSnapshot = this._findSnapshotByName(this.state.selectedKitchenWeek);
      if (newKitchenWeekSnapshot) {
        let newKitchenWeekUser = newKitchenWeekSnapshot.val();
        newKitchenWeekUser.kitchenweek = true;
        this._updateUser(user, this.localUser.uid, true);
        this._updateUser(newKitchenWeekUser, newKitchenWeekSnapshot.key, false);
      }
    }
  };

  changeSheriff = () => {
    if (this.state.user) {
      let user = this.state.user;
      user.sheriff = false;
      let newSheriffSnapshot = this._findSnapshotByName(this.state.selectedSheriff);
      if (newSheriffSnapshot) {
        let newSheriffUser = newSheriffSnapshot.val();
        newSheriffUser.sheriff = true;
        this._updateUser(user, this.localUser.uid, true);
        this._updateUser(newSheriffUser, newSheriffSnapshot.key, false);
      }
    }
  };

  _findSnapshotByName = (name) => {
    let foundSnapshot = null;
    this.users.forEach((snapshot) => {
      const user = snapshot.val();
      if (user.name === name) {
        foundSnapshot = snapshot;
      }
    });
    return foundSnapshot;
  };

  _findSnapshotByRoom = (room) => {
    let foundSnapshot = null;
    this.users.forEach((snapshot) => {
      const user = snapshot.val();
      if (user.room === room) {
        foundSnapshot = snapshot;
      }
    });
    return foundSnapshot;
  };

  _updateUser = (user, uid, shouldSave) => {
    Database.updateUser(uid, user);
    if (shouldSave) {
      this.setState({user: user});
      let passUser = Object.assign({password: this.localUser.password, uid: uid}, user);
      LocalStorage.setUser(passUser);
    }
  };

  _getUser = () => {
    LocalStorage.getUser().then(user => {
      this.localUser = user;
      Database.getUser(user.uid).then(snapshot => {
        this.setState({user: snapshot.val()});
        this.forceUpdate();
      });
    });
  };

  _getDuties = () => {
    Database.getDuties().then(snapshot => {
      this._renderDutyPickerItems(snapshot);
    });
  };

  _renderDutyPickerItems = (snapshot) => {
    let dutyPickerItems = [];
    snapshot.forEach(child => {
      dutyPickerItems.push(
        <Picker.Item key={child.key} label={child.val()} value={child.val()}/>
      )
    });
    this.setState({dutyPickerItems})
  };

  _renderUserPickerItems = (snapshot) => {
    let userPickerItems = [];
    snapshot.forEach(child => {
      if (child.val().name !== this.localUser.name)
        userPickerItems.push(
          <Picker.Item key={child.key} label={child.val().name} value={child.val().name}/>
        )
    });
    this.setState({userPickerItems})
  };

  changePasswordAlert = () => {
    Alert.alert('Er du sikker?',
      'Du vil modtage en mail på ' + this.state.user.email,
      [
        {
          text: 'Annullér', onPress: () => {
          }
        },
        {text: 'OK', onPress: this._changePassword},
      ])
  };

  _changePassword = () => {
    this.auth.sendPasswordResetEmail(this.state.user.email);
  };

  onDutyCancel = () => {
    this.setDutyModalVisible(false);
  };

  onDutySubmit = () => {
    this.changeDuty();
    this.setDutyModalVisible(false);
  };

  onDutyChange = (itemValue) => {
    this.setState({selectedDuty: itemValue});
  };

  setDutyModalVisible = (visible) => {
    this.setState({selectedDuty: this.state.user.duty, dutyModalVisible: visible});
  };

  onKitchenWeekCancel = () => {
    this.setKitchenWeekModalVisible(false);
  };

  onKitchenWeekSubmit = () => {
    this.changeKitchenWeek();
    this.setKitchenWeekModalVisible(false);
  };

  onKitchenWeekChange = (itemValue) => {
    this.setState({selectedKitchenWeek: itemValue});
  };

  setKitchenWeekModalVisible = (visible) => {
    this.setState({selectedKitchenWeek: this.currentSheriff.val().name, kitchenWeekModalVisible: visible});
  };

  onSheriffCancel = () => {
    this.setSheriffModalVisible(false);
  };

  onSheriffSubmit = () => {
    this.changeSheriff();
    this.setSheriffModalVisible(false);
  };

  onSheriffChange = (itemValue) => {
    this.setState({selectedSheriff: itemValue});
  };

  setSheriffModalVisible = (visible) => {
    let initialSheriffName = '';
    if (visible) {
      const initialSheriffRoom = '17' + (((this.currentSheriff.val().room.substr(2, 3) % 14) + 1));
      initialSheriffName = this._findSnapshotByRoom(initialSheriffRoom).val().name;
    }
    this.setState({selectedSheriff: '' + initialSheriffName, sheriffModalVisible: visible});
  };

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
          <TouchableOpacity style={styles.rightText} onPress={() => this.setDutyModalVisible(true)}>
            <Text>{this.state.user.duty}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Køkkenuge:</Text>
          <Switch style={styles.rightText}
                  value={this.state.user.kitchenweek}
                  onValueChange={this.switchKitchenWeek}/>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftText}>Sheriff:</Text>
          <Switch style={styles.rightText}
                  value={this.state.user.sheriff}
                  onValueChange={this.switchSheriff}/>
        </View>
        <View style={styles.changePasswordRowContainer}>
          <Button title='Skift Adgangskode'
                  color={colors.logoutTextColor}
                  onPress={this.changePasswordAlert}/>
        </View>
        <ModalScreen
          onValueChange={this.onDutyChange}
          selectedValue={this.state.selectedDuty}
          pickerItems={this.state.dutyPickerItems}
          modalTitle='Vælg en tjans'
          visible={this.state.dutyModalVisible}
          onSubmit={this.onDutySubmit}
          onCancel={this.onDutyCancel}
        />
        <ModalScreen
          onValueChange={this.onKitchenWeekChange}
          selectedValue={this.state.selectedKitchenWeek}
          pickerItems={this.state.userPickerItems}
          modalTitle='Vælg næste køkkenuge'
          visible={this.state.kitchenWeekModalVisible}
          onSubmit={this.onKitchenWeekSubmit}
          onCancel={this.onKitchenWeekCancel}
        />
        <ModalScreen
          onValueChange={this.onSheriffChange}
          selectedValue={this.state.selectedSheriff}
          pickerItems={this.state.userPickerItems}
          modalTitle='Vælg næste sheriff'
          visible={this.state.sheriffModalVisible}
          onSubmit={this.onSheriffSubmit}
          onCancel={this.onSheriffCancel}
        />
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
