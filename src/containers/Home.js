import React, {Component} from 'react';
import HomeTab from '../navigation/HomeTab';
import Icon from 'react-native-fa-icons';

export default class HomeScreen extends Component {

  static navigationOptions = {
    title: 'Hjem',
    drawerIcon: ({tintColor}) => ( <Icon name='home' style={{fontSize: 15, color: tintColor}}/>),
    headerTitleStyle: {
      fontSize: 15
    }
  };

  render() {
    return(
      <HomeTab/>
    );
  }
}