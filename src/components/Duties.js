import React, {Component} from 'react';
import {Text, View} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Database from '../storage/Database';

export default class DutiesScreen extends Component {

  static navigationOptions = {
    title: 'Tjanser',
    drawerIcon: ({tintColor}) => ( <FontAwesome name='tasks' size={20} style={{color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
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

  users = [];

  renderUsers() {
    let renderUsers = [];
    this.users.forEach(user => {
      renderUsers.push(this._renderUser(user));
    });
    return renderUsers
  }

  _renderUser(renderUser) {
    let user = renderUser.val();
    return (
      <View key={renderUser.key}>
        <Text>{user.room}</Text>
        <Text>{user.duty}</Text>
      </View>
    );
  }


  render() {
    return (
      <View>
        {this.state.renderUsers}
      </View>
    )
  }
}