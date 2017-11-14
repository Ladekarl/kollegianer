import React from 'react';
import {StackNavigator} from 'react-navigation'
import LoginScreen from './components/Login';
import HomeNavigator from './navigation/HomeNavigator';

import {FontAwesome} from '@expo/vector-icons';
import {TouchableOpacity, View} from 'react-native';
import SettingsScreen from './components/Settings';

export default MainNavigator = StackNavigator({
  Login: {
    screen: LoginScreen,

  },
  Home: {
    screen: HomeNavigator,
    navigationOptions: ({navigation}) => ({
      headerLeft:
        <TouchableOpacity onPress={() => navigation.navigate('DrawerToggle')}>
          <View style={{marginLeft: 20}}>
            <FontAwesome name='navicon' size={20} style={{color: 'black'}}/>
          </View>
        </TouchableOpacity>,
      headerRight:
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <View style={{marginRight: 20}}>
            <FontAwesome name='cog' size={20} style={{color: 'black'}}/>
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
  initialRouteName: {screen: LoginScreen},
});