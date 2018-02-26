import React from 'react';
import {TabNavigator} from 'react-navigation';
import ViManglerScreen from '../components/ViMangler';
import OverviewScreen from '../components/Overview';
import colors from '../shared/colors';
import GossipScreen from '../components/Gossip';
import AccountingScreen from '../components/Accounting';
import {Platform} from 'react-native';

export default HomeTab = TabNavigator({
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
}, {
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
            alignItems: 'center',
            elevation: 1
        },
        labelStyle: {
            display: 'none'
        },
        indicatorStyle: {
            display: 'none'
        },
        showIcon: true,
    }
});