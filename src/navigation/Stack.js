import React from 'react';
import {StackNavigator} from 'react-navigation'
import LoginScreen from '../components/Login';
import Drawer from './Drawer';

import {TouchableOpacity, View} from 'react-native';
import SettingsScreen from '../components/Settings';
import Icon from 'react-native-fa-icons';
import colors from '../shared/colors';
import SplashScreen from '../components/SplashScreen';

export default Stack = StackNavigator({
  SplashScreen: {
    screen: SplashScreen
  },
  Login: {
    screen: LoginScreen
  },
  Drawer: {
    screen: Drawer,
    navigationOptions: ({navigation}) => ({
      headerLeft:
        <TouchableOpacity onPress={() => navigation.navigate('DrawerToggle')}>
          <View style={{marginLeft: 20}}>
            <Icon name='navicon' style={{fontSize: 20, color: 'white'}}/>
          </View>
        </TouchableOpacity>,
      headerRight:
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <View style={{marginRight: 20}}>
            <Icon name='cog' style={{fontSize: 20, color: 'white'}}/>
          </View>
        </TouchableOpacity>,
      headerTitleStyle: {
        fontSize: 18
      }
    })
  },
  Settings: {
    screen: SettingsScreen,
  },
  initialRouteName: {screen: SplashScreen}
}, {
  navigationOptions: {
    headerStyle: {
      elevation: 0,
      backgroundColor: colors.activeTabColor,
      marginBottom: 0,
    },
    headerTintColor: 'white'
  }
});