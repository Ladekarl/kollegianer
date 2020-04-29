import React, {Component} from 'react';
import {
  Alert,
  Picker,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import colors from '../shared/colors';
import auth from '@react-native-firebase/auth';
import ModalScreen from './Modal';
import {strings} from '../shared/i18n';
import PropTypes from 'prop-types';
import Icon from 'react-native-fa-icons';

export default class SettingsList extends Component {
  static propTypes = {
    required: PropTypes.bool.isRequired,
    navigation: PropTypes.object,
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
        uid: '',
        keyphrase: '',
        phone: '',
      },
      dutyPickerItems: [],
      userPickerItems: [],
      selectedDuty: '',
      selectedKitchenWeek: '',
      selectedSheriff: '',
      dutyModalVisible: false,
      kitchenWeekModalVisible: false,
      sheriffModalVisible: false,
      tempUser: {
        name: '',
        birthday: '',
        email: '',
        room: '',
        keyphrase: '',
        phone: '',
      },
    };
    this.auth = auth();
  }

  componentDidMount() {
    this._getUser();
    this._getDuties();
  }

  componentWillUnmount() {
    Database.unListenUsers().catch(error => console.log(error));
  }

  changeDuty = () => {
    if (this.state.selectedDuty) {
      let user = this.state.user;
      user.duty = this.state.selectedDuty;
      this._updateUser(user, this.localUser.uid, true);
    }
  };

  switchKitchenWeek = value => {
    if (this.currentKitchenWeek) {
      if (value && this.localUser.uid !== this.currentKitchenWeek.key) {
        Alert.alert(
          this.currentKitchenWeek.val().name +
            strings('settings.kitchen_week_taken'),
        );
      } else if (!value && this.localUser.uid === this.currentKitchenWeek.key) {
        this.setKitchenWeekModalVisible(true);
      }
    }
  };

  switchSheriff = value => {
    if (this.currentSheriff) {
      if (value && this.localUser.uid !== this.currentSheriff.key) {
        Alert.alert(
          this.currentSheriff.val().name + strings('settings.sheriff_taken'),
        );
      } else if (!value && this.localUser.uid === this.currentSheriff.key) {
        this.setSheriffModalVisible(true);
      }
    }
  };

  changeKitchenWeek = () => {
    if (this.state.user) {
      let user = this.state.user;
      user.kitchenweek = false;
      let newKitchenWeekSnapshot = this._findSnapshotByName(
        this.state.selectedKitchenWeek,
      );
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
      let newSheriffSnapshot = this._findSnapshotByName(
        this.state.selectedSheriff,
      );
      if (newSheriffSnapshot) {
        let newSheriffUser = newSheriffSnapshot.val();
        newSheriffUser.sheriff = true;
        this._updateUser(user, this.localUser.uid, true);
        this._updateUser(newSheriffUser, newSheriffSnapshot.key, false);
      }
    }
  };

  _findSnapshotByName = name => {
    let foundSnapshot = null;
    this.users.forEach(snapshot => {
      const user = snapshot.val();
      if (user.name === name) {
        foundSnapshot = snapshot;
      }
    });
    return foundSnapshot;
  };

  _findSnapshotByRoom = room => {
    let foundSnapshot = null;
    this.users.forEach(snapshot => {
      const user = snapshot.val();
      if (user.room === room) {
        foundSnapshot = snapshot;
      }
    });
    return foundSnapshot;
  };

  _updateUser = (user, uid, shouldSave) => {
    Database.updateUser(uid, user).catch(error => console.log(error));
    if (shouldSave) {
      this.setState({user: user});
      let passUser = Object.assign(
        {
          password: this.localUser.password,
          uid: uid,
          accessToken: this.localUser.accessToken,
        },
        user,
      );
      LocalStorage.setUser(passUser).catch(error => console.log(error));
    }
  };

  _getUser = () => {
    LocalStorage.getUser()
      .then(user => {
        this.localUser = user;
        Database.getUser(user.uid)
          .then(snapshot => {
            this.setState({
              user: snapshot.val(),
              tempUser: snapshot.val(),
            });
          })
          .catch(error => console.log(error));
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
        }).catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  };

  _getDuties = () => {
    Database.getDuties()
      .then(snapshot => {
        this._renderDutyPickerItems(snapshot);
      })
      .catch(error => console.log(error));
  };

  _renderDutyPickerItems = snapshot => {
    let dutyPickerItems = [];
    snapshot.forEach(child => {
      dutyPickerItems.push(
        <Picker.Item key={child.key} label={child.val()} value={child.val()} />,
      );
    });
    this.setState({dutyPickerItems});
  };

  _renderUserPickerItems = snapshot => {
    let userPickerItems = [];
    snapshot.forEach(child => {
      const user = child.val();
      if (user && user.name && user.name !== this.localUser.name) {
        userPickerItems.push(
          <Picker.Item key={child.key} label={user.name} value={user.name} />,
        );
      }
    });
    this.setState({userPickerItems});
  };

  changePasswordAlert = () => {
    Alert.alert(
      strings('settings.change_password_modal_title'),
      strings('settings.change_password_modal_text') + this.state.user.email,
      [
        {
          text: strings('settings.change_password_modal_cancel'),
          onPress: () => {},
        },
        {
          text: strings('settings.change_password_modal_ok'),
          onPress: this._changePassword,
        },
      ],
    );
  };

  deleteAccountAlert = () => {
    Alert.alert(
      strings('settings.delete_account'),
      strings('settings.delete_account_modal_text'),
      [
        {
          text: strings('settings.change_password_modal_cancel'),
          onPress: () => {},
        },
        {
          text: strings('settings.change_password_modal_ok'),
          onPress: this._deleteAccount,
        },
      ],
    );
  };

  _changePassword = () => {
    this.auth
      .sendPasswordResetEmail(this.state.user.email)
      .catch(error => console.log(error));
  };

  _deleteAccount = () => {
    Database.deleteAccount(this.localUser.uid).then(() => {
      LocalStorage.removeUser().then(() => {
        if (this.props.navigation) {
          this.props.navigation.navigate('Logout');
        }
      });
    });
  };

  onDutyCancel = () => {
    this.setDutyModalVisible(false);
  };

  onDutySubmit = () => {
    this.changeDuty();
    this.setDutyModalVisible(false);
  };

  onDutyChange = itemValue => {
    this.setState({selectedDuty: itemValue});
  };

  setDutyModalVisible = visible => {
    this.setState({
      selectedDuty: this.state.user.duty,
      dutyModalVisible: visible,
    });
  };

  onKitchenWeekCancel = () => {
    this.setKitchenWeekModalVisible(false);
  };

  onKitchenWeekSubmit = () => {
    this.changeKitchenWeek();
    this.setKitchenWeekModalVisible(false);
  };

  onKitchenWeekChange = itemValue => {
    this.setState({selectedKitchenWeek: itemValue});
  };

  setKitchenWeekModalVisible = visible => {
    this.setState({
      selectedKitchenWeek: this.currentSheriff.val().name,
      kitchenWeekModalVisible: visible,
    });
  };

  onSheriffCancel = () => {
    this.setSheriffModalVisible(false);
  };

  onSheriffSubmit = () => {
    this.changeSheriff();
    this.setSheriffModalVisible(false);
  };

  onSheriffChange = itemValue => {
    this.setState({selectedSheriff: itemValue});
  };

  setSheriffModalVisible = visible => {
    let initialSheriffName = '';
    if (visible) {
      let nextRoom =
        (parseInt(this.currentSheriff.val().room.substr(2, 3)) % 14) + 1;
      nextRoom = nextRoom.length < 2 ? '0' + nextRoom : nextRoom;
      const initialSheriffRoom =
        this.currentSheriff.val().room.substr(0, 2) + nextRoom;
      const userSnapshot = this._findSnapshotByRoom(initialSheriffRoom);
      initialSheriffName = userSnapshot ? userSnapshot.val().name : '';
    }
    this.setState({
      selectedSheriff: '' + initialSheriffName,
      sheriffModalVisible: visible,
    });
  };

  onSettingChanged = (text, prop) => {
    const {tempUser} = this.state;
    tempUser[prop] = text;
    this.setState(
      {
        tempUser,
      },
      () => {
        this.onSubmitSetting(prop);
      },
    );
  };

  onSubmitSetting = prop => {
    const {user, tempUser} = this.state;
    user[prop] = tempUser[prop];
    this.setState({
      user,
    });
    this._updateUser(user, this.localUser.uid, true);
  };

  render() {
    const {user, tempUser} = this.state;
    const {required} = this.props;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>
            {strings('settings.profile')}
          </Text>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.leftContainer}>
            {!user.name && required && (
              <Icon name="exclamation-circle" style={styles.requiredIcon} />
            )}
            <Text style={styles.leftText}>{strings('settings.name')}</Text>
          </View>
          <TextInput
            style={styles.rightText}
            value={tempUser.name}
            onChangeText={text => this.onSettingChanged(text, 'name')}
            onSubmitEditing={() => this.onSubmitSetting('name')}
            textContentType="name"
            returnKeyType="done"
            underlineColorAndroid={colors.inactiveTabColor}
            selectionColor={colors.inactiveTabColor}
            placeholder={strings('settings.name_placeholder')}
          />
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.leftContainer}>
            {!user.email && required && (
              <Icon name="exclamation-circle" style={styles.requiredIcon} />
            )}
            <Text style={styles.leftText}>{strings('settings.email')}</Text>
          </View>
          <TextInput
            style={styles.rightText}
            value={tempUser.email}
            onChangeText={text => this.onSettingChanged(text, 'email')}
            onSubmitEditing={() => this.onSubmitSetting('email')}
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="done"
            underlineColorAndroid={colors.inactiveTabColor}
            selectionColor={colors.inactiveTabColor}
            placeholder={strings('settings.email_placeholder')}
          />
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.leftContainer}>
            <Text style={styles.leftText}>{strings('settings.birthday')}</Text>
          </View>
          <TextInput
            style={styles.rightText}
            value={tempUser.birthday}
            onChangeText={text => this.onSettingChanged(text, 'birthday')}
            onSubmitEditing={() => this.onSubmitSetting('birthday')}
            underlineColorAndroid={colors.inactiveTabColor}
            selectionColor={colors.inactiveTabColor}
            returnKeyType="done"
            placeholder={strings('settings.birthday_placeholder')}
          />
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.leftContainer}>
            <Text style={styles.leftText}>
              {strings('settings.phone_number')}
            </Text>
          </View>
          <TextInput
            style={styles.rightText}
            value={tempUser.phone}
            keyboardType="phone-pad"
            onChangeText={text => this.onSettingChanged(text, 'phone')}
            onSubmitEditing={() => this.onSubmitSetting('phone')}
            underlineColorAndroid={colors.inactiveTabColor}
            selectionColor={colors.inactiveTabColor}
            textContentType="telephoneNumber"
            returnKeyType="done"
            placeholder={strings('settings.phone_number_placeholder')}
          />
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.leftContainer}>
            {!user.room && required && (
              <Icon name="exclamation-circle" style={styles.requiredIcon} />
            )}
            <Text style={styles.leftText}>{strings('settings.room')}</Text>
          </View>
          <TextInput
            style={styles.rightText}
            value={tempUser.room}
            onChangeText={text => this.onSettingChanged(text, 'room')}
            onSubmitEditing={() => this.onSubmitSetting('room')}
            keyboardType="number-pad"
            returnKeyType="done"
            underlineColorAndroid={colors.inactiveTabColor}
            selectionColor={colors.inactiveTabColor}
            placeholder={strings('settings.room_placeholder')}
          />
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.leftContainer}>
            {!user.duty && required && (
              <Icon name="exclamation-circle" style={styles.requiredIcon} />
            )}
            <Text style={styles.leftText}>{strings('settings.duty')}</Text>
          </View>
          <TouchableOpacity onPress={() => this.setDutyModalVisible(true)}>
            <Text style={styles.rightText}>
              {user.duty ? user.duty : strings('settings.duty_placeholder')}
            </Text>
          </TouchableOpacity>
        </View>
        {required && (
          <View style={styles.rowContainer}>
            <View style={styles.leftContainer}>
              {!user.keyphrase && required && (
                <Icon name="exclamation-circle" style={styles.requiredIcon} />
              )}
              <Text style={styles.leftText}>
                {strings('settings.keyphrase')}
              </Text>
            </View>
            <TextInput
              style={styles.rightText}
              value={tempUser.keyphrase}
              onChangeText={text => this.onSettingChanged(text, 'keyphrase')}
              onSubmitEditing={() => this.onSubmitSetting('keyphrase')}
              underlineColorAndroid={colors.inactiveTabColor}
              autoComplete="password"
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
              selectionColor={colors.inactiveTabColor}
              placeholder={strings('settings.keyphrase_placeholder')}
            />
          </View>
        )}
        {this.currentKitchenWeek &&
          this.localUser &&
          this.localUser.uid === this.currentKitchenWeek.key && (
            <View style={styles.rowContainer}>
              <Text style={styles.leftText}>
                {strings('settings.kitchen_week')}
              </Text>
              <Switch
                style={styles.rightItem}
                value={this.state.user.kitchenweek}
                onValueChange={this.switchKitchenWeek}
              />
            </View>
          )}
        {this.currentSheriff &&
          this.localUser &&
          this.localUser.uid === this.currentSheriff.key && (
            <View style={styles.rowContainer}>
              <Text style={styles.leftText}>{strings('settings.sheriff')}</Text>
              <Switch
                style={styles.rightItem}
                value={this.state.user.sheriff}
                onValueChange={this.switchSheriff}
              />
            </View>
          )}
        {this.localUser && !!this.localUser.password && !required && (
          <View style={styles.changePasswordRowContainer}>
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={this.changePasswordAlert}>
              <Text style={styles.changePasswordText}>
                {strings('settings.change_password')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {this.localUser && !required && (
          <View style={styles.changePasswordRowContainer}>
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={this.deleteAccountAlert}>
              <Text style={styles.changePasswordText}>
                {strings('settings.delete_account')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <ModalScreen
          onPickerValueChange={this.onDutyChange}
          selectedPickerValue={this.state.selectedDuty}
          pickerItems={this.state.dutyPickerItems}
          modalTitle={strings('settings.choose_duty_modal_title')}
          visible={this.state.dutyModalVisible}
          onSubmit={this.onDutySubmit}
          onCancel={this.onDutyCancel}
          isPicker={true}
        />
        <ModalScreen
          onPickerValueChange={this.onKitchenWeekChange}
          selectedPickerValue={this.state.selectedKitchenWeek}
          pickerItems={this.state.userPickerItems}
          modalTitle={strings('settings.choose_kitchen_week_modal_title')}
          visible={this.state.kitchenWeekModalVisible}
          onSubmit={this.onKitchenWeekSubmit}
          onCancel={this.onKitchenWeekCancel}
          isPicker={true}
        />
        <ModalScreen
          onPickerValueChange={this.onSheriffChange}
          selectedPickerValue={this.state.selectedSheriff}
          pickerItems={this.state.userPickerItems}
          modalTitle={strings('settings.choose_sheriff_modal_title')}
          visible={this.state.sheriffModalVisible}
          onSubmit={this.onSheriffSubmit}
          onCancel={this.onSheriffCancel}
          isPicker={true}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  requiredIcon: {
    color: colors.cancelButtonColor,
    fontSize: 20,
    marginLeft: 10,
  },
  rowContainer: {
    height: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 2,
    backgroundColor: colors.whiteColor,
    padding: 5,
  },
  sectionHeaderContainer: {
    backgroundColor: colors.backgroundColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  changePasswordRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 7,
    padding: 15,
  },
  changePasswordButton: {
    backgroundColor: colors.submitButtonColor,
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  deleteAccountButton: {
    backgroundColor: colors.cancelButtonColor,
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  changePasswordText: {
    fontSize: 18,
    color: colors.whiteColor,
  },
  leftContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftText: {
    marginLeft: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    marginLeft: 10,
  },
  rightItem: {
    marginRight: 10,
  },
  rightText: {
    marginRight: 10,
    color: colors.submitButtonColor,
  },
});
