import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, Platform} from 'react-native';
import PropTypes from 'prop-types';
import {NavigationActions} from 'react-navigation';
import Icon from 'react-native-fa-icons';
import colors from '../shared/colors';
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import {strings} from '../shared/i18n';

export default class DrawerScreen extends Component {

    static propTypes = {
        navigation: PropTypes.object.isRequired
    };
    
    navigator;

    constructor(props) {
        super(props);
        this.state = {
            user: {
                name: '',
            }
        }
    }

    componentDidMount() {
        this._getUser();
    }

    navigateToScreen = (route) => () => {
        let currentRoute = this.navigator.state.key;

        if(currentRoute !== route) {
            const navigateAction = NavigationActions.navigate({
                routeName: route
            });
            this.navigator.dispatch(navigateAction);
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
        this.navigator.navigate('DrawerClose');
    };

    render() {
        this.navigator = this.props.navigation;
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableWithoutFeedback onPress={this.closeDrawer}>
                        <View style={styles.headerIconTextContainer}>
                            <View style={styles.headerIconContainer}>
                                <Icon name='user' style={styles.headerIcon}/>
                            </View>
                            <Text numberOfLines={2}
                                  style={styles.headerText}>{this.state.user.name}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View style={styles.divider}/>
                <ScrollView style={styles.drawerItemsContainer}>
                    <TouchableOpacity onPress={this.navigateToScreen('Home')}>
                        <Text style={styles.drawerItemText}>{strings('drawer.home')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.navigateToScreen('Residents')}>
                        <Text style={styles.drawerItemText}>{strings('drawer.residents')}</Text>
                    </TouchableOpacity>
                </ScrollView>
                <View style={styles.footerContainer}>
                    <TouchableOpacity style={styles.footerIconContainer} onPress={this.navigateToScreen('Settings')}>
                        <Icon name='cog' style={styles.footerIcon}/>
                        <Text>{strings('drawer.settings')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerIconContainer} onPress={this.navigateToScreen('Logout')}>
                        <Icon name='sign-out' style={styles.footerIcon}/>
                        <Text>{strings('drawer.logout')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    headerContainer: {
        flex: 0.5,
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'ios' ? colors.inactiveTabColor : colors.backgroundColor
    },
    headerIconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    drawerItemsContainer: {
        flex: 3,
        paddingTop: 15
    },
    drawerItemText: {
        fontSize: 20,
        marginLeft: 80,
        marginTop: 15,
        marginBottom: 15
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
        backgroundColor: Platform.OS === 'ios' ? colors.backgroundColor : colors.inactiveTabColor
    },
    footerIconContainer: {
        marginTop: 10,
        marginBottom: 20,
        marginRight: 40,
        marginLeft: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerIcon: {
        fontSize: 35,
        height: undefined,
        width: undefined,
        color: Platform.OS === 'ios' ? colors.inactiveTabColor : colors.backgroundColor
    },
    footerIcon: {
        fontSize: 25,
        height: undefined,
        width: undefined,
        color: colors.inactiveTabColor,
        margin: 5
    },
    headerText: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 15,
        color: Platform.OS === 'ios' ? colors.backgroundColor : colors.inactiveTabColor
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth
    }
});