import React, {Component} from 'react';
import HomeTab from '../navigation/HomeTab';
import Icon from 'react-native-fa-icons';

export default class HomeTabScreen extends Component {

  static navigationOptions = {
    title: 'Hjem',
    drawerIcon: ({tintColor}) => ( <Icon name='home' style={{fontSize: 20, color: 'black'}}/>),
    headerTitleStyle: {
      fontSize: 18
    }
  };

  render() {
    return(
      <HomeTab/>
    );
  }
}