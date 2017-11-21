import React, {Component} from 'react';

import {
  View,
  Image,
  StyleSheet,
  Picker,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';

export default class HomeScreen extends Component {

  static navigationOptions = {
    title: 'Hjem',
    drawerIcon: ({tintColor}) => ( <Icon name='home' style={{fontSize: 20, color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
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

  _renderPickerItems(snapshot) {
    let pickerItems = [];
    snapshot.forEach(child => {
      pickerItems.push(
        <Picker.Item key={child.key} label={child.val().name} value={child.val().name}/>
      )
    });
    this.setState({pickerItems})
  }

  setMvpModalVisible(visible) {
    this.setState({mvpModalVisible: visible});
  }

  setShotsModalVisible(visible) {
    this.setState({shotsModalVisible: visible});
  }

  columnContainerStyle(value) {
    return {
      backgroundColor: (value ? colors.greenColor : colors.redColor),
      borderColor: colors.blueColor,
      borderWidth: 5,
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: 'column',
      alignItems: 'center',
      margin: 5,
      padding: 5
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.textHeader}>Velkommen til Køkken 1700 </Text>
            <Image style={styles.image} source={require('../../img/baggrund_guld.png')}/>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/køkkenuge.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.kitchenWeek}</Text>
          </View>
          <View style={styles.columnContainer}>
            <Image style={styles.image} source={require('../../img/sheriff.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.sheriff}</Text>
          </View>
          <TouchableOpacity style={styles.columnContainer}
                            onPress={() => this.setMvpModalVisible(true)
                            }>
            <Image style={styles.image} source={require('../../img/mvp.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.mvp}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={styles.columnContainer}
            onPress={() => this.setShotsModalVisible(true)}>
            <Image style={styles.image} source={require('../../img/keep_calm_and_shots.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.shots}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.columnContainerStyle(this.state.events.beerpong)}
            onPress={() => Database.updateEvent('beerpong', !this.state.events.beerpong)}>
            <Text style={styles.text}>Beer pong?</Text>
            <Image style={styles.image} source={require('../../img/beerpong.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.beerpong ? 'Jaaa Daa!' : 'Nah fam'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.columnContainerStyle(this.state.events.fox)}
            onPress={() => Database.updateEvent('fox', !this.state.events.fox)}>
            <Text style={styles.text}>Har vi ræv?</Text>
            <Image style={styles.image} source={require('../../img/fox.png')}/>
            <Text numberOfLines={2} style={styles.text}>{this.state.events.fox ? 'ofc' : 'Næææh'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.columnContainer}>
            <Text style={styles.text}>Ølregnskab</Text>
            <Image style={styles.image} source={require('../../img/olregnskab.png')}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.columnContainer}>
            <Text style={styles.text}>VIP club</Text>
            <Image style={styles.image} source={require('../../img/vip_logo2.png')}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.columnContainer}>
            <Text style={styles.text}>Gossip club</Text>
            <Image style={styles.image} source={require('../../img/gossip_icon.png')}/>
          </TouchableOpacity>
        </View>
        <Modal
          animationType='fade'
          transparent={true}
          onRequestClose={() => {
          }}
          visible={this.state.mvpModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalPickerContainer}>
              <Text>Vælg en person</Text>
              <Picker
                mode='dialog'
                onValueChange={itemValue => this.setState({selectedMvp: itemValue})}
                selectedValue={this.state.selectedMvp}>
                {this.state.pickerItems}
              </Picker>
              <View style={styles.modalPickerRowContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => this.setMvpModalVisible(false)}>
                  <Text>Annullér</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    Database.updateEvent('mvp', this.state.selectedMvp);
                    this.setMvpModalVisible(false);
                  }}>
                  <Text>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType='fade'
          transparent={true}
          onRequestClose={() => {
          }}
          visible={this.state.shotsModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalPickerContainer}>
              <Text>Vælg en person</Text>
              <Picker
                mode='dialog'
                onValueChange={itemValue => this.setState({selectedShots: itemValue})}
                selectedValue={this.state.selectedShots}>
                {this.state.pickerItems}
              </Picker>
              <View style={styles.modalPickerRowContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => this.setShotsModalVisible(false)}>
                  <Text>Annullér</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    Database.updateEvent('shots', this.state.selectedShots);
                    this.setShotsModalVisible(false);
                  }}>
                  <Text>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    borderColor: colors.blueColor,
    borderWidth: 5,
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
    margin: 10,
    padding: 5
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  image: {
    height: 60,
    width: 60,
    margin: 10,
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