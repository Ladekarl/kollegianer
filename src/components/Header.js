import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Platform} from 'react-native';
import colors from '../shared/colors';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import {SafeAreaView} from 'react-native-safe-area-context';

export default class HeaderScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
  }

  openDrawer = () => {
    this.props.navigation.openDrawer();
  };

  openSettings = () => {
    this.props.navigation.navigate('Settings');
  };

  render() {
    const headerText = [styles.headerText, {color: colors.backgroundColor}];
    const icon = [styles.icon, {color: colors.backgroundColor}];
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.openDrawer}>
            <Icon name="bars" style={icon} />
          </TouchableOpacity>
          <Text style={headerText}>Kollegianer</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.openSettings}>
            <Icon name="cog" style={icon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    paddingBottom: 0,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.inactiveTabColor,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    height: Platform.select({ios: 45, android: 56}),
  },
  headerText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerButton: {
    height: 35,
    width: 35,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inactiveTabColor,
  },
  icon: {
    fontSize: 20,
    height: undefined,
    width: undefined,
  },
});
