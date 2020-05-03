import React, {Component} from 'react';
import {
  Modal,
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import SettingsList from './SettingsList';
import {strings} from '../shared/i18n';
import colors from '../shared/colors';
import Database from '../storage/Database';
import LocalStorage from '../storage/LocalStorage';
import {SafeAreaView} from 'react-native-safe-area-context';

export default class RequiredSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldShow: false,
    };
  }

  componentDidMount() {
    LocalStorage.getUser().then(localUser => {
      this.localUser = localUser;
      this.toggleShow(true);
    });
  }

  shouldShowSettings = (user, keyphrase) => {
    return (
      !user.name ||
      !user.email ||
      !user.room ||
      !user.duty ||
      !user.keyphrase ||
      user.keyphrase !== keyphrase
    );
  };

  onDonePress = () => {
    this.toggleShow(false);
  };

  toggleShow = shouldShow => {
    const promises = [];

    promises.push(Database.getUser(this.localUser.uid));
    promises.push(Database.getKeyphrase());

    Promise.all(promises).then(([userResponse, keyphraseResponse]) => {
      const user = userResponse.val();
      const keyphrase = keyphraseResponse.val();
      if (user && this.shouldShowSettings(user, keyphrase) === shouldShow) {
        this.setState({
          shouldShow,
        });
      }
    });
  };

  renderViewContainer = elements => {
    return Platform.OS === 'ios' ? (
      <KeyboardAvoidingView style={styles.innerContainer} behavior={'padding'}>
        {elements}
      </KeyboardAvoidingView>
    ) : (
      <View style={styles.innerContainer}>{elements}</View>
    );
  };

  render() {
    const {shouldShow} = this.state;

    const innerContainer = [
      styles.innerContainer,
      {backgroundColor: colors.backgroundColor},
    ];

    const topText = [styles.topText, {color: colors.backgroundColor}];
    const buttonContainer = [
      styles.buttonContainer,
      {color: colors.backgroundColor},
    ];
    return (
      <Modal visible={shouldShow}>
        <SafeAreaView style={styles.safeAreaView} />
        <SafeAreaView style={styles.container} forceInset={{top: 'always'}}>
          {this.renderViewContainer(
            <View style={innerContainer}>
              <View style={styles.topContainer}>
                <Text style={topText}>{strings('settings.fill_required')}</Text>
              </View>
              <View style={styles.settingsContainer}>
                <SettingsList required={true} />
              </View>
              <View style={buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={this.onDonePress}>
                  <Text style={styles.buttonText}>
                    {strings('settings.change_password_modal_ok')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>,
          )}
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  safeAreaView: {flex: 0, backgroundColor: colors.inactiveTabColor},
  innerContainer: {
    flex: 1,
  },
  topContainer: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inactiveTabColor,
  },
  settingsContainer: {
    flex: 1,
  },
  topText: {
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    borderRadius: 50,
    alignItems: 'center',
    flexDirection: 'row',
    width: '80%',
    padding: 18,
    elevation: 5,
    backgroundColor: colors.inactiveTabColor,
  },
  buttonText: {
    color: colors.whiteColor,
    alignSelf: 'center',
    textAlign: 'center',
    flex: 1,
  },
  buttonContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
