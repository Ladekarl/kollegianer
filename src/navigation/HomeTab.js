import React from 'react';
import {createAppContainer, createBottomTabNavigator, createMaterialTopTabNavigator} from 'react-navigation';
import ViManglerScreen from '../components/ViMangler';
import OverviewScreen from '../components/Overview';
import colors from '../shared/colors';
import GossipScreen from '../components/Gossip';
import AccountingScreen from '../components/Accounting';
import {Platform} from 'react-native';

const routes = {
    Overview: {
        screen: OverviewScreen
    },
    ViMangler: {
        screen: ViManglerScreen
    },
    Regnskab: {
        screen: AccountingScreen
    },
    Gossip: {
        screen: GossipScreen
    }
};
const config = {
    animationEnabled: true,
    tabBarOptions: {
        activeTintColor: colors.activeTabColor,
        inactiveTintColor: colors.inactiveTabColor,
        tabStyle: {
            backgroundColor: colors.backgroundColor,
        },
        style: {
            paddingTop: Platform.OS === 'ios' ? 20 : 2,
            paddingBottom: Platform.OS === 'ios' ? 20 : 2,
            backgroundColor: colors.backgroundColor,
            elevation: 1
        },
        labelStyle: {
            display: 'none'
        },
        indicatorStyle: {
            backgroundColor: colors.activeDrawerColor
        },
        showIcon: true,
    }
};

const HomeTab = Platform.OS === 'ios' ? createBottomTabNavigator(routes, config) : createMaterialTopTabNavigator(routes, config);

export default createAppContainer(HomeTab);

