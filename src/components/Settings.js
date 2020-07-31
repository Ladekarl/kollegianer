import React, {Component} from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import SettingsList from './SettingsList';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../shared/colors';

export default class SettingsScreen extends Component {
  componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => this.props.navigation.openDrawer()}>
          <Icon
            name="navicon"
            style={[styles.headerIcon, {color: colors.backgroundColor}]}
          />
        </TouchableOpacity>
      ),
    });
  }

  render() {
    return <SettingsList required={false} navigation={this.props.navigation} />;
  }
}

const styles = StyleSheet.create({
  headerButton: {
    height: 35,
    width: 35,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    height: undefined,
    width: undefined,
  },
});
