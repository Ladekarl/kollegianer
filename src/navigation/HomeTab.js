import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import ViManglerScreen from '../components/ViMangler';
import OverviewScreen from '../components/Overview';
import colors from '../shared/colors';
import GossipScreen from '../components/Gossip';
import AccountingScreen from '../components/Accounting';
import {Platform, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {strings} from '../shared/i18n';

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
    height: undefined,
    width: undefined,
  },
});

const overviewOptions = {
  tabBarLabel: strings('overview.overview'),
  tabBarIcon: ({color}) => (
    <Icon
      name="home"
      style={{
        color,
        ...styles.tabIcon,
      }}
    />
  ),
};

const gossipOptions = {
  tabBarLabel: strings('gossip.gossip'),
  tabBarIcon: ({color}) => (
    <Icon
      name="heartbeat"
      style={{
        color,
        ...styles.tabIcon,
      }}
    />
  ),
};

const viManglerOptions = {
  tabBarLabel: strings('vi_mangler.vi_mangler'),
  tabBarIcon: ({color}) => (
    <Icon
      name="shopping-cart"
      style={{
        color,
        ...styles.tabIcon,
      }}
    />
  ),
};

const regnskabOptions = {
  tabBarLabel: strings('accounting.accounting'),
  tabBarIcon: ({color}) => (
    <Icon
      name="credit-card"
      style={{
        color,
        ...styles.tabIcon,
      }}
    />
  ),
};

const tabBarOptions = {
  activeTintColor: colors.activeTabColor,
  inactiveTintColor: colors.inactiveTabColor,
  labelStyle: {
    display: 'none',
  },
  indicatorStyle: {
    backgroundColor: colors.activeDrawerColor,
  },
  showIcon: true,
};

const Tabs =
  Platform.OS === 'ios'
    ? createBottomTabNavigator()
    : createMaterialBottomTabNavigator();

function HomeTab() {
  return (
    <Tabs.Navigator tabBarOptions={tabBarOptions} initialRouteName="Overview">
      <Tabs.Screen
        name="Overview"
        component={OverviewScreen}
        options={overviewOptions}
      />
      <Tabs.Screen
        name="ViMangler"
        component={ViManglerScreen}
        options={viManglerOptions}
      />
      <Tabs.Screen
        name="Regnskab"
        component={AccountingScreen}
        options={regnskabOptions}
      />
      <Tabs.Screen
        name="Gossip"
        component={GossipScreen}
        options={gossipOptions}
      />
    </Tabs.Navigator>
  );
}

export default HomeTab;
