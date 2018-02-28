import React, {Component} from 'react';
import {ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import LocalStorage from '../storage/LocalStorage';
import {DocumentPicker, DocumentPickerUtil} from 'react-native-document-picker';
import * as Papa from 'papaparse';
import RNFetchBlob from 'react-native-fetch-blob';
import {strings} from '../shared/i18n';

export default class AccountingScreen extends Component {

    static navigationOptions = {
        tabBarLabel: strings('accounting.accounting'),
        tabBarIcon: ({tintColor}) => (
            <Icon name='credit-card' style={{fontSize: 20, height: undefined, width: undefined, color: tintColor}}/>),
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            componentHeight: 0,
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
                    toPay: ''
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
                    toPay: ''
                }
            }
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
                tiers.set('cider', [undefined, undefined, undefined]);
                tiers.set('total', [undefined, undefined, undefined]);
                snapshot.forEach(snap => {
                    let user = snap.val();
                    if (user.beerAccount) {
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
                                    }
                                    else if (key === 'cider') {
                                        if (topCiders < userCiders) {
                                            takeSpot(user, i);
                                            break;
                                        }
                                    }
                                    else if (key === 'total') {
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
                    }
                    if (snap.key === localUser.uid) {
                        if (!user.kitchenAccount) {
                            user.kitchenAccount = this.state.user.kitchenAccount;
                        }
                        if (!user.beerAccount) {
                            user.beerAccount = this.state.user.beerAccount;
                        }
                        this.setState({user: user});
                    }
                });
                this.setState({tiers: tiers});
            });
        });
    };

    _uploadFile = (isKitchen) => {
        DocumentPicker.show({
            filetype: [DocumentPickerUtil.allFiles()],
        }, (error, res) => {
            this._isLoading(true);
            const correctFileType = res && res.type && (res.type === 'text/comma-separated-values' || res.type === 'text/csv');
            const correctFileExtension = res && !res.type && res.fileName && res.fileName.split('.').pop() === 'csv';
            if (!error && (correctFileType || correctFileExtension)) {
                let filePath = Platform.OS === 'ios' ? decodeURI(res.uri.replace('file://', '')) : res.uri;
                this._loadFile(filePath).then(content => {
                    this._parseCsv(content).then(result => {
                        this._updateUsersFromCsv(result.data, isKitchen);
                    }).catch((error) => {
                        this._isLoading(false);
                        console.log(error);
                        Alert.alert(strings('accounting.something_went_wrong'));
                    });
                }).catch((error) => {
                    this._isLoading(false);
                    console.log(error);
                    Alert.alert(strings('accounting.something_went_wrong'));
                });
            } else if (!error) {
                this._isLoading(false);
                Alert.alert(strings('accounting.wrong_file_type'));
            } else {
                this._isLoading(false);
            }
        });
    };

    _isLoading(loading) {
        this.setState({loading: loading});
    }

    _updateUsersFromCsv = (csv, isKitchen) => {
        let index1701, index1702, index1703, index1704, index1705, index1706, index1707, index1708, index1709,
            index1710,
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
                    while (regNr.length < 4) {
                        regNr = '0' + regNr;
                    }
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
            Alert.alert(strings('accounting.something_went_wrong'), strings('accounting.assert_file_type') + '\n' +
                strings('accounting.assert_correct_account'));
        }
        if (updatePromises.length > 0) {
            Promise.all(updatePromises).finally(() => {
                this._isLoading(false);
            });
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

    _getToPayTextStyle() {
        return parseFloat(parseFloat(this.state.user.beerAccount.toPay.trim().split(' ').pop())) > 0 ? styles.columnBigRedText : styles.columnBigGreenText;
    };

    setComponentHeight = (event) => {
        this.setState({componentHeight: event.nativeEvent.layout.height});
    };

    pageHeightStyle = () => {
        return {
            height: this.state.componentHeight
        }
    };

    _onScrollBeginDrag = () => {
        if (Platform.OS === 'ios') return;
        this.hasBegunScrolling = true;
    };

    _onScrollEndDrag = () => {
        if (Platform.OS === 'ios') return;
        if (this.scrollView) {
            const page = Math.floor(this.beginOffset / this.state.componentHeight) + 1;
            const nextPage = this.isScrollingUp ? page - 1 : page;
            const factor = nextPage > 2 ? 2 : nextPage < 0 ? 0 : nextPage;
            const scrollY = this.state.componentHeight * factor;
            this.scrollView.scrollTo({x: 0, y: scrollY, animated: true});
        }
    };

    hasBegunScrolling = false;
    isScrollingUp = false;
    beginOffset = undefined;

    _onScroll = event => {
        if (Platform.OS === 'ios') return;
        const currentOffset = event.nativeEvent.contentOffset.y;
        if (this.hasBegunScrolling) {
            this.beginOffset = currentOffset;
            this.hasBegunScrolling = false;
        }
        const dif = currentOffset - (this.offset || 0);

        this.isScrollingUp = dif < 0;

        this.offset = currentOffset;
    };

    render() {
        return (
            <View style={styles.container} onLayout={this.setComponentHeight}>
                <ScrollView
                    style={styles.container}
                    ref={ref => this.scrollView = ref}
                    onScroll={this._onScroll}
                    pagingEnabled={true}
                    onScrollBeginDrag={this._onScrollBeginDrag}
                    onScrollEndDrag={this._onScrollEndDrag}>
                    <View style={this.pageHeightStyle()}>
                        <View style={styles.sectionHeaderContainer}>
                            <Text style={styles.sectionHeaderText}>{strings('accounting.beer_account')}</Text>
                            {this.state.user && this.state.user.duty.toLowerCase().indexOf('regnskab') !== -1 &&
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={() => this._uploadFile(false)}>
                                <Icon name='cloud-upload' style={styles.uploadImage}/>
                            </TouchableOpacity>}
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.consumption')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.beer')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.beers}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.soda')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.sodas}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.cider')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.ciders}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.with_all')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.ciders +
                            this.state.user.beerAccount.sodas + this.state.user.beerAccount.beers}</Text>
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.status')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.punishment')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.punishment}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.deposit')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.deposit}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.dept')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.dept}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.payed')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.payed}</Text>
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.current')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.deadline')}</Text>
                            <Text style={styles.rightText}>{this.state.user.beerAccount.deadline}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.to_pay')}</Text>
                            <Text style={this._getToPayTextStyle()}>{this.state.user.beerAccount.toPay}</Text>
                        </View>
                        <View style={styles.innerBottomContainer}>
                            <Text style={styles.columnHeadlineText}>{strings('accounting.reg_nr')}</Text>
                            <Text style={styles.innerBottomText}>{this.state.user.beerAccount.regNr}</Text>
                            <Text style={styles.columnHeadlineText}>{strings('accounting.account_nr')}</Text>
                            <Text style={styles.innerBottomText}>{this.state.user.beerAccount.accountNr}</Text>
                        </View>
                    </View>
                    <View style={this.pageHeightStyle()}>
                        <View style={styles.sectionHeaderContainer}>
                            <Text style={styles.sectionHeaderText}>{strings('accounting.kitchen_account')}</Text>
                            {this.state.user && this.state.user.duty.toLowerCase().indexOf('regnskab') !== -1 &&
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={() => this._uploadFile(true)}>
                                <Icon name='cloud-upload' style={styles.uploadImage}/>
                            </TouchableOpacity>}
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.status')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.bought')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.bought}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.shared_expenses')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.sharedExpense}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.dept')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.dept}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.payed')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.payed}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.punishment_basis')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.punishmentBasis}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.punishment')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.punishment}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.deposit')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.deposit}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.other')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.other}</Text>
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.current')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.deadline')}</Text>
                            <Text style={styles.rightText}>{this.state.user.kitchenAccount.deadline}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <Text style={styles.leftText}>{strings('accounting.to_pay')}</Text>
                            <Text
                                style={this._getToPayTextStyle()}>{this.state.user.kitchenAccount.toPay}</Text>
                        </View>
                        <View style={styles.innerBottomContainer}>
                            <Text style={styles.columnHeadlineText}>{strings('accounting.reg_nr')}</Text>
                            <Text style={styles.innerBottomText}>{this.state.user.kitchenAccount.regNr}</Text>
                            <Text style={styles.columnHeadlineText}>{strings('accounting.account_nr')}</Text>
                            <Text style={styles.innerBottomText}>{this.state.user.kitchenAccount.accountNr}</Text>
                        </View>
                    </View>
                    {this.state.tiers &&
                    <View style={this.pageHeightStyle()}>
                        <View style={styles.sectionHeaderContainer}>
                            <Text style={styles.sectionHeaderText}>{strings('accounting.topscorers')}</Text>
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.beer')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.goldIcon}/>
                                <Text style={styles.leftText}>{this.state.tiers.get('beer')[0].beerAccount.beers}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('beer')[0].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.silverIcon}/>
                                <Text style={styles.leftText}>{this.state.tiers.get('beer')[1].beerAccount.beers}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('beer')[1].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.bronzeIcon}/>
                                <Text style={styles.leftText}>{this.state.tiers.get('beer')[2].beerAccount.beers}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('beer')[2].name}</Text>
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.soda')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.goldIcon}/>
                                <Text style={styles.leftText}>{this.state.tiers.get('soda')[0].beerAccount.sodas}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('soda')[0].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.silverIcon}/>
                                <Text style={styles.leftText}>{this.state.tiers.get('soda')[1].beerAccount.sodas}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('soda')[1].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.bronzeIcon}/>
                                <Text style={styles.leftText}>{this.state.tiers.get('soda')[2].beerAccount.sodas}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('soda')[2].name}</Text>
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.cider')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.goldIcon}/>
                                <Text
                                    style={styles.leftText}>{this.state.tiers.get('cider')[0].beerAccount.ciders}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('cider')[0].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.silverIcon}/>
                                <Text
                                    style={styles.leftText}>{this.state.tiers.get('cider')[1].beerAccount.ciders}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('cider')[1].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.bronzeIcon}/>
                                <Text
                                    style={styles.leftText}>{this.state.tiers.get('cider')[2].beerAccount.ciders}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('cider')[2].name}</Text>
                        </View>
                        <View style={styles.innerSectionContainer}>
                            <Text style={styles.innerSectionText}>{strings('accounting.total')}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.goldIcon}/>
                                <Text
                                    style={styles.leftText}>{this.state.tiers.get('total')[0].beerAccount.sodas + this.state.tiers.get('total')[0].beerAccount.ciders
                                + this.state.tiers.get('total')[0].beerAccount.beers}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('total')[0].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.silverIcon}/>
                                <Text
                                    style={styles.leftText}>{this.state.tiers.get('total')[1].beerAccount.sodas + this.state.tiers.get('total')[1].beerAccount.ciders
                                + this.state.tiers.get('total')[1].beerAccount.beers}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('total')[1].name}</Text>
                        </View>
                        <View style={styles.rowContainer}>
                            <View style={styles.topscoreContainer}>
                                <Icon name='trophy' style={styles.bronzeIcon}/>
                                <Text
                                    style={styles.leftText}>{this.state.tiers.get('total')[2].beerAccount.sodas + this.state.tiers.get('total')[2].beerAccount.ciders
                                + this.state.tiers.get('total')[2].beerAccount.beers}</Text>
                            </View>
                            <Text style={styles.rightText}>{this.state.tiers.get('total')[2].name}</Text>
                        </View>
                    </View>
                    }
                    {this.state.loading &&
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size='large' color={colors.inactiveTabColor}/>
                    </View>
                    }
                </ScrollView>
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
        alignItems: 'center',
        marginBottom: 1,
        flex: 1,
        marginTop: 1,
        backgroundColor: colors.whiteColor,
        paddingLeft: 15,
        paddingRight: 15,
    },
    sectionHeaderContainer: {
        flex: 1,
        backgroundColor: colors.inactiveTabColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },
    innerSectionContainer: {
        backgroundColor: colors.backgroundColor,
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },
    buttonContainer: {
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    innerBottomContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: colors.inactiveTabColor
    },
    innerSectionText: {
        fontSize: 16,
        marginLeft: 10
    },
    sectionHeaderText: {
        fontSize: 18,
        color: colors.backgroundColor,
        marginLeft: 10
    },
    innerBottomText: {
        marginLeft: 10,
        marginRight: 10,
        color: colors.backgroundColor
    },
    columnHeadlineText: {
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.backgroundColor,
        marginLeft: 10,
        marginRight: 10
    },
    columnBigRedText: {
        fontSize: 15,
        color: colors.logoutTextColor,
        marginRight: 10,
    },
    columnBigGreenText: {
        fontSize: 15,
        color: colors.darkGreenColor,
        marginRight: 10,
    },
    leftText: {
        marginLeft: 10
    },
    rightText: {
        marginRight: 10,
        color: colors.submitButtonColor
    },
    uploadImage: {
        fontSize: 20,
        height: undefined,
        width: undefined,
        color: colors.backgroundColor
    },
    loadingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    goldIcon: {
        marginRight: 10,
        color: colors.goldColor
    },
    silverIcon: {
        marginRight: 10,
        color: colors.silverColor
    },
    bronzeIcon: {
        marginRight: 10,
        color: colors.bronzeColor
    },
    topscoreContainer: {
        marginLeft: 10,
        flexDirection: 'row'
    }
});