import React, {Component} from 'react';
import {Modal, View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import SettingsList from './SettingsList';
import {strings} from '../shared/i18n';
import colors from '../shared/colors';
import Database from '../storage/Database';
import LocalStorage from '../storage/LocalStorage';

export default class RequiredSettings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            shouldShow: false
        };
    }

    componentDidMount() {
        LocalStorage.getUser().then(localUser => {
            this.localUser = localUser;
            Database.getUser(localUser.uid).then(response => {
                const user = response.val();
                if (user && this.shouldShowSettings(user)) {
                    this.setState({
                        shouldShow: true
                    });
                }
            });
        });
    }

    shouldShowSettings = (user) => {
        return !user.name || !user.email || !user.birthday || !user.room || !user.duty;
    };

    onDonePress = () => {
        Database.getUser(this.localUser.uid).then(response => {
            const user = response.val();
            if (user && !this.shouldShowSettings(user)) {
                this.setState({
                    shouldShow: false
                });
            }
        });
    };


    render() {
        const {shouldShow} = this.state;
        return (
            <Modal
                visible={shouldShow}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <Text style={styles.topText}>{strings('settings.fill_required')}</Text>
                    </View>
                    <SettingsList required={true}/>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={this.onDonePress}>
                            <Text style={styles.buttonText}>{strings('settings.change_password_modal_ok')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    topContainer: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.inactiveTabColor
    },
    topText: {
        textAlign: 'center',
        color: colors.backgroundColor,
        fontSize: 18
    },
    button: {
        borderRadius: 50,
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
        width: '80%',
        padding: 18,
        elevation: 5,
        backgroundColor: colors.inactiveTabColor,
        marginBottom: 20
    },
    buttonText: {
        color: colors.whiteColor,
        alignSelf: 'center',
        textAlign: 'center',
        flex: 1
    },
    buttonContainer: {
        backgroundColor: colors.backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
