import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../shared/colors';
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import {strings} from '../shared/i18n';
import * as NavigationHelpers from '../shared/NavigationHelpers';
import {SafeAreaView} from 'react-native-safe-area-context';

export default class DrawerScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        name: '',
      },
    };
  }

  componentDidMount() {
    this._getUser();
  }

  navigateToScreen = route => () => {
    const {routes, index} = this.props.state;
    let currentRoute = this.props.state.name;
    if (routes && routes.length > 0 && index < routes.length) {
      currentRoute = routes[index].name;
    }

    if (currentRoute !== route) {
      NavigationHelpers.navigate(this.props.navigation, route);
    } else {
      this.closeDrawer();
    }
  };

  _getUser = () => {
    LocalStorage.getUser().then(user => {
      this.localUser = user;
      Database.getUser(user.uid).then(snapshot => {
        this.setState({user: snapshot.val()});
      });
    });
  };

  closeDrawer = () => {
    this.props.navigation.closeDrawer();
  };

  render() {
    const {user} = this.state;
    const headerIconContainer = [
      styles.headerIconContainer,
      {backgroundColor: colors.backgroundColor},
    ];
    const headerText = [styles.headerText, {color: colors.backgroundColor}];
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableWithoutFeedback onPress={this.closeDrawer}>
            <View style={styles.headerIconTextContainer}>
              <View style={headerIconContainer}>
                <Icon name="user" style={styles.headerIcon} />
              </View>
              {!!user.name && (
                <Text numberOfLines={3} style={headerText}>
                  {user.name}
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.divider} />
        <ScrollView style={styles.drawerItemsContainer}>
          <TouchableOpacity onPress={this.navigateToScreen('Home')}>
            <Text style={styles.drawerItemText}>{strings('drawer.home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.navigateToScreen('Residents')}>
            <Text style={styles.drawerItemText}>
              {strings('drawer.residents')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.footerIconContainer}
            onPress={this.navigateToScreen('Settings')}>
            <Icon name="cog" style={styles.footerIcon} />
            <Text style={styles.footerText}>{strings('drawer.settings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerIconContainer}
            onPress={this.navigateToScreen('Logout')}>
            <Icon name="sign-out" style={styles.footerIcon} />
            <Text style={styles.footerText}>{strings('drawer.logout')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    flexDirection: 'column',
  },
  headerContainer: {
    flex: 0.5,
    justifyContent: 'center',
    backgroundColor: colors.inactiveTabColor,
  },
  headerIconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerItemsContainer: {
    flex: 3,
    paddingTop: 15,
  },
  drawerItemText: {
    fontSize: 20,
    marginLeft: 80,
    marginTop: 15,
    marginBottom: 15,
    color: colors.inactiveTabColor,
  },
  headerIconContainer: {
    height: 55,
    width: 55,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 20,
    borderRadius: 100,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerIconContainer: {
    marginTop: 10,
    marginBottom: 20,
    marginRight: 40,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 35,
    height: undefined,
    width: undefined,
    color: colors.inactiveTabColor,
  },
  footerIcon: {
    fontSize: 25,
    height: undefined,
    width: undefined,
    color: colors.inactiveTabColor,
    margin: 5,
  },
  headerText: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    maxWidth: 170,
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.backgroundColor,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 12,
    color: colors.inactiveTabColor,
  },
});
