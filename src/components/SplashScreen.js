import React, {Component} from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import LocalStorage from '../storage/LocalStorage';
import colors from '../shared/colors';
import firebase from 'react-native-firebase';
import Database from '../storage/Database';
import {navigateAndReset, navigateOnNotification} from '../shared/NavigationHelpers';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.width / 2;

export default class SplashScreen extends Component {

    static navigationOptions = {
        header: null
    };

    componentDidMount() {
        this.props.screenProps.getInitialNotification().then(notification => {
            console.log('Launched from notification');
            if (notification) {
                this._signIn().then(() => {
                    navigateOnNotification(this.props.navigation, notification.notification);
                    this.props.screenProps.removeInitialNotification(notification);
                });
            }
        }).catch(error => {
            console.log(error);
            this._signIn();
        });
    }

    _signIn = () => {
        return LocalStorage.getUser().then(user => {
            if (user && user.email && user.uid) {
                if (user.accessToken) {
                    return this._signInFacebook();
                } else if (user.password) {
                    return this._signInEmail();
                } else {
                    return navigateAndReset(this.props.navigation, 'Login');
                }
            } else {
                navigateAndReset(this.props.navigation, 'Login');
            }
        }).catch(() => {
                navigateAndReset(this.props.navigation, 'Login');
            }
        );
    };

    _signInEmail = () => {
        return LocalStorage.getUser().then(user => {
            return firebase.auth().signInWithEmailAndPassword(user.email, user.password).then((response) => {
                this._onSignInSuccess(response, user.password, user.accessToken);
            }).catch(() => {
                navigateAndReset(this.props.navigation, 'Login');
            });
        }).catch(error => console.log(error));
    };

    _signInFacebook = () => {
        return LocalStorage.getUser().then(user => {
            const credential = firebase.auth.FacebookAuthProvider.credential(user.accessToken);
            firebase.auth().signInWithCredential(credential).then((response) => {
                this._onSignInSuccess(response, user.password, user.accessToken);
            }).catch(() => {
                navigateAndReset(this.props.navigation, 'Login');
            });
        }).catch(error => console.log(error));
    };

    _onSignInSuccess = (response, password, accessToken) => {
        const user = response.user;
        Database.getUser(user.uid).then(snapshot => {
            const dbUser = snapshot.val();
            if (!dbUser) {
                return Database.addUser(user).then(() => {
                    return Database.getUser(user.uid);
                });
            }
            return snapshot;
        }).then((response) => {
            const dbUser = response.val();
            LocalStorage.getFcmToken().then(fcmToken => {
                if (fcmToken && fcmToken.token) {
                    let notificationTokens = dbUser.notificationTokens ?? [];
                    let tokenFound = false;
                    notificationTokens.forEach(t => {
                        if (t.token && String(t.token).valueOf() == String(fcmToken.token).valueOf()) {
                            tokenFound = true;
                        }
                    });
                    if (!tokenFound) {
                        notificationTokens.push(fcmToken);
                    }
                    Database.updateUser(user.uid, {
                        notificationTokens
                    }).catch(error => console.log(error));
                }
            });
            dbUser.uid = user.uid;
            dbUser.password = password;
            dbUser.accessToken = accessToken;
            this._saveUserAndNavigate(dbUser);
        }).catch(error => {
            console.log(error);
        });
    };

    _saveUserAndNavigate = (dbUser) => {
        LocalStorage.setUser(dbUser).then(() => {
            navigateAndReset(this.props.navigation, 'mainFlow', true);
        }).catch(error => {
            console.log(error);
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <Image
                        resizeMode='contain'
                        style={styles.image}
                        source={require('../../img/kollegianer.png')}
                    />
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
        backgroundColor: colors.backgroundColor,
        ...StyleSheet.absoluteFill
    },
    image: {
        flex: 1,
        height: IMAGE_HEIGHT,
        alignSelf: 'center',
        opacity: 0.8
    }
});