import React, {Component} from 'react';

import {Alert, Picker, StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
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
            kitchenWeek: '',
            sheriff: '',
            selectedMvp: '',
            selectedShots: '',
            mvpModalVisible: false,
            shotsModalVisible: false,
            pickerItems: [],
            nextBirthdayUsers: []
        };

        Database.getUsers().then(snapshot => {
            let kitchenWeek = '';
            let sheriff = '';
            let nextBirthdayDate = '';
            let nextBirthdayUsers = [];

            snapshot.forEach(snap => {
                let user = snap.val();
                let birthdayYear = user.birthday.split('/').pop();
                birthdayYear = parseInt(birthdayYear) > 50 ? '19' + birthdayYear : '20' + birthdayYear;

                const userBirthday = new Date(user.birthday.replace(/(\d{2})\/(\d{2})\/(\d{2})/, birthdayYear + '-$2-$1'));
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
            LocalStorage.getUser().then(user => {
                this.localUser = user;
                snapshot.forEach(snap => {
                    if (user.kitchenweek && user.sheriff && snap.key === this.localUser.uid) {
                        this.showAssignSheriffAlert();
                    }
                });
            });
        });
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
        Database.listenEvents(snapshot => {
            let events = snapshot.val();
            this.currentShots = events.shots;
            this.currentMvp = events.mvp;
            this.setState({
                events,
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
        );
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
                {text: 'Skift', onPress: this.updatePartyMode},
            ],
            {cancelable: false}
        );
    };

    showFoxAlert() {
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

    updatePartyMode = () => {
        this._togglePartyLights();
    };

    updateFoxEvent = () => {
        Database.updateEvent('fox', !this.state.events.fox);
    };

    _togglePartyLights = () => {
        return fetch('https://se2-openhab04.compute.dtu.dk/rest/items/Dtu4Plug_Switch', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'text/plain',
                Authorization: 'Basic ' + Base64.btoa('group-d:hunter2')
            },
            body: this.state.events.partymode.length > 0 ? 'OFF' : 'ON'
        }).then(() => {
            const partymode = this.state.events.partymode;
            Database.updateEvent('partymode', partymode.length > 0 ? '' : this.localUser.name).catch(error => console.log(error));
        });
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
        return (
            <View style={styles.container}>
                <View style={styles.rowContainer}>
                    <View style={styles.headerContainer}>
                        <Image
                            resizeMode='contain'
                            style={styles.headerImage}
                            source={require('../../img/kollegianer.png')}/>
                    </View>
                </View>
                <View style={styles.rowContainer}>
                    <View style={styles.borderlessColumnContainer}>
                        <Image resizeMode='contain' style={styles.image}
                                  source={require('../../img/køkkenuge.png')}/>
                        <Text numberOfLines={2} style={styles.text}>{this.state.kitchenWeek}</Text>
                    </View>
                    <View style={styles.borderlessColumnContainer}>
                        <Image resizeMode='contain' style={styles.image}
                                  source={require('../../img/sheriff.png')}/>
                        <Text numberOfLines={2} style={styles.text}>{this.state.sheriff}</Text>
                    </View>
                    <View style={styles.borderlessColumnContainer}>
                        <Text numberOfLines={1}
                              style={styles.text}>{this.state.nextBirthdayUsers.length > 0 ? this.state.nextBirthdayUsers[0].birthday : ''}</Text>
                        <Image resizeMode='contain' style={styles.image}
                                  source={require('../../img/birthday.png')}/>
                        {this._renderBirthdayNames()}
                    </View>
                </View>
                <View style={styles.elevatedContainer}>
                    <View style={styles.rowContainer}>
                        <TouchableOpacity
                            style={styles.leftColumnContainer}
                            onPress={() => this.setShotsModalVisible(true)}>
                            <Image resizeMode='contain' style={styles.image}
                                      source={require('../../img/keep_calm_and_shots.png')}/>
                            <Text numberOfLines={2} style={styles.text}>{this.state.events.shots}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rightColumnContainer}
                                          onPress={() => this.setMvpModalVisible(true)
                                          }>
                            <Image resizeMode='contain' style={styles.image} source={require('../../img/mvp.png')}/>
                            <Text numberOfLines={2} style={styles.text}>{this.state.events.mvp}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowContainer}>
                        <TouchableOpacity
                            style={this.columnContainerStyle(this.state.events.beerpong, true)}
                            onPress={this.updateBeerPongEvent}>
                            <Text style={styles.whiteText}>Beer pong på coxk</Text>
                            <Image resizeMode='contain' style={styles.image}
                                      source={require('../../img/beerpong.png')}/>
                            <Text numberOfLines={2}
                                  style={styles.whiteText}>{this.state.events.beerpong ? 'Jaaa Daa!' : 'Nah fam'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.columnContainerStyle(this.state.events.partymode.length > 0)}
                            onPress={this.updatePartyMode}>
                            <Text style={styles.whiteText}>PARTY MODE</Text>
                            <Image resizeMode='contain' style={styles.image}
                                      source={require('../../img/party_mode.png')}/>
                            <Text numberOfLines={2}
                                  style={styles.whiteText}>{this.state.events.partymode.length > 0 ? this.state.events.partymode : 'später mein freund'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.columnContainerStyle(this.state.events.fox, false, true)}
                            onPress={this.updateFoxEvent}>
                            <Text style={styles.whiteText}>Øl-ræven</Text>
                            <Image resizeMode='contain' style={styles.image} source={require('../../img/fox.png')}/>
                            <Text numberOfLines={2}
                                  style={styles.whiteText}>{this.state.events.fox ? 'ofc på 1700' : 'Nope, dsværd'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ModalScreen
                    modalTitle='Vælg en person'
                    onCancel={this.onMvpCancel}
                    onSubmit={this.onMvpSubmit}
                    onPickerValueChange={this.onMvpChange}
                    pickerItems={this.state.pickerItems}
                    selectedPickerValue={this.state.selectedMvp}
                    visible={this.state.mvpModalVisible}
                    isPicker={true}
                />
                <ModalScreen
                    onPickerValueChange={this.onShotsChange}
                    selectedPickerValue={this.state.selectedShots}
                    pickerItems={this.state.pickerItems}
                    modalTitle='Vælg en person'
                    visible={this.state.shotsModalVisible}
                    onSubmit={this.onShotsSubmit}
                    onCancel={this.onShotsCancel}
                    isPicker={true}
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