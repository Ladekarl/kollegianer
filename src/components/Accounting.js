import React, {Component} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import LocalStorage from "../storage/LocalStorage";
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
      loading: false,
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
      },
    };
  }

  usersSnapshot;

  componentDidMount() {
    this._getUser();
  }

  _getUser = () => {
    LocalStorage.getUser().then(localUser => {
      Database.listenUsers(snapshot => {
        this.usersSnapshot = snapshot;
        let tiers = new Map();
        tiers.set('beer', [undefined, undefined, undefined]);
        tiers.set('soda', [undefined, undefined, undefined]);
        tiers.set('total', [undefined, undefined, undefined]);
        snapshot.forEach(snap => {
          let user = snap.val();
          if (!user.beerAccount) {
            return;
          }
          tiers.forEach((item, key, mapObj) => {
            for (let i = 0; i < item.length; i++) {
              const takeSpot = (user, fromIndex) => {
                if (fromIndex + 1 < item.length) {
                  takeSpot(item[fromIndex], fromIndex + 1);
                  item[fromIndex + 1] = item[fromIndex];
                }
                item[fromIndex] = user;
              };

              let userBeerAccount = user.beerAccount;
              const userBeers = userBeerAccount.beers ? parseInt(userBeerAccount.beers) : 0;
              const userSodas = userBeerAccount.sodas ? parseInt(userBeerAccount.sodas) : 0;
              const userCiders = userBeerAccount.ciders ? parseInt(userBeerAccount.ciders) : 0;
              user.beerAccount.beers = userBeers;
              user.beerAccount.sodas = userSodas;
              user.beerAccount.ciders = userCiders;

              if (item[i]) {
                let itemBeerAccount = item[i].beerAccount;
                const topBeers = itemBeerAccount.beers ? parseInt(itemBeerAccount.beers) : 0;
                const topSodas = itemBeerAccount.sodas ? parseInt(itemBeerAccount.sodas) : 0;
                const topCiders = itemBeerAccount.ciders ? parseInt(itemBeerAccount.ciders) : 0;

                if (key === 'beer') {
                  if (topBeers < userBeers) {
                    takeSpot(user, i);
                    break;
                  }
                } else if (key === 'soda') {
                  if (topSodas < userSodas) {
                    takeSpot(user, i);
                    break;
                  }
                } else if (key === 'total') {
                  if (topBeers + topSodas + topCiders <
                    userBeers + userSodas + userCiders) {
                    takeSpot(user, i);
                    break;
                  }
                }
              }
              else {
                item[i] = user;
                mapObj.set(key, item);
                break;
              }
              mapObj.set(key, item);
            }
          });
          if (snap.key === localUser.uid) {
            if (!user.kitchenAccount) {
              user.kitchenAccount = {
                toPay: '',
                deadline: ''
              };
            }
            this.setState({user: user});
          }
        });
        this.setState({tiers: tiers});
      });
    });
  };

  _uploadFile = (isKitchen) => {
    this._isLoading(true);
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles()],
    }, (error, res) => {
      if (!error && res && (res.type === 'text/comma-separated-values' || res.type === 'text/csv')) {
        this._loadFile(res.uri).then(content => {
          this._parseCsv(content).then(result => {
            this._updateUsersFromCsv(result.data, isKitchen);
          }).catch(() => {
            this._isLoading(false);
            Alert.alert('Noget gik galt');
          });
        }).catch(() => {
          this._isLoading(false);
          Alert.alert('Noget gik galt');
        });
      } else if (!error) {
        this._isLoading(false);
        Alert.alert('Filen skal være af typen CSV UTF-8');
      }
    });
  };

  _isLoading(loading) {
    this.setState({loading: loading});
  }

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
          regNr = '0' + row[j + 1];
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

    let updatePromises = [];
    // Ølregnskab check
    if (!isKitchen && index1701 !== undefined && index1702 !== undefined && index1703 !== undefined && index1704 !== undefined && index1705 !== undefined && index1706 !== undefined && index1707 !== undefined
      && index1708 !== undefined && index1709 !== undefined && index1710 !== undefined && index1711 !== undefined && index1712 !== undefined && index1713 !== undefined && index1714 !== undefined && accountNr !== undefined
      && regNr !== undefined && roomIndex !== undefined && beerIndex && sodaIndex && ciderIndex && cocioIndex && consumptionIndex && deptIndex
      && depositIndex !== undefined && payedIndex !== undefined && punishmentIndex !== undefined && toPayIndex !== undefined && deadline !== undefined) {
      // SAVE User data

      this.usersSnapshot.forEach(snap => {
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
          updatePromises.push(Database.updateUser(snap.key, user));
        }
      });
      updatePromises.push(Database.updateBeerAccount(csv));
    }
    // Køkkenregnskab check
    else if (isKitchen !== undefined && index1701 !== undefined && index1702 !== undefined && index1703 !== undefined && index1704 !== undefined && index1705 !== undefined && index1706 !== undefined && index1707 !== undefined
      && index1708 !== undefined && index1709 !== undefined && index1710 !== undefined && index1711 !== undefined && index1712 !== undefined && index1713 !== undefined && index1714 !== undefined && accountNr !== undefined && regNr !== undefined
      && roomIndex !== undefined && deptIndex !== undefined && depositIndex !== undefined && payedIndex !== undefined && punishmentIndex !== undefined && toPayIndex !== undefined
      && sharedExpenseIndex !== undefined && otherIndex !== undefined && boughtIndex !== undefined && punishmentBasisIndex !== undefined) {
      this.usersSnapshot.forEach(snap => {
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
          updatePromises.push(Database.updateUser(snap.key, user));
        }
      });
      updatePromises.push(Database.updateKitchenAccount(csv));
    }
    else {
      Alert.alert('Noget gik galt', 'Er du sikker på filen er i CSV UTF-8 format?\n' +
        'Er du sikker på at du uploadede det rigtige regnskab?');
    }
    if (updatePromises.length > 0) {
      Promise.all(updatePromises).finally(() => {
        this._isLoading(false);
      })
    } else {
      this._isLoading(false);
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

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.borderedInnerContainer}>
          <View style={styles.innerTopContainer}>
            <Text style={styles.innerTopText}>Ølregnskab</Text>
            {this.state.user && this.state.user.duty.toLowerCase().indexOf('regnskab') !== -1 &&
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => this._uploadFile(false)}>
              <Icon name='cloud-upload' style={styles.uploadImage}/>
            </TouchableOpacity>}
          </View>
          <View style={styles.rowContainer}>
            <View style={styles.largeColumnContainer}>
              <Text style={styles.columnHeadlineText}>{'Du skylder'}</Text>
              <Text style={styles.columnBigRedText}>{this.state.user.beerAccount.toPay}</Text>
            </View>
            <View style={styles.largeColumnContainer}>
              <Text style={styles.columnHeadlineText}>{'Deadline'}</Text>
              <Text style={styles.columnBigText}>{this.state.user.beerAccount.deadline}</Text>
            </View>
            <View style={styles.columnContainer}>
              <View style={styles.innerRowContainer}>
                <Text style={styles.columnHeadlineText}>{'Øl'}</Text>
                <Text style={styles.innerRowText}>{this.state.user.beerAccount.beers}</Text>
              </View>
              <View style={styles.innerRowContainer}>
                <Text style={styles.columnHeadlineText}>{'Sodavand'}</Text>
                <Text style={styles.innerRowText}>{this.state.user.beerAccount.sodas}</Text>
              </View>
              <View style={styles.innerRowContainer}>
                <Text style={styles.columnHeadlineText}>{'Cider'}</Text>
                <Text style={styles.innerRowText}>{this.state.user.beerAccount.ciders}</Text>
              </View>
              <View style={styles.innerRowContainer}>
                <Text style={styles.columnHeadlineText}>{'Straf'}</Text>
                <Text style={styles.innerRowText}>{this.state.user.beerAccount.punishment}</Text>
              </View>
            </View>
          </View>
          <View style={styles.innerBottomContainer}>
            <Text style={styles.columnHeadlineText}>{'Reg nr:'}</Text>
            <Text style={styles.innerBottomText}>{this.state.user.beerAccount.regNr}</Text>
            <Text style={styles.columnHeadlineText}>{'Konto nr:'}</Text>
            <Text style={styles.innerBottomText}>{this.state.user.beerAccount.accountNr}</Text>
          </View>
        </View>
        <View style={styles.borderedInnerContainer}>
          <View style={styles.innerTopContainer}>
            <Text style={styles.innerTopText}>Køkkenregnskab</Text>
            {this.state.user && this.state.user.duty.toLowerCase().indexOf('regnskab') !== -1 &&
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => this._uploadFile(true)}>
              <Icon name='cloud-upload' style={styles.uploadImage}/>
            </TouchableOpacity>}
          </View>
          <View style={styles.rowContainer}>
            <View style={styles.largeColumnContainer}>
              <Text style={styles.columnHeadlineText}>{'Du skylder'}</Text>
              <Text style={styles.columnBigRedText}>{this.state.user.kitchenAccount.toPay}</Text>
            </View>
            <View style={styles.largeColumnContainer}>
              <Text style={styles.columnHeadlineText}>{'Deadline'}</Text>
              <Text style={styles.columnBigText}>{this.state.user.kitchenAccount.deadline}</Text>
            </View>
            <View style={styles.columnContainer}>
              <Text style={styles.columnHeadlineText}>{'Straf'}</Text>
              <Text style={styles.columnBigText}>{this.state.user.kitchenAccount.punishment}</Text>
            </View>
          </View>
          <View style={styles.innerBottomContainer}>
            <Text style={styles.columnHeadlineText}>{'Reg nr:'}</Text>
            <Text style={styles.innerBottomText}>{this.state.user.kitchenAccount.regNr}</Text>
            <Text style={styles.columnHeadlineText}>{'Konto nr:'}</Text>
            <Text style={styles.innerBottomText}>{this.state.user.kitchenAccount.accountNr}</Text>
          </View>
        </View>
        <View style={styles.innerContainer}>
          <View style={styles.innerTopContainer}>
            <Text style={styles.innerTopText}>Topscorere</Text>
          </View>
          <View style={styles.rowContainer}>
            <View style={styles.borderedColumnContainer}>
              <Text style={styles.columnHeadlineText}>Øl</Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('beer')[0].beerAccount.beers + ' ' + this.state.tiers.get('beer')[0].name}
              </Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('beer')[1].beerAccount.beers + ' ' + this.state.tiers.get('beer')[1].name}
              </Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('beer')[2].beerAccount.beers + ' ' + this.state.tiers.get('beer')[2].name}
              </Text>
            </View>
            <View style={styles.borderedColumnContainer}>
              <Text style={styles.columnHeadlineText}>Sodavand</Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('soda')[0].beerAccount.sodas + ' ' + this.state.tiers.get('soda')[0].name}
              </Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('soda')[1].beerAccount.sodas + ' ' + this.state.tiers.get('soda')[1].name}
              </Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('soda')[2].beerAccount.sodas + ' ' + this.state.tiers.get('soda')[2].name}
              </Text>
            </View>
            <View style={styles.borderedColumnContainer}>
              <Text style={styles.columnHeadlineText}>Total</Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('total')[0].beerAccount.sodas + this.state.tiers.get('total')[0].beerAccount.ciders
                + this.state.tiers.get('total')[0].beerAccount.beers + ' ' + this.state.tiers.get('total')[0].name}</Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('total')[1].beerAccount.sodas + this.state.tiers.get('total')[1].beerAccount.ciders
                + this.state.tiers.get('total')[1].beerAccount.beers + ' ' + this.state.tiers.get('total')[1].name}</Text>
              <Text style={styles.columnText}>
                {this.state.tiers && this.state.tiers.get('total')[2].beerAccount.sodas + this.state.tiers.get('total')[2].beerAccount.ciders
                + this.state.tiers.get('total')[2].beerAccount.beers + ' ' + this.state.tiers.get('total')[2].name}</Text>
            </View>
          </View>
        </View>
        {this.state.loading &&
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.activeTabColor}/>
        </View>
        }
      </View>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: colors.backgroundColor,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 3
  },
  innerRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 5,
    alignItems: 'center',
  },
  innerContainer: {
    flex: 3,
    margin: 5
  },
  borderedInnerContainer: {
    flex: 3,
    borderColor: colors.overviewIconColor,
    borderWidth: 1,
    borderRadius: 2,
    margin: 5
  },
  borderedColumnContainer: {
    borderColor: colors.overviewIconColor,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    flex: 3,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 5,
    padding: 5
  },
  columnContainer: {
    flex: 3,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  largeColumnContainer: {
    flex: 4,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center'
  },
  buttonRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
    marginLeft: 10,
    alignItems: 'center',
  },
  innerTopContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: colors.overviewIconColor
  },
  innerBottomContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.8,
    backgroundColor: colors.bottomAccountingBoxColor
  },
  innerTopText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.backgroundColor
  },
  innerBottomText: {
    marginLeft: 10,
    marginRight: 10
  },
  uploadText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'white'
  },
  columnHeadlineText: {
    fontWeight: 'bold',
    textAlign: 'center'
  },
  columnBigRedText: {
    fontSize: 25,
    color: colors.logoutTextColor,
    marginTop: 10,
    marginBottom: 10
  },
  columnBigText: {
    fontSize: 25,
    marginTop: 10,
    marginBottom: 10
  },
  columnText: {
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  innerRowText: {
    alignSelf: 'center',
    fontSize: 14
  },
  uploadImage: {
    fontSize: 20,
    height: undefined,
    width: undefined,
    color: 'white'
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});