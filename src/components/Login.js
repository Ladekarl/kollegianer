import React, {Component} from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import firebase from 'firebase';
import {NavigationActions} from 'react-navigation'
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import FitImage from 'react-native-fit-image';
import colors from '../shared/colors';
import Icon from "react-native-fa-icons";

export default class LoginScreen extends Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: '',
            loading: false,
        };

        const user = firebase.auth().currentUser;
        if (user) {
            this._navigateAndReset();
        }
    }

    componentDidMount() {
        LocalStorage.getUser().then(user => {
            if (user && user.email && user.password) {
                this.setState({email: user.email, password: user.password});
                this._login(user.email, user.password)
            }
        }).catch(error => {
            this.setState({error: error.message})
        });
    }

    onLoginPress = () => {
        Keyboard.dismiss();
        const {email, password} = this.state;
        this._login(email.trim(), password);
    };

    _login = (email, password) => {
        this.setState({error: '', loading: true});
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((user) => {
                Database.getUser(user.uid).then(snapshot => {
                    const dbUser = snapshot.val();
                    if (!dbUser) {
                        this._stopLoadingAndSetError('User did not exist in database');
                        return;
                    }
                    LocalStorage.getFcmToken().then(fcmToken => {
                        if (fcmToken && fcmToken.token) {
                            if (!dbUser.notificationTokens) {
                                dbUser.notificationTokens = [];
                            }
                            let tokenFound = false;
                            dbUser.notificationTokens.forEach(t => {
                                if (t.token && String(t.token).valueOf() == String(fcmToken.token).valueOf()) {
                                    tokenFound = true;
                                }
                            });
                            if (!tokenFound) {
                                dbUser.notificationTokens.push(fcmToken);
                            }
                            Database.updateUser(user.uid, dbUser);
                        }
                    }).finally(() => {
                        dbUser.uid = user.uid;
                        dbUser.password = password;
                        this._saveUserAndNavigate(dbUser);
                    });
                }).catch(error => {
                    this._stopLoadingAndSetError(error)
                });
            }).catch(error => {
            this._stopLoadingAndSetError(error)
        });
    };

    _saveUserAndNavigate = (dbUser) => {
        LocalStorage.setUser(dbUser).then(() => {
            this.setState({error: '', loading: false});
            this._navigateAndReset();
        }).catch(error => {
            this._stopLoadingAndSetError(error);
        });
    };

    _stopLoadingAndSetError = (error) => {
        this.setState({error: error.message, loading: false});
    };

    _navigateAndReset = () => {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: 'Drawer'})],
        });
        this.props.navigation.dispatch(resetAction);
    };

    _renderIos = () => {
        return (
            <KeyboardAvoidingView style={styles.container} behavior='padding'>
                {this._renderShared()}
            </KeyboardAvoidingView>
        );
    };

    _renderAndroid = () => {
        return (
            <View style={styles.container}>
                {this._renderShared()}
            </View>
        );
    };

    _renderShared = () => {
        return (
            <View style={styles.innerContainer}>
                <View style={styles.topContainer}>
                    <FitImage
                        resizeMode='contain'
                        style={styles.image}
                        source={require('../../img/kollegianer.png')}
                    />
                </View>
                <View style={styles.keyboardAvoidContainer}>
                    <View style={styles.loginFormContainer}>
                        <View style={styles.inputContainer}>
                            <View style={styles.elevatedInputContainer}>
                                <Icon name={'user'} style={styles.icon}/>
                                <TextInput style={styles.usernameInput}
                                           placeholder='Email'
                                           keyboardType='email-address'
                                           autoCapitalize='none'
                                           textAlignVertical={'center'}
                                           editable={!this.state.loading}
                                           underlineColorAndroid='transparent'
                                           selectionColor={colors.inactiveTabColor}
                                           value={this.state.email}
                                           onChangeText={email => this.setState({email})}/>
                            </View>
                            <View style={styles.elevatedInputContainer}>
                                <Icon name={'lock'} style={styles.icon}/>
                                <TextInput style={styles.passwordInput}
                                           secureTextEntry={true}
                                           textAlignVertical={'center'}
                                           editable={!this.state.loading}
                                           autoCapitalize='none'
                                           underlineColorAndroid='transparent'
                                           selectionColor={colors.inactiveTabColor}
                                           placeholder='Password'
                                           value={this.state.password}
                                           onChangeText={password => this.setState({password})}/>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.loginButton}
                                          onPress={this.onLoginPress}
                                          disabled={this.state.loading}>
                            <Text style={styles.loginButtonText}>LOG IND</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{this.state.error}</Text>
                    </View>
                </View>
                {this.state.loading &&
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color={colors.inactiveTabColor} style={{elevation: 10}}/>
                </View>
                }
            </View>
        );
    };

    render() {
        if (Platform.OS === 'ios') {
            return this._renderIos();
        } else {
            return this._renderAndroid();
        }
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    innerContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
        paddingLeft: 20,
        paddingRight: 20
    },
    keyboardAvoidContainer: {
        flex: 1
    },
    topContainer: {
        marginTop: '40%',
        marginLeft: '10%',
        marginRight: '10%',
        position: 'absolute',
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginFormContainer: {
        flex: 5,
        justifyContent: 'flex-end'
    },
    inputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    elevatedInputContainer: {
        width: '90%',
        backgroundColor: colors.whiteColor,
        borderRadius: 50,
        elevation: 5,
        marginBottom: 20,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 3,
        paddingBottom: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorContainer: {
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
    },
    image: {
        flex: 1,
        alignSelf: 'stretch',
        width: undefined,
        height: undefined,
        opacity: 0.8
    },
    usernameInput: {
        flex: 1,
        fontSize: 16,
        padding: 5,
        marginTop: 1,
        marginBottom: 1
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        padding: 5,
        marginTop: 1,
        marginBottom: 1
    },
    errorText: {
        textAlign: 'center',
        color: colors.errorColor
    },
    loginButton: {
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        width: '90%',
        elevation: 5,
        alignSelf: 'center',
        backgroundColor: colors.submitButtonColor
    },
    loginButtonText: {
        color: colors.whiteColor
    },
    icon: {
        fontSize: 20,
        marginLeft: 5,
        marginRight: 5,
    }
});