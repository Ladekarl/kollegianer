import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../components/SplashScreen';
import LoginScreen from '../components/Login';
import LogoutScreen from '../components/Logout';
import SettingsScreen from '../components/Settings';
import ResidentsScreen from '../components/Residents';
import DrawerScreen from '../components/Drawer';
import colors from '../shared/colors';
import {Text} from 'react-native';
import Icon from 'react-native-fa-icons';
import React from 'react';
import Header from '../components/Header';
import HomeTab from './HomeTab';
import {strings} from '../shared/i18n';

const defaultPageNavigationOptions = {
  headerTitleStyle: {
    fontSize: 17,
    color: colors.backgroundColor,
  },
  headerStyle: {
    backgroundColor: colors.inactiveTabColor,
  },
  headerTintColor: colors.backgroundColor,
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeTab}
        options={{
          header: ({navigation}) => <Header navigation={navigation} />,
        }}
      />
    </Stack.Navigator>
  );
}

function ResidentsStack() {
  return (
    <Stack.Navigator initialRouteName="Residents">
      <Stack.Screen
        name="Residents"
        component={ResidentsScreen}
        options={{
          title: strings('residents.residents'),
          drawerIcon: ({tintColor}) => (
            <Icon name="users" style={{fontSize: 15, color: tintColor}} />
          ),
          ...defaultPageNavigationOptions,
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...defaultPageNavigationOptions,
        }}
      />
    </Stack.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerPosition="left"
      drawerType="slide"
      drawerContent={props => <DrawerScreen {...props} />}
      initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Residents" component={ResidentsStack} />
      <Drawer.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          title: strings('settings.settings'),
          headerTitleStyle: {
            fontSize: 18,
          },
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          title: strings('drawer.logout'),
          drawerLabel: () => (
            <Text
              style={{
                color: colors.logoutTextColor,
                fontWeight: 'bold',
                marginLeft: 17,
                marginTop: 15,
                marginBottom: 15,
              }}>
              {strings('drawer.logout')}
            </Text>
          ),
          drawerIcon: ({tintColor}) => (
            <Icon
              name="sign-out"
              style={{
                fontSize: 20,
                color: colors.logoutIconColor,
                marginTop: 15,
                marginBottom: 15,
              }}
            />
          ),
          headerTitleStyle: {
            fontSize: 15,
            tintColor: colors.logoutColor,
          },
          labelStyle: {
            color: colors.logoutColor,
            tintColor: colors.logoutColor,
          },
        }}
      />
    </Drawer.Navigator>
  );
}

function LoginStack() {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function AppNavigation() {
  return (
    <Stack.Navigator initialRouteName="loginFlow">
      <Stack.Screen
        name="loginFlow"
        component={LoginStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="mainFlow"
        component={MainDrawer}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default AppNavigation;
