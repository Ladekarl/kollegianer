import React from 'react';
import {TabNavigator} from 'react-navigation';
import ViManglerScreen from '../components/ViMangler';
import DutiesScreen from '../components/Duties';
import HomeTabScreen from '../containers/HomeTab';
import HomeScreen from '../containers/Home';

export default HomeTab = TabNavigator({
  Home: {
    screen: HomeScreen
  },
  ViMangler: {
    screen: ViManglerScreen
  },
  Duties: {
    screen: DutiesScreen
  }
});