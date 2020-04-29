import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import SettingsList from './SettingsList';
import Icon from 'react-native-fa-icons';
import colors from '../shared/colors';

export default class SettingsScreen extends Component {
  componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{
            height: 35,
            width: 35,
            marginLeft: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => this.props.navigation.openDrawer()}>
          <Icon
            name="navicon"
            style={{
              fontSize: 20,
              height: undefined,
              width: undefined,
              color: colors.backgroundColor,
            }}
          />
        </TouchableOpacity>
      ),
    });
  }

  render() {
    return <SettingsList required={false} navigation={this.props.navigation} />;
  }
}
