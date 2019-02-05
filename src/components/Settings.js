import React, {Component} from 'react';
import {strings} from '../shared/i18n';
import SettingsList from './SettingsList';

export default class SettingsScreen extends Component {

    static navigationOptions = {
        title: strings('settings.settings'),
        headerTitleStyle: {
            fontSize: 18
        }
    };

    render() {
        return (
            <SettingsList required={false}/>
        );
    }

}