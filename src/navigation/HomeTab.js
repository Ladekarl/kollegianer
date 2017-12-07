import React from 'react';
import {StyleSheet} from 'react-native';
import {TabNavigator} from 'react-navigation';
import ViManglerScreen from '../components/ViMangler';
import DutiesScreen from '../components/Duties';
import OverviewScreen from '../components/Overview';
import colors from '../shared/colors';

export default HomeTab = TabNavigator({
  Home: {
    screen: OverviewScreen
  },
  ViMangler: {
    screen: ViManglerScreen
  },
  Duties: {
    screen: DutiesScreen
  }
}, {
  animationEnabled: true,
  tabBarOptions: {
    activeTintColor: colors.activeTabColor,
    inactiveTintColor: colors.inactiveTabColor,
    tabStyle: {
      backgroundColor: 'white',
      elevation: 0
    },
    style: {
      paddingTop: 2,
      backgroundColor: 'white',
      elevation: 0,
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    labelStyle: {
      fontSize: 10,
      marginBottom: 2
    },
    indicatorStyle: {
      display: 'none'
    },
    showIcon: true,
  }
});