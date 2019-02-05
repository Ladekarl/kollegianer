import React, {Component} from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import LocalStorage from '../storage/LocalStorage';
import colors from '../shared/colors';
import {StackActions, NavigationActions} from 'react-navigation';
import firebase from 'react-native-firebase';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.width / 2;

export default class SplashScreen extends Component {

    static navigationOptions = {
        header: null
    };

    componentDidMount() {
        this.props.screenProps.getInitialNotification().then(notification => {
            this.props.screenProps.setInitialNotification(undefined);
            if (notification) {
                this._signIn();
            }
        }).catch(() => {
            LocalStorage.getUser().then(user => {
                if (user && user.email && user.uid) {
                    if (user.accessToken) {
                        this._navigateAndReset('mainFlow');
                        this._signInFacebook();
                    } else if (user.password) {
                        this._navigateAndReset('mainFlow');
                        this._signIn();
                    } else {
                        this._navigateAndReset('Login', true);
                    }
                } else {
                    this._navigateAndReset('Login', true);
                }
            }).catch(() => {
                    this._navigateAndReset('Login', true);
                }
            );
        });
    }

    _signIn = () => {
        LocalStorage.getUser().then(user => {
            firebase.auth().signInWithEmailAndPassword(user.email, user.password).catch(() => {
                this._navigateAndReset('Login', true);
            });
        }).catch(error => console.log(error));
    };

    _signInFacebook = () => {
        LocalStorage.getUser().then(user => {
            const credential = firebase.auth.FacebookAuthProvider.credential(user.accessToken);
            firebase.auth().signInWithCredential(credential).catch(() => {
                this._navigateAndReset('Login', true);
            });
        }).catch(error => console.log(error));
    };

    _navigateAndReset = (routeName, isNested) => {
        let resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: routeName})],
        });
        if (!isNested) {
            resetAction.key = null;
        }
        this.props.navigation.dispatch(resetAction);
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <View style={styles.topContainer}>
                        <Image
                            resizeMode='contain'
                            style={styles.image}
                            source={require('../../img/kollegianer.png')}
                        />
                    </View>
                </View>
            </View>
        );
    };
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    innerContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: 'center',
    },
    topContainer: {
        marginTop: '10%',
        marginBottom: '20%',
        marginLeft: '10%',
        marginRight: '10%',
        position: 'absolute',
        width: '100%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        flex: 1,
        height: IMAGE_HEIGHT,
        alignSelf: 'center',
        opacity: 0.8
    }
});