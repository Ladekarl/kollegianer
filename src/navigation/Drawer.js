import React from 'react';
import {DrawerNavigator} from 'react-navigation';
import LogoutScreen from '../components/Logout';
import HomeScreen from '../containers/Home';
import colors from '../shared/colors';

export default Drawer = DrawerNavigator({
  Home: {
    screen: HomeScreen
  },
  Logout: {screen: LogoutScreen}
}, {
  contentOptions: {
    activeBackgroundColor: colors.modalBackgroundColor,
    activeTintColor: colors.activeDrawerColor,
    inactiveTintColor: colors.inactiveTabColor
  }
});