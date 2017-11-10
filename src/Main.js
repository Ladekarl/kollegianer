import React from 'react';
import {StackNavigator} from 'react-navigation'
import LoginScreen from './components/Login';
import HomeNavigator from './navigation/HomeNavigator';

import {FontAwesome} from '@expo/vector-icons';
import {TouchableOpacity, View} from "react-native";

export default MainNavigator = StackNavigator({
  Login: {
    screen: LoginScreen,

  },
  Home: {
    screen: HomeNavigator,
    navigationOptions: ({navigation}) => ({
      headerLeft:
        <TouchableOpacity onPress={() => navigation.navigate('DrawerToggle')}>
          <View style={{margin: 10}}>
            <FontAwesome name="navicon" size={20} style={{color: 'black'}}/>
          </View>
        </TouchableOpacity>
    })
  },
  initialRouteName: {screen: LoginScreen},
});