import React, {Component} from 'react';

import {Alert, Image, Picker, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import ModalScreen from './Modal';
import LocalStorage from '../storage/LocalStorage';
import {strings} from '../shared/i18n';
import RequiredSettings from './RequiredSettings';

export default class OverviewScreen extends Component {

    days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    static navigationOptions = {
        tabBarLabel: 'Oversigt',
        tabBarIcon: ({tintColor}) => (
            <Icon name='home' style={{fontSize: 20, height: undefined, width: undefined, color: tintColor}}/>),
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
            fish: '',
            kitchenWeek: '',
            sheriff: '',
            selectedMvp: '',
            selectedShots: '',
            mvpModalVisible: false,
            shotsModalVisible: false,
            pickerItems: [],
            nextBirthdayUsers: []
        };
    }

    _getNearestBirthday = (b1, b2) => {
        const today = new Date();
        let b1Copy = new Date(b1);
        let b2Copy = new Date(b2);

        b1Copy.setFullYear(today.getFullYear());
        b2Copy.setFullYear(today.getFullYear());

        if (b1.getMonth() < today.getMonth() || (b1.getMonth() === today.getMonth() && b1.getDate() < today.getDate())) {
            b1Copy.setFullYear(today.getFullYear() - 1);
        }
        if (b2.getMonth() < today.getMonth() || (b2.getMonth() === today.getMonth() && b2.getDate() < today.getDate())) {
            b2Copy.setFullYear(today.getFullYear() - 1);
        }

        let diffB1 = b1Copy - today;
        let diffB2 = b2Copy - today;

        if (diffB1 < 0 && diffB2 >= 0) {
            return b2;
        } else if (diffB1 >= 0 && diffB2 < 0) {
            return b1;
        } else if (diffB1 > 0 && diffB2 > 0) {
            return diffB1 > diffB2 ? b2 : b1;
        }
    };

    componentDidMount() {
        Database.getUsers().then(snapshot => {
            let kitchenWeek = '';
            let sheriff = '';
            let nextBirthdayDate = '';
            let nextBirthdayUsers = [];

            snapshot.forEach(snap => {
                let user = snap.val();
                if (user.birthday) {
                    let birthdayYearString = user.birthday.split('/').pop();
                    let birthdayYear = parseInt(birthdayYearString);
                    let userBirthday;
                    if (birthdayYear < 100) {
                        birthdayYear = birthdayYear > 50 ? '19' + birthdayYear : '20' + birthdayYear;
                        userBirthday = new Date(user.birthday.replace(/(\d{2})\/(\d{2})\/(\d{2})/, birthdayYear + '-$2-$1'));
                    } else {
                        userBirthday = new Date(user.birthday.replace(/(\d{2})\/(\d{2})\/(\d{4})/, birthdayYear + '-$2-$1'));
                    }
                    if (nextBirthdayUsers.length === 0 || this._getNearestBirthday(userBirthday, nextBirthdayDate) === userBirthday) {
                        if (nextBirthdayDate
                            && nextBirthdayDate.getMonth() === userBirthday.getMonth()
                            && nextBirthdayDate.getDate() === userBirthday.getDate()) {
                            nextBirthdayUsers.push(user);
                        } else {
                            nextBirthdayUsers = [user];
                        }
                        nextBirthdayDate = userBirthday;
                    }
                }
                if (user.kitchenweek) {
                    kitchenWeek = user.name;
                }
                if (user.sheriff) {
                    sheriff = user.name;
                }
            });
            let pickerItems = this._renderPickerItems(snapshot);
            this.setState({
                kitchenWeek,
                sheriff,
                pickerItems,
                nextBirthdayUsers
            });
            LocalStorage.getUser().then(localUser => {
                this.localUser = localUser;
                snapshot.forEach(snap => {
                    const user = snap.val();
                    if (this.localUser.uid === snap.key) {
                        this.remoteUser = user;
                    }
                    if (this.remoteUser && this.remoteUser.kitchenweek && this.remoteUser.sheriff) {
                        this.showAssignSheriffAlert();
                    }
                });
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));

        Database.listenEvents(snapshot => {
            let events = snapshot.val();
            this.currentShots = events.shots;
            this.currentMvp = events.mvp;
            this.setState({
                events,
                selectedMvp: events.mvp,
                selectedShots: events.shots
            });
        }).catch(error => console.log(error));

        Database.listenFish(snapshot => {
            let fish = snapshot.val();
            const fishTime = new Date(fish.timestamp);
            this.setState({
                fish: this.days[fishTime.getDay()] + ' ' + fishTime.getDate() + ' ' + this.months[fishTime.getMonth()] + ' ' + fishTime.getHours() + ':' + fishTime.getMinutes()
            });
        }).catch(error => console.log(error));
    }

    componentWillUnmount() {
        Database.unListenEvents().catch(error => console.log(error));
        Database.unListenFish().catch(error => console.log(error));
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
        this.props.navigation.navigate('Settings');
    };

    _renderPickerItems = (snapshot) => {
        let pickerItems = [];
        snapshot.forEach(child => {
            let user = child.val();
            if (user && user.name) {
                pickerItems.push(
                    <Picker.Item key={child.key} label={user.name} value={user.name}/>
                );
            }
        });
        return pickerItems;
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
        Database.updateEvent('mvp', this.state.selectedMvp).catch(error => console.log(error));
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
        Database.updateEvent('shots', this.state.selectedShots).catch(error => console.log(error));
        this.setShotsModalVisible(false);
    };

    onShotsChange = (itemValue) => {
        this.setState({selectedShots: itemValue});
    };

    columnContainerStyle(value, left, right) {
        return {
            backgroundColor: (value ? colors.darkGreenColor : colors.cancelButtonColor),
            borderBottomLeftRadius: left ? 20 : 0,
            borderBottomRightRadius: right ? 20 : 0,
            flex: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 5
        };
    }

    showBeerpongAlert = () => {
        Alert.alert(
            strings('overview.change_status'),
            strings('overview.change_beerpong_text'),
            [
                {
                    text: strings('overview.modal_cancel'), onPress: () => {
                    }
                },
                {text: strings('overview.modal_ok'), onPress: this.updateBeerPongEvent},
            ],
            {cancelable: false}
        );
    };

    showPartymodeAlert = () => {
        Alert.alert(
            strings('overview.change_status'),
            strings('overview.change_partymode_text'),
            [
                {
                    text: strings('overview.modal_cancel'), onPress: () => {
                    }
                },
                {text: strings('overview.modal_ok'), onPress: this.updatePartyMode},
            ],
            {cancelable: false}
        );
    };

    showFoxAlert() {
        Alert.alert(
            strings('overview.change_status'),
            strings('overview.change_fox_text'),
            [
                {
                    text: strings('overview.modal_cancel'), onPress: () => {
                    }
                },
                {text: strings('overview.modal_ok'), onPress: this.updateFoxEvent},
            ],
            {cancelable: false}
        );
    };

    updateBeerPongEvent = () => {
        let beerpong = !this.state.events.beerpong;
        Database.updateEvent('beerpong', beerpong).catch(error => console.log(error));
    };

    updatePartyMode = () => {
        const partymode = this.state.events.partymode;
        return Database.updateEvent('partymode', partymode.length > 0 ? '' : this.localUser.name)
            .catch(error => console.log(error));
    };

    updateFoxEvent = () => {
        Database.updateEvent('fox', !this.state.events.fox).catch(error => console.log(error));
    };

    _renderBirthdayNames = () => {
        let birthdayNames = [];
        for (let i = 0; i < this.state.nextBirthdayUsers.length; i++) {
            const nextBirthDayUser = this.state.nextBirthdayUsers[i];
            birthdayNames.push(<Text key={nextBirthDayUser.room} numberOfLines={1}
                                     style={styles.text}>{nextBirthDayUser.name}</Text>);
        }
        return birthdayNames;
    };

    render() {
        const {
            fish,
            kitchenWeek,
            sheriff,
            nextBirthdayUsers,
            events,
            mvpModalVisible,
            shotsModalVisible,
            selectedMvp,
            pickerItems,
            selectedShots
        } = this.state;

        const {
            shots,
            mvp,
            beerpong,
            partymode,
            fox
        } = events;

        return (
            <View style={styles.container}>
                <View style={styles.bigRowContainer}>
                    <View style={styles.columnContainer}>
                        <View style={styles.borderlessColumnContainer}>
                            <Image resizeMode='contain' style={styles.image}
                                   source={require('../../img/køkkenuge.png')}/>
                            {!!kitchenWeek &&
                            <Text numberOfLines={2} style={styles.text}>{kitchenWeek}</Text>
                            }
                        </View>
                        <View style={styles.borderlessColumnContainer}>
                            <Image resizeMode='contain' style={styles.image} source={require('../../img/fish.png')}/>
                            <Text numberOfLines={1} style={styles.text}>{strings('overview.last_fed')}</Text>
                            {!!fish &&
                            <Text numberOfLines={2} style={styles.text}>{fish}</Text>
                            }
                        </View>
                    </View>
                    <View style={styles.columnContainer}>
                        <View style={styles.headerContainer}>
                            <Image
                                resizeMode='contain'
                                style={styles.headerImage}
                                source={require('../../img/kollegianer.png')}/>
                        </View>
                    </View>
                    <View style={styles.columnContainer}>
                        <View style={styles.borderlessColumnContainer}>
                            <Image resizeMode='contain' style={styles.image}
                                   source={require('../../img/sheriff.png')}/>
                            {!!sheriff &&
                            <Text numberOfLines={2} style={styles.text}>{sheriff}</Text>
                            }
                        </View>
                        <View style={styles.borderlessColumnContainer}>
                            <Text numberOfLines={1}
                                  style={styles.text}>{nextBirthdayUsers.length > 0 ? nextBirthdayUsers[0].birthday : ''}</Text>
                            <Image resizeMode='contain' style={styles.image}
                                   source={require('../../img/birthday.png')}/>
                            {nextBirthdayUsers && nextBirthdayUsers.length > 0 &&
                            this._renderBirthdayNames()
                            }
                        </View>
                    </View>
                </View>
                <View style={styles.elevatedContainer}>
                    <View style={styles.rowContainer}>
                        <TouchableOpacity
                            style={styles.leftColumnContainer}
                            onPress={() => this.setShotsModalVisible(true)}>
                            <Image resizeMode='contain' style={styles.image}
                                   source={require('../../img/keep_calm_and_shots.png')}/>
                            {!!shots &&
                            <Text numberOfLines={2} style={styles.text}>{shots}</Text>
                            }
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rightColumnContainer}
                            onPress={() => this.setMvpModalVisible(true)}>
                            <Image resizeMode='contain' style={styles.image} source={require('../../img/mvp.png')}/>
                            {!!mvp &&
                            <Text numberOfLines={2} style={styles.text}>{mvp}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowContainer}>
                        <TouchableOpacity
                            style={this.columnContainerStyle(beerpong, true)}
                            onPress={this.updateBeerPongEvent}>
                            <Text style={styles.whiteText}>{strings('overview.beerpong_button')}</Text>
                            <Image resizeMode='contain' style={styles.image}
                                   source={require('../../img/beerpong.png')}/>
                            <Text numberOfLines={2}
                                  style={styles.whiteText}>{beerpong ? strings('overview.beerpong_button_true') : strings('overview.beerpong_button_false')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.columnContainerStyle(partymode && partymode.length > 0)}
                            onPress={this.updatePartyMode}>
                            <Text style={styles.whiteText}>{strings('overview.partymode_button')}</Text>
                            <Image resizeMode='contain' style={styles.image}
                                   source={require('../../img/party_mode.png')}/>
                            <Text numberOfLines={2}
                                  style={styles.whiteText}>{partymode && partymode.length > 0 ? partymode : strings('overview.partymode_button_false')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.columnContainerStyle(fox, false, true)}
                            onPress={this.updateFoxEvent}>
                            <Text style={styles.whiteText}>{strings('overview.fox_button')}</Text>
                            <Image resizeMode='contain' style={styles.image} source={require('../../img/fox.png')}/>
                            <Text numberOfLines={2}
                                  style={styles.whiteText}>{fox ? strings('overview.fox_button_true') : strings('overview.fox_button_false')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ModalScreen
                    modalTitle={strings('overview.modal_choose_person')}
                    onCancel={this.onMvpCancel}
                    onSubmit={this.onMvpSubmit}
                    onPickerValueChange={this.onMvpChange}
                    pickerItems={pickerItems}
                    selectedPickerValue={selectedMvp}
                    visible={mvpModalVisible}
                    isPicker={true}
                />
                <ModalScreen
                    onPickerValueChange={this.onShotsChange}
                    selectedPickerValue={selectedShots}
                    pickerItems={pickerItems}
                    modalTitle={strings('overview.modal_choose_person')}
                    visible={shotsModalVisible}
                    onSubmit={this.onShotsSubmit}
                    onCancel={this.onShotsCancel}
                    isPicker={true}
                />
                <RequiredSettings/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    leftColumnContainer: {
        borderColor: colors.lightGreyColor,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 5
    },
    rightColumnContainer: {
        borderColor: colors.lightGreyColor,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 5
    },
    borderlessColumnContainer: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
        alignItems: 'center',
        margin: 2,
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
    elevatedContainer: {
        flex: 2,
        backgroundColor: colors.whiteColor,
        justifyContent: 'center',
        alignItems: 'flex-start',
        elevation: 10,
        margin: 20,
        borderRadius: 20
    },
    bigRowContainer: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch'
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch'
    },
    columnContainer: {
        flex: 1,
        justifyContent: 'center',
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
        textAlign: 'center',
    },
    whiteText: {
        textAlign: 'center',
        color: colors.whiteColor
    },
    textHeader: {
        textAlign: 'center',
        fontWeight: 'bold'
    }
});