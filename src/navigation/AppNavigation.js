import {createAppContainer, createStackNavigator, createDrawerNavigator} from 'react-navigation';
import SplashScreen from '../components/SplashScreen';
import LoginScreen from '../components/Login';
import LogoutScreen from '../components/Logout';
import SettingsScreen from '../components/Settings';
import ResidentsScreen from '../components/Residents';
import DrawerScreen from '../components/Drawer';
import colors from '../shared/colors';
import {TouchableOpacity, Platform} from 'react-native';
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
        }} onPress={() => navigation.openDrawer()}>
            <Icon name='navicon' style={{
                fontSize: 20,
                height: undefined,
                width: undefined,
                color: Platform.OS === 'ios' ? colors.backgroundColor : colors.inactiveTabColor
            }}/>
        </TouchableOpacity>,
    headerTitleStyle: {
        fontSize: 20,
        color: Platform.OS === 'ios' ? colors.backgroundColor : colors.inactiveTabColor
    },
    headerStyle: {
        elevation: 1,
        backgroundColor: Platform.OS === 'ios' ? colors.inactiveTabColor : colors.backgroundColor,
        margin: 0,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0
    },
    headerTintColor: Platform.OS === 'ios' ? colors.backgroundColor : colors.inactiveTabColor
});

const homeNavigationOptions = ({navigation}) => ({
    headerMode: 'none',
    header: (<Header navigation={navigation}/>),
});

const AppNavigation = createAppContainer(
    createStackNavigator({
    loginFlow: {
        screen: createStackNavigator({
            SplashScreen: {screen: SplashScreen},
            Login: {screen: LoginScreen},
        }, {headerMode: 'none'})
    },
    mainFlow: {
        screen: createDrawerNavigator({
            Home: {
                screen: createStackNavigator({
                    Home: {screen: HomeScreen, navigationOptions: homeNavigationOptions}
                })
            },
            Residents: {
                screen: createStackNavigator({
                    Residents: {screen: ResidentsScreen, navigationOptions: defaultPageNavigationOptions}
                })
            },
            Settings: {
                screen: createStackNavigator({
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
}, {headerMode: 'none'}));

export default AppNavigation;