import {DrawerNavigator, StackNavigator} from 'react-navigation';
import SplashScreen from '../components/SplashScreen';
import LoginScreen from '../components/Login';
import LogoutScreen from '../components/Logout';
import SettingsScreen from '../components/Settings';
import ResidentsScreen from '../components/Residents';
import DrawerScreen from '../components/Drawer';
import colors from '../shared/colors';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-fa-icons';
import React from 'react';
import Header from '../components/Header';
import HomeScreen from '../containers/Home';

const defaultPageNavigationOptions = ({navigation}) => ({
    headerLeft:
        <TouchableOpacity style={{
            height: 35,
            width: 35,
            marginLeft: 20,
            justifyContent: 'center',
            alignItems: 'center',
        }} onPress={() => navigation.navigate('DrawerToggle')}>
            <Icon name='navicon' style={{
                fontSize: 20,
                height: undefined,
                width: undefined,
                color: colors.inactiveTabColor
            }}/>
        </TouchableOpacity>,
    headerTitleStyle: {
        fontSize: 18,
        color: colors.inactiveTabColor
    },
    headerStyle: {
        elevation: 1,
        backgroundColor: colors.backgroundColor,
        margin: 0,
        padding: 0
    },
    headerTintColor: colors.inactiveTabColor
});

const homeNavigationOptions = ({navigation}) => ({
    headerMode: 'none',
    header: (<Header navigation={navigation}/>),
    title: 'Hjem',
    drawerIcon: ({tintColor}) => (<Icon name='home' style={{fontSize: 15, color: tintColor}}/>),
    headerTitleStyle: {
        fontSize: 18
    },
});

export default AppNavigation = StackNavigator({
    loginFlow: {
        screen: StackNavigator({
            SplashScreen: {screen: SplashScreen},
            Login: {screen: LoginScreen},
        }, {headerMode: 'none'})
    },
    mainFlow: {
        screen: DrawerNavigator({
            Home: {
                screen: StackNavigator({
                    Home: {screen: HomeScreen, navigationOptions: homeNavigationOptions}
                })
            },
            Residents: {
                screen: StackNavigator({
                    Residents: {screen: ResidentsScreen, navigationOptions: defaultPageNavigationOptions}
                })
            },
            Settings: {
                screen: StackNavigator({
                    Settings: {screen: SettingsScreen, navigationOptions: defaultPageNavigationOptions}
                })
            },
            Logout: {screen: LogoutScreen}
        }, {
            contentComponent: DrawerScreen,
            contentOptions: {
                activeBackgroundColor: colors.modalBackgroundColor,
                activeTintColor: colors.activeDrawerColor,
                inactiveTintColor: colors.inactiveTabColor
            }
        })
    }
}, {headerMode: 'none'});