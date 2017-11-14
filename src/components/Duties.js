import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet
} from 'react-native';
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
      <View style={styles.rowContainer} key={renderUser.key}>
        <Text style={styles.textRoom}>{user.room}</Text>
        <Text style={styles.textDuty}>{user.duty}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.renderUsers}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 5,
    borderColor: '#e3f2fd',
    marginLeft: 3,
    marginRight: 3,
    marginBottom: 3,
    borderRadius: 0,
    alignItems: 'center' 
  },
  textRoom: {
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1
  },
  textDuty: {
    textAlign: 'left',
    flex: 2
  }


});