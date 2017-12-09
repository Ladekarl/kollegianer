import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet
} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';

export default class DutiesScreen extends Component {

  static navigationOptions = {
    tabBarLabel: 'Tjanser',
    tabBarIcon: ({tintColor}) => (<Icon name='tasks' style={{fontSize: 25, color: tintColor}}/>),
  };

  constructor(props) {
    super(props);
    this.state = {
      renderUsers: []
    };
    Database.getUsers().then(snapshot => {
      this.users = snapshot;
      this.setState({renderUsers: this.renderUsers()});
    });
  }

  renderUsers = () => {
    let renderUsers = [];
    this.users.forEach(user => {
      renderUsers.push(this._renderUser(user));
    });
    return renderUsers
  };

  _renderUser = (renderUser) => {
    let user = renderUser.val();
    return (
      <View style={styles.rowContainer} key={renderUser.key}>
        <Text style={styles.textRoom}>{user.room}</Text>
        <Text style={styles.textDuty}>{user.duty}</Text>
      </View>
    );
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        {this.state.renderUsers}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingTop: 5,
    paddingBottom: 5
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    borderColor: colors.overviewIconColor,
    marginBottom: 7,
    marginLeft: 5,
    marginRight: 5,
    padding: 10,
    alignItems: 'center'
  },
  textRoom: {
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1
  },
  textDuty: {
    textAlign: 'left',
    flex: 1
  }


});