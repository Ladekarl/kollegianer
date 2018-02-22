import React from 'react';
import {StackNavigator} from 'react-navigation'
import LoginScreen from '../components/Login';
import Drawer from './Drawer';
import colors from '../shared/colors';
import SplashScreen from '../components/SplashScreen';
import Header from '../components/Header';

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
            header: (<Header navigation={navigation}/>)
        })
    },
    initialRouteName: {screen: SplashScreen}
}, {
    navigationOptions: {
        headerStyle: {
            elevation: 0,
            backgroundColor: colors.inactiveTabColor,
            marginBottom: 0,
        },
        headerTintColor: 'white'
    }
});