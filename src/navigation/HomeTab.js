import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import ViManglerScreen from '../components/ViMangler';
import OverviewScreen from '../components/Overview';
import colors from '../shared/colors';
import GossipScreen from '../components/Gossip';
import AccountingScreen from '../components/Accounting';
import {Platform} from 'react-native';
import Icon from 'react-native-fa-icons';
import {strings} from '../shared/i18n';

const overviewOptions = {
  tabBarLabel: strings('overview.overview'),
  tabBarIcon: ({color}) => (
    <Icon
      name="home"
      style={{
        fontSize: 20,
        height: undefined,
        width: undefined,
        color: color,
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
        fontSize: 20,
        height: undefined,
        width: undefined,
        color: color,
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
        fontSize: 20,
        height: undefined,
        width: undefined,
        color: color,
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
        fontSize: 20,
        height: undefined,
        width: undefined,
        color: color,
      }}
    />
  ),
};

const tabBarOptions = {
  activeTintColor: colors.activeTabColor,
  inactiveTintColor: colors.inactiveTabColor,
  tabStyle: {
    backgroundColor: colors.backgroundColor,
  },
  style: {
    backgroundColor: colors.backgroundColor,
    elevation: 1,
  },
  labelStyle: {
    display: 'none',
  },
  indicatorStyle: {
    backgroundColor: colors.activeDrawerColor,
  },
  showIcon: true,
};

const TopTabs = createMaterialTopTabNavigator();
const BottomTabs = createBottomTabNavigator();

function HomeTopTabs() {
  return (
    <TopTabs.Navigator
      tabBarOptions={tabBarOptions}
      initialRouteName="Overview">
      <TopTabs.Screen
        name="Overview"
        component={OverviewScreen}
        options={overviewOptions}
      />
      <TopTabs.Screen
        name="ViMangler"
        component={ViManglerScreen}
        options={viManglerOptions}
      />
      <TopTabs.Screen
        name="Regnskab"
        component={AccountingScreen}
        options={regnskabOptions}
      />
      <TopTabs.Screen
        name="Gossip"
        component={GossipScreen}
        options={gossipOptions}
      />
    </TopTabs.Navigator>
  );
}

function HomeBottomTabs() {
  return (
    <BottomTabs.Navigator
      tabBarOptions={tabBarOptions}
      initialRouteName="Overview">
      <BottomTabs.Screen
        name="Overview"
        component={OverviewScreen}
        options={overviewOptions}
      />
      <BottomTabs.Screen
        name="ViMangler"
        component={ViManglerScreen}
        options={viManglerOptions}
      />
      <BottomTabs.Screen
        name="Regnskab"
        component={AccountingScreen}
        options={regnskabOptions}
      />
      <BottomTabs.Screen
        name="Gossip"
        component={GossipScreen}
        options={gossipOptions}
      />
    </BottomTabs.Navigator>
  );
}

const HomeTab = Platform.OS === 'ios' ? HomeBottomTabs : HomeTopTabs;

export default HomeTab;
