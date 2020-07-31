import React, {Component} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import {strings} from '../shared/i18n';
import LocalStorage from '../storage/LocalStorage';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class ResidentsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderUsers: [],
      localUser: null,
    };
  }

  componentDidMount() {
    this.getUsers();
    this.props.navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => this.props.navigation.openDrawer()}>
          <Icon
            name="navicon"
            style={[styles.headerIcon, {color: colors.backgroundColor}]}
          />
        </TouchableOpacity>
      ),
    });
  }

  getUsers = () => {
    LocalStorage.getUser().then(localUser => {
      Database.getUsers().then(snapshot => {
        this.users = snapshot;
        this.setState({
          renderUsers: this.renderUsers(localUser),
        });
      });
    });
  };

  renderUsers = localUser => {
    let renderUsers = [];
    this.users.forEach(user => {
      renderUsers.push(this._renderUser(user, localUser));
    });
    return renderUsers;
  };

  onDeletePress = (userId, user) => {
    Alert.alert(
      strings('residents.delete_modal_title'),
      strings('residents.delete_modal_text') + user.name + '?',
      [
        {
          text: strings('settings.change_password_modal_cancel'),
          onPress: () => {},
        },
        {
          text: strings('settings.change_password_modal_ok'),
          onPress: () => this.deleteUser(userId),
        },
      ],
    );
  };

  deleteUser = userId => {
    Database.deleteUser(userId).then(() => {
      this.getUsers();
    });
  };

  _renderUser = (renderUser, localUser) => {
    let user = renderUser.val();
    const sectionHeaderContainer = [
      styles.sectionHeaderContainer,
      {backgroundColor: colors.backgroundColor},
    ];
    return (
      <View key={renderUser.key}>
        <View style={sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>{user.room || ''}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => this.onDeletePress(renderUser.key, user)}>
            <Text style={styles.deleteText}>{strings('residents.delete')}</Text>
          </TouchableOpacity>
        </View>
        {!!user.name && (
          <View style={styles.innerRowContainer}>
            <Text style={styles.leftText}>{strings('residents.name')}</Text>
            <Text style={styles.rightText}>{user.name}</Text>
          </View>
        )}
        {!!user.duty && (
          <View style={styles.innerRowContainer}>
            <Text style={styles.leftText}>{strings('residents.duty')}</Text>
            <Text style={styles.rightText}>{user.duty}</Text>
          </View>
        )}
        {!!user.birthday && (
          <View style={styles.innerRowContainer}>
            <Text style={styles.leftText}>{strings('residents.birthday')}</Text>
            <Text style={styles.rightText}>{user.birthday}</Text>
          </View>
        )}
        {!!user.phone && (
          <View style={styles.innerRowContainer}>
            <Text style={styles.leftText}>{strings('residents.phone')}</Text>
            <Text style={styles.rightText}>{user.phone}</Text>
          </View>
        )}
        {!!user.email && (
          <View style={styles.innerRowContainer}>
            <Text style={styles.leftText}>{strings('residents.email')}</Text>
            <Text style={styles.rightText}>{user.email}</Text>
          </View>
        )}
      </View>
    );
  };

  render() {
    return (
      <ScrollView
        style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
        {this.state.renderUsers}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    height: 35,
    width: 35,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    height: undefined,
    width: undefined,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  innerRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 2,
    backgroundColor: colors.whiteColor,
    padding: 15,
  },
  leftText: {
    marginLeft: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    marginLeft: 10,
  },
  rightText: {
    marginRight: 10,
    color: colors.submitButtonColor,
  },
  deleteButton: {
    marginRight: 10,
  },
  deleteText: {
    color: colors.cancelButtonColor,
  },
});
