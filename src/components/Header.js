import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '../shared/colors';
import PropTypes from 'prop-types';
import Icon from 'react-native-fa-icons';
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
    return (
      <SafeAreaView style={styles.safeAreaView} forceInset={{top: 'never'}}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.openDrawer}>
            <Icon name="bars" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Kollegianer</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.openSettings}>
            <Icon name="cog" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    paddingBottom: 0,
    justifyContent: 'flex-end',
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
  },
  headerText: {
    fontSize: 17,
    color: colors.backgroundColor,
    fontWeight: 'bold',
  },
  headerButton: {
    height: 35,
    width: 35,
    borderRadius: 100,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inactiveTabColor,
  },
  icon: {
    fontSize: 20,
    height: undefined,
    width: undefined,
    color: colors.backgroundColor,
  },
});
