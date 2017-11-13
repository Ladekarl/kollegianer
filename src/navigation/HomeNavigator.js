import React from 'react';
import {DrawerNavigator} from 'react-navigation'
import HomeScreen from '../containers/Home';
import LogoutScreen from '../components/Logout';
import ViManglerScreen from '../components/ViMangler';
import DutiesScreen from '../components/Duties';

export default MainNavigator = DrawerNavigator({
  Home: {
    screen: HomeScreen
  },
  ViMangler: {
    screen: ViManglerScreen
  },
  Duties: {
    screen: DutiesScreen
  },
  Logout: {screen: LogoutScreen}
});