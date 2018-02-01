import React, {Component} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import LocalStorage from "../storage/LocalStorage";
import FitImage from 'react-native-fit-image';
import {DocumentPicker, DocumentPickerUtil} from 'react-native-document-picker';
import * as Papa from 'papaparse';
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
        uid: '',
        kitchenAccount: {
          deadline: '',
          regNr: '',
          accountNr: '',
          sharedExpense: '',
          other: '',
          bought: '',
          dept: '',
          payed: '',
          deposit: '',
          punishmentBasis: '',
          punishment: '',
          toPay: '',
        },
        beerAccount: {
          deadline: '',
          regNr: '',
          accountNr: '',
          beers: '',
          sodas: '',
          ciders: '',
          cocios: '',
          consumption: '',
          dept: '',
          deposit: '',
          payed: '',
          punishment: '',
          toPay: '',
        }
      }
    };
  }

  componentDidMount() {
    this._getUser();
  }

  _getUser = () => {
    LocalStorage.getUser().then(user => {
      Database.listenUser(user.uid, snapshot => {
        this.setState({user: snapshot.val()});
      });
    });
  };

  _uploadFile = (isKithen) => {
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles()],
    }, (error, res) => {
      if (!error && res.type === 'text/comma-separated-values' || res.type === 'text/csv') {
        this._loadFile(res.uri).then(content => {
          this._parseCsv(content).then(result => {
            this._updateUsersFromCsv(result.data, isKithen);
          }).catch(() => {
            Alert.alert('Noget gik galt');
          });
        }).catch(() => {
          Alert.alert('Noget gik galt');
        });
      } else if (!error) {
        Alert.alert('Filen skal være af typen CSV UTF-8');
      } else {
        Alert.alert(error);
      }
    });
  };

  _updateUsersFromCsv = (csv, isKitchen) => {
    let index1701, index1702, index1703, index1704, index1705, index1706, index1707, index1708, index1709, index1710,
      index1711, index1712, index1713, index1714, accountNr, regNr, roomIndex, beerIndex, sodaIndex, ciderIndex,
      cocioIndex, consumptionIndex, deptIndex, depositIndex, payedIndex, punishmentIndex, toPayIndex,
      sharedExpenseIndex, otherIndex, boughtIndex, punishmentBasisIndex, deadline;

    for (let i = 0; i < csv.length; i++) {
      let row = csv[i];
      for (let j = 0; j < row.length; j++) {
        let entity = row[j].toLowerCase();
        // Get column indexes
        if (entity.indexOf('1701') !== -1) {
          index1701 = i;
        } else if (entity.indexOf('1702') !== -1) {
          index1702 = i;
        } else if (entity.indexOf('1703') !== -1) {
          index1703 = i;
        } else if (entity.indexOf('1704') !== -1) {
          index1704 = i;
        } else if (entity.indexOf('1705') !== -1) {
          index1705 = i;
        } else if (entity.indexOf('1706') !== -1) {
          index1706 = i;
        } else if (entity.indexOf('1707') !== -1) {
          index1707 = i;
        } else if (entity.indexOf('1708') !== -1) {
          index1708 = i;
        } else if (entity.indexOf('1709') !== -1) {
          index1709 = i;
        } else if (entity.indexOf('1710') !== -1) {
          index1710 = i;
        } else if (entity.indexOf('1711') !== -1) {
          index1711 = i;
        } else if (entity.indexOf('1712') !== -1) {
          index1712 = i;
        } else if (entity.indexOf('1713') !== -1) {
          index1713 = i;
        } else if (entity.indexOf('1714') !== -1) {
          index1714 = i;
        }

        // Get row indexes
        if (entity.indexOf('konto nr') !== -1) {
          accountNr = row[j + 1];
        } else if (entity.indexOf('reg nr') !== -1) {
          regNr = row[j + 1];
        } else if (entity.indexOf('deadline') !== -1) {
          deadline = row[j + 2];
        }

        if (entity.indexOf('værelse') !== -1) {
          roomIndex = j;
        }
        if (row[0].toLowerCase().indexOf('værelse') === -1) {
          // Skip
        } else if (entity === 'øl' && !beerIndex) {
          beerIndex = j;
        } else if (entity === 'fælles udgift') {
          sharedExpenseIndex = j;
        } else if (entity === 'andet') {
          otherIndex = j;
        } else if (entity === 'indkøbt') {
          boughtIndex = j;
        } else if (entity === 'straf grundlag') {
          punishmentBasisIndex = j;
        } else if (entity === 'somersby') {
          ciderIndex = j;
        } else if (entity === 'cocio') {
          cocioIndex = j;
        } else if (entity === 'sodavand') {
          sodaIndex = j;
        } else if (entity.indexOf('forbrug') !== -1) {
          consumptionIndex = j;
        } else if (entity.indexOf('gammel gæld') !== -1) {
          deptIndex = j;
        } else if (entity.indexOf('depositum') !== -1) {
          depositIndex = j;
        } else if (entity === 'indbetalt' || entity === 'betalt') {
          payedIndex = j;
        } else if (entity.indexOf('straf') !== -1 && !punishmentIndex) {
          punishmentIndex = j;
        } else if (entity.indexOf('at betale') !== -1) {
          toPayIndex = j;
        }
      }
    }

    const getColumn = (user) => {
      let column;
      if (user.room === '1701') {
        column = index1701;
      } else if (user.room === '1702') {
        column = index1702;
      } else if (user.room === '1703') {
        column = index1703;
      } else if (user.room === '1704') {
        column = index1704;
      } else if (user.room === '1705') {
        column = index1705;
      } else if (user.room === '1706') {
        column = index1706;
      } else if (user.room === '1707') {
        column = index1707;
      } else if (user.room === '1708') {
        column = index1708;
      } else if (user.room === '1709') {
        column = index1709;
      } else if (user.room === '1710') {
        column = index1710;
      } else if (user.room === '1711') {
        column = index1711;
      } else if (user.room === '1712') {
        column = index1712;
      } else if (user.room === '1713') {
        column = index1713;
      } else if (user.room === '1714') {
        column = index1714;
      }
      return column;
    };

    // Ølregnskab check
    if (!isKitchen && index1701 !== undefined && index1702 !== undefined && index1703 !== undefined && index1704 !== undefined && index1705 !== undefined && index1706 !== undefined && index1707 !== undefined
      && index1708 !== undefined && index1709 !== undefined && index1710 !== undefined && index1711 !== undefined && index1712 !== undefined && index1713 !== undefined && index1714 !== undefined && accountNr !== undefined
      && regNr !== undefined && roomIndex !== undefined && beerIndex && sodaIndex && ciderIndex && cocioIndex && consumptionIndex && deptIndex
      && depositIndex !== undefined && payedIndex !== undefined && punishmentIndex !== undefined && toPayIndex !== undefined && deadline !== undefined) {
      // SAVE User data
      Database.getUsers().then(snapshot => {
        snapshot.forEach(snap => {
          let user = snap.val();
          const column = getColumn(user);
          if (column) {
            const row = csv[column];
            user.beerAccount = {
              deadline: deadline,
              regNr: regNr,
              accountNr: accountNr,
              beers: row[beerIndex],
              sodas: row[sodaIndex],
              ciders: row[ciderIndex],
              cocios: row[cocioIndex],
              consumption: row[consumptionIndex],
              dept: row[deptIndex],
              deposit: row[depositIndex],
              payed: row[payedIndex],
              punishment: row[punishmentIndex],
              toPay: row[toPayIndex],
            };
            Database.updateUser(snap.key, user);
          }
        });
      });
    }
    // Køkkenregnskab check
    else if (isKitchen !== undefined && index1701 !== undefined && index1702 !== undefined && index1703 !== undefined && index1704 !== undefined && index1705 !== undefined && index1706 !== undefined && index1707 !== undefined
      && index1708 !== undefined && index1709 !== undefined && index1710 !== undefined && index1711 !== undefined && index1712 !== undefined && index1713 !== undefined && index1714 !== undefined && accountNr !== undefined && regNr !== undefined
      && roomIndex !== undefined && deptIndex !== undefined && depositIndex !== undefined && payedIndex !== undefined && punishmentIndex !== undefined && toPayIndex !== undefined
      && sharedExpenseIndex !== undefined && otherIndex !== undefined && boughtIndex !== undefined && punishmentBasisIndex !== undefined) {
      Database.getUsers().then(snapshot => {
        snapshot.forEach(snap => {
          let user = snap.val();
          let column = getColumn(user);
          if (column) {
            let row = csv[column];
            user.kitchenAccount = {
              deadline: deadline,
              regNr: regNr,
              accountNr: accountNr,
              sharedExpense: row[sharedExpenseIndex],
              other: row[otherIndex],
              bought: row[boughtIndex],
              dept: row[deptIndex],
              payed: row[payedIndex],
              deposit: row[depositIndex],
              punishmentBasis: row[punishmentBasisIndex],
              punishment: row[punishmentIndex],
              toPay: row[toPayIndex],
            };
            Database.updateUser(snap.key, user);
          }
        });
      });
    }
    else {
      Alert.alert('Noget gik galt', 'Er du sikker på filen er i CSV UTF-8 format?\n' +
        'Er du sikker på at du uploadede det rigtige regnskab?');
    }
  };

  _loadFile = (url) => {
    const {fs} = RNFetchBlob;
    return fs.readFile(url, 'utf8');
  };

  _parseCsv = (content) => {
    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        delimiter: ',',
        complete: (results) => {
          resolve(results);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  renderUploadButtons = () => {
    return (
      <View style={styles.buttonRowContainer}>
        <TouchableOpacity
          style={styles.buttonColumnContainer}
          onPress={() => this._uploadFile(true)}>
          <Text style={styles.uploadText}>Upload Køkkenregnskab</Text>
          <FitImage resizeMode='contain' style={styles.uploadImage} source={require('../../img/olregnskab.png')}/>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonColumnContainer}
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
        this.renderUploadButtons()}
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Text>Ølregnskab</Text>
            <Text>{'Du skylder ' + this.state.user.beerAccount.toPay}</Text>
            <Text>{'Deadline ' + this.state.user.beerAccount.deadline}</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.columnContainer}>
            <Text>Køkkenregnskab</Text>
            <Text>{'Du skylder ' + this.state.user.kitchenAccount.toPay}</Text>
            <Text>{'Deadline ' + this.state.user.kitchenAccount.deadline}</Text>
          </View>
        </View>
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
  buttonRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '20%'
  },
  buttonColumnContainer: {
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