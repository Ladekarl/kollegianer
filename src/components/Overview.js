import React, {Component} from 'react';

import {
  View,
  StyleSheet,
  Picker,
  Text,
  TouchableOpacity,
} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import FitImage from 'react-native-fit-image';
import ModalScreen from './Modal';

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
      });
      this._renderPickerItems(snapshot);
    })
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

  updateBeerPongEvent = () => {
    Database.updateEvent('beerpong', !this.state.events.beerpong);
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
              resizeMode="contain"
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
            style={styles.columnContainer}
            onPress={() => this.setShotsModalVisible(true)}>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/keep_calm_and_shots.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.shots}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.columnContainerStyle(this.state.events.beerpong)}
            onPress={this.updateBeerPongEvent}>
            <Text style={styles.text}>Beer pong?</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/beerpong.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.beerpong ? 'Jaaa Daa!' : 'Nah fam'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.columnContainerStyle(this.state.events.fox)}
            onPress={() => this.updateFoxEvent()}>
            <Text style={styles.text}>Har vi ræv?</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/fox.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.fox ? 'ofc' : 'Næææh'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.columnContainer}>
            <Text style={styles.text}>Ølregnskab</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/olregnskab.png')}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.columnContainer}>
            <Text style={styles.text}>VIP club</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/vip_logo2.png')}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.columnContainer}>
            <Text style={styles.text}>Gossip club</Text>
            <FitImage resizeMode='contain' style={styles.image} source={require('../../img/gossip_icon.png')}/>
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