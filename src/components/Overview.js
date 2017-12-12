import React, {Component} from 'react';

import {
  View,
  StyleSheet,
  Picker,
  Text,
  TouchableOpacity, Alert,
} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import FitImage from 'react-native-fit-image';
import ModalScreen from './Modal';
import Base64 from '../shared/Base64';
import LocalStorage from '../storage/LocalStorage';

export default class OverviewScreen extends Component {

  static navigationOptions = {
    tabBarLabel: 'Oversigt',
    tabBarIcon: ({tintColor}) => (<Icon name='home' style={{fontSize: 25, color: tintColor}}/>),
  };

  constructor(props) {
    super(props);
    this.state = {
      events: {
        beerpong: false,
        fox: false,
        mvp: '',
        shots: '',
        partymode: ''
      },
      kitchenWeek: '',
      sheriff: '',
      selectedMvp: '',
      selectedShots: '',
      mvpModalVisible: false,
      shotsModalVisible: false,
      pickerItems: []
    };
    Database.getUsers().then(snapshot => {
      snapshot.forEach(snap => {
        let user = snap.val();
        if (user.kitchenweek) {
          this.setState({kitchenWeek: user.name});
        }
        if (user.sheriff) {
          this.setState({sheriff: user.name});
        }
        if (user.kitchenweek && user.sheriff) {
          this.showAssignSheriffAlert();
        }
      });
      this._renderPickerItems(snapshot);
    });
    LocalStorage.getUser().then(user => {
      this.localUser = user;
    });
  }

  componentDidMount() {
    Database.listenEvents(snapshot => {
      let events = snapshot.val();
      this.currentShots = events.shots;
      this.currentMvp = events.mvp;
      this.setState({
        events: events,
        selectedMvp: events.mvp,
        selectedShots: events.shots
      });
    });
  }

  componentWillUnmount() {
    Database.unListenEvents();
  }

  showAssignSheriffAlert = () => {
    Alert.alert(
      'Vælg en ny sheriff',
      'Du har både køkkenugen og er sheriff',
      [
        {text: 'OK', onPress: this._navigateToSettings},
      ],
      {cancelable: false}
    );
  };

  _navigateToSettings = () => {
    this.props.screenProps.rootNavigation.navigate('Settings');
  };

  _renderPickerItems = (snapshot) => {
    let pickerItems = [];
    snapshot.forEach(child => {
      pickerItems.push(
        <Picker.Item key={child.key} label={child.val().name} value={child.val().name}/>
      )
    });
    this.setState({pickerItems})
  };

  setMvpModalVisible = (visible) => {
    this.setState({mvpModalVisible: visible});
  };

  setShotsModalVisible = (visible) => {
    this.setState({shotsModalVisible: visible});
  };

  onMvpCancel = () => {
    this.setState({selectedMvp: this.currentMvp});
    this.setMvpModalVisible(false);
  };

  onMvpSubmit = () => {
    Database.updateEvent('mvp', this.state.selectedMvp);
    this.setMvpModalVisible(false);
  };

  onMvpChange = (itemValue) => {
    this.setState({selectedMvp: itemValue});
  };

  onShotsCancel = () => {
    this.setState({selectedShots: this.currentShots});
    this.setShotsModalVisible(false);
  };

  onShotsSubmit = () => {
    Database.updateEvent('shots', this.state.selectedShots);
    this.setShotsModalVisible(false);
  };

  onShotsChange = (itemValue) => {
    this.setState({selectedShots: itemValue});
  };

  columnContainerStyle(value) {
    return {
      backgroundColor: (value ? colors.greenColor : colors.redColor),
      borderColor: colors.overviewIconColor,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 2,
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: 'column',
      alignItems: 'center',
      margin: 5,
      padding: 5
    };
  }

  showBeerpongAlert = () => {
    Alert.alert(
      'Skift status:',
      'Kan du bekræfte at du lige har købt for 1800kr - du skal bare sende de fire sidste cifre i dit cpr-nr',
      [
        {
          text: 'Fortryd', onPress: () => {
          }
        },
        {text: 'Skift', onPress: this.updateBeerPongEvent},
      ],
      {cancelable: false}
    )
  };

  showPartymodeAlert = () => {
    Alert.alert(
      'Skift status:',
      'Du skifter party mode nu <3',
      [
        {
          text: 'Fortryd', onPress: () => {
          }
        },
        {text: 'Skift', onPress: this._togglePartyLights},
      ],
      {cancelable: false}
    );
  };

  showFoxAlert = () => {
    Alert.alert(
      'Skift status:',
      'Sikker på at vi har vundet øl-ræven eller har 700 gemt den på deres køkken igen?',
      [
        {
          text: 'Fortryd', onPress: () => {
          }
        },
        {text: 'Skift', onPress: this.updateFoxEvent},
      ],
      {cancelable: false}
    );
  };

  updateBeerPongEvent = () => {
    let beerpong = !this.state.events.beerpong;
    Database.updateEvent('beerpong', beerpong);
  };

  _togglePartyLights = () => {
    let partymode = this.state.events.partymode;
    fetch('https://se2-openhab04.compute.dtu.dk/rest/items/Dtu4Plug_Switch', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'text/plain',
        Authorization: 'Basic ' + Base64.btoa('group-d:hunter2')
      },
      body: partymode.length > 0 ? 'OFF' : 'ON'
    });
    Database.updateEvent('partymode',partymode.length > 0 ? '' : this.localUser.name);
  };

  updateFoxEvent = () => {
    Database.updateEvent('fox', !this.state.events.fox);
  };

  render() {
    return (
      <View style={styles.container}>
          <View style={styles.rowContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.textHeader}>Velkommen til Køkken 1700 </Text>
            <FitImage
              resizeMode='contain'
              style={styles.headerImage}
              source={require('../../img/kollegianer.png')}/>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/køkkenuge.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.kitchenWeek}</Text>
          </View>
          <View style={styles.columnContainer}>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/sheriff.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.sheriff}</Text>
          </View>
          <TouchableOpacity style={styles.columnContainer}
                            onPress={() => this.setMvpModalVisible(true)
                            }>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/mvp.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.mvp}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={this.columnContainerStyle(this.state.events.beerpong)}
            onPress={this.showBeerpongAlert}>
            <Text style={styles.text}>Beer pong på coxk</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/beerpong.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.beerpong ? 'Jaaa Daa!' : 'Nah fam'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.columnContainerStyle(this.state.events.partymode)}
            onPress={this.showPartymodeAlert}>
            <Text style={styles.text}>PARTY MODE</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/party_mode.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.partymode.length > 0 ? this.state.events.partymode : 'später mein freund'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.columnContainerStyle(this.state.events.fox)}
            onPress={this.showFoxAlert}>
            <Text style={styles.text}>Øl-ræven</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/fox.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.fox ? 'ofc på 1700' : 'Nope, dsværd'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.columnContainer}>
            <Text style={styles.text}>Ølregnskab</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/olregnskab.png')}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.columnContainer}
            onPress={() => this.setShotsModalVisible(true)}>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/keep_calm_and_shots.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.shots}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.columnContainer}
            onPress={() => this.setShotsModalVisible(true)}>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/keep_calm_and_shots.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.shots}</Text>
          </TouchableOpacity>
        </View>
        <ModalScreen
          modalTitle='Vælg en person'
          onCancel={this.onMvpCancel}
          onSubmit={this.onMvpSubmit}
          onValueChange={this.onMvpChange}
          pickerItems={this.state.pickerItems}
          selectedValue={this.state.selectedMvp}
          visible={this.state.mvpModalVisible}
        />
        <ModalScreen
          onValueChange={this.onShotsChange}
          selectedValue={this.state.selectedShots}
          pickerItems={this.state.pickerItems}
          modalTitle='Vælg en person'
          visible={this.state.shotsModalVisible}
          onSubmit={this.onShotsSubmit}
          onCancel={this.onShotsCancel}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  columnContainer: {
    borderColor: colors.overviewIconColor,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 5,
    padding: 5
  },
  headerContainer: {
    backgroundColor: colors.backgroundColor,
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  headerImage: {
    flex: 1,
    alignSelf: 'stretch',
    height: undefined,
    width: undefined
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
    height: undefined,
    width: undefined,
    margin: 10
  },
  text: {
    textAlign: 'center'
  },
  textHeader: {
    textAlign: 'center',
    fontWeight: 'bold'
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