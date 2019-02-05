import React, {Component} from 'react';

import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import firebase from 'react-native-firebase';
import {StackActions, NavigationActions} from 'react-navigation';

import LocalStorage from '../storage/LocalStorage';
import Icon from 'react-native-fa-icons';
import colors from '../shared/colors';

export default class LogoutScreen extends Component {

    static navigationOptions = {
        title: 'Log ud',
        drawerLabel: (() => <Text style={{
            color: colors.logoutTextColor,
            fontWeight: 'bold',
            marginLeft: 17,
            marginTop: 15,
            marginBottom: 15
        }}>Log ud</Text>),
        drawerIcon: ({tintColor}) => (<Icon name='sign-out' style={{
            fontSize: 20,
            color: colors.logoutIconColor,
            marginTop: 15,
            marginBottom: 15
        }}/>),
        headerTitleStyle: {
            fontSize: 15,
            tintColor: colors.logoutColor
        },
        labelStyle: {
            color: colors.logoutColor,
            tintColor: colors.logoutColor
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: '',
        };
    }

    componentDidMount = () => {
        const user = firebase.auth().currentUser;
        if (user) {
            this._logoutAndRedirect();
        } else {
            this._redirectToLogin();
        }
    };

    _logoutAndRedirect = () => {
        this.setState({loading: true});
        firebase.auth().signOut()
            .then(() => {
                LocalStorage.removeUser().then(() => {
                    this.setState({error: '', loading: false});
                    this._redirectToLogin();
                }).catch((error) => {
                    this.setState({error: error.message, loading: false});
                });
            })
            .catch((error) => {
                this.setState({error: error.message, loading: false});
            });
    };

    _redirectToLogin = () => {
        const resetAction = StackActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({routeName: 'loginFlow'})],
        });
        this.props.navigation.dispatch(resetAction);
    };

    render() {
        return (
            <View style={styles.container}>
                <Text>{this.state.error}</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator animating={true}
                                       style={this.state.loading ? {opacity: 1} : {opacity: 0}}
                                       size='large'/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
});