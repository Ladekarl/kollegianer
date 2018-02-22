import React from 'react';
import {DrawerNavigator} from 'react-navigation';
import LogoutScreen from '../components/Logout';
import HomeScreen from '../containers/Home';
import colors from '../shared/colors';
import ResidentsScreen from '../components/Residents';
import SettingsScreen from '../components/Settings';
import DrawerScreen from '../components/Drawer';

export default Drawer = DrawerNavigator({
    Home: {
        screen: HomeScreen
    },
    Residents: {
        screen: ResidentsScreen
    },
    Settings: {
        screen: SettingsScreen
    },
    Logout: {
        screen: LogoutScreen
    }
}, {
    contentOptions: {
        activeBackgroundColor: colors.modalBackgroundColor,
        activeTintColor: colors.activeDrawerColor,
        inactiveTintColor: colors.inactiveTabColor
    },
    contentComponent: DrawerScreen
});