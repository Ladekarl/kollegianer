import React, {Component} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import LocalStorage from "../storage/LocalStorage";
import FitImage from 'react-native-fit-image';
import {DocumentPicker, DocumentPickerUtil} from 'react-native-document-picker';
import * as Papa from 'papaparse';
import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-fetch-blob';

export default class AccountingScreen extends Component {

  static navigationOptions = {
    tabBarLabel: 'Regnskab',
    tabBarIcon: ({tintColor}) => (
      <Icon name='credit-card' style={{fontSize: 20, height: undefined, width: undefined, color: tintColor}}/>),
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
      }
    };
  }

  componentDidMount() {
    this._getUser();
  }

  _getUser = () => {
    LocalStorage.getUser().then(user => {
      Database.getUser(user.uid).then(snapshot => {
        this.setState({user: snapshot.val()});
      });
    });
  };

  _uploadFile = (isKithen) => {
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles()],
    }, (error, res) => {
      if (!error && res.type === 'text/comma-separated-values') {
        this._loadFile(res.uri).then(content => {
          this._parseCsv(content);
        });
      } else if (!error && res.type !== 'text/comma-separated-values') {
        Alert.alert('Filen skal være af typen CSV');
      } else {
        Alert.alert(error)
      }
    });
  };

  _loadFile = (url) => {
    const split = url.split('/');
    const name = split.pop();
    const inbox = split.pop();
    const realPath = `${RNFS.ExternalStorageDirectoryPath}/download/FKK1700_Ølregnskab_template1.csv`;

    const {fs, fetch, wrap} = RNFetchBlob;
    let rnfbURI = wrap(url);
    fetch('GET', rnfbURI).then(result => {
      console.log(result);
    }).catch(error => {
      console.log(error);
    });
    //return RNFS.readFile(realPath);
  };

  _parseCsv = (content) => {
    Papa.parse(content, {
      delimiter: ';',
      complete: (results) => {
        console.log(results);
      }
    });
  };

  renderUploadButtons = () => {
    return (
      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={styles.columnContainer}
          onPress={() => this._uploadFile(true)}>
          <Text style={styles.uploadText}>Upload Køkkenregnskab</Text>
          <FitImage resizeMode='contain' style={styles.uploadImage} source={require('../../img/olregnskab.png')}/>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.columnContainer}
          onPress={() => this._uploadFile(false)}>
          <Text style={styles.uploadText}>Upload Ølregnskab</Text>
          <FitImage resizeMode='contain' style={styles.uploadImage} source={require('../../img/olregnskab.png')}/>
        </TouchableOpacity>
      </View>
    )
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.user && this.state.user.duty.toLowerCase().indexOf('regnskab') !== -1 &&
        this.renderUploadButtons()
        }
        <Text style={{fontSize: 25, marginTop: 50, alignSelf: 'center', alignItems: 'center', justifyContent: 'center'}}>Kommer snart!</Text>
      </View>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '20%'
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
  uploadText: {
    textAlign: 'center'
  },
  uploadImage: {
    flex: 1,
    alignSelf: 'stretch',
    height: undefined,
    width: undefined,
    margin: 10
  }
});