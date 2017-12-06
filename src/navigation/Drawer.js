import React from 'react';
import {DrawerNavigator} from 'react-navigation';
import LogoutScreen from '../components/Logout';
import HomeTabScreen from "../containers/HomeTab";

export default Drawer = DrawerNavigator({
  Home: {
    screen: HomeTabScreen
  },
  Logout: {screen: LogoutScreen}
});