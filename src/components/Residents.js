import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';

export default class ResidentsScreen extends Component {

  static navigationOptions = {
    title: 'Beboere',
    drawerIcon: ({tintColor}) => (<Icon name='tasks' style={{fontSize: 15, color: tintColor}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      renderUsers: []
    };
  }

  componentDidMount() {
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
        <Text style={styles.titleText}>{user.room}</Text>
        <View style={styles.innerRowContainer}>
          <Text style={styles.text}>{user.name}</Text>
          <Text style={styles.text}>{user.duty}</Text>
        </View>
        <View style={styles.innerRowContainer}>
          <Text style={styles.text}>{user.birthday}</Text>
          <Text style={styles.text}>{user.email}</Text>
        </View>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    borderColor: colors.overviewIconColor,
    marginBottom: 7,
    marginLeft: 5,
    marginRight: 5,
    padding: 10
  },
  innerRowContainer: {
    margin: 5,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 15,
    alignSelf: 'center'
  }
});