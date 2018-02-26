import React, {Component} from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
    View
} from 'react-native';
import firebase from 'firebase';
import {NavigationActions} from 'react-navigation'
import LocalStorage from '../storage/LocalStorage';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';
import {strings} from '../shared/i18n';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.width / 2;
const IMAGE_HEIGHT_SMALL = window.width / 3;

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

        this.imageHeight = new Animated.Value(IMAGE_HEIGHT);

        const user = firebase.auth().currentUser;
        if (user) {
            this._navigateAndReset('mainFlow');
        }
    }

    componentWillMount() {
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    }

    componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
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

    keyboardWillShow = (event) => {
        Animated.timing(this.imageHeight, {
            duration: event.duration,
            toValue: IMAGE_HEIGHT_SMALL,
        }).start();
    };

    keyboardWillHide = (event) => {
        Animated.timing(this.imageHeight, {
            duration: event.duration,
            toValue: IMAGE_HEIGHT,
        }).start();
    };

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
            this._navigateAndReset('mainFlow');
        }).catch(error => {
            this._stopLoadingAndSetError(error);
        });
    };

    _stopLoadingAndSetError = (error) => {
        this.setState({error: error.message, loading: false});
    };

    _navigateAndReset = (routeName) => {
        const resetAction = NavigationActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({routeName: routeName})],
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
                <View style={styles.loginFormContainer}>
                    <View style={styles.topContainer}>
                        <Animated.Image
                            style={[styles.image, {height: this.imageHeight}]}
                            source={require('../../img/kollegianer.png')}
                        />
                    </View>
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
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{this.state.error}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.loginButton}
                                          onPress={this.onLoginPress}
                                          disabled={this.state.loading}>
                            <Text style={styles.loginButtonText}>{strings('login.login_button')}</Text>
                        </TouchableOpacity>
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
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    innerContainer: {
        flex: 1,
        padding: 20
    },
    topContainer: {
        alignSelf: 'stretch',
        flex: 12,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    loginFormContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        alignSelf: 'stretch',
        margin: 20
    },
    inputContainer: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    elevatedInputContainer: {
        backgroundColor: colors.whiteColor,
        borderRadius: 50,
        elevation: 5,
        marginBottom: 10,
        marginTop: 10,
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
        alignItems: 'center',
        margin: 10
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
        height: IMAGE_HEIGHT,
        alignSelf: 'center',
        resizeMode: 'contain',
        marginBottom: 20,
        padding: 10,
        marginTop: 20
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
        alignSelf: 'center',
        color: colors.errorColor
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        marginBottom: 20
    },
    loginButton: {
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        elevation: 5,
        alignSelf: 'stretch',
        backgroundColor: colors.submitButtonColor
    },
    loginButtonText: {
        color: colors.whiteColor
    },
    icon: {
        fontSize: 20,
        marginLeft: 5,
        marginRight: 5,
        color: colors.inactiveTabColor
    }
});