import React, {Component} from 'react';
import HomeTab from '../navigation/HomeTab';
import Icon from 'react-native-fa-icons';
import {NavigationActions} from 'react-navigation';

let navigator = undefined;
export const navigateTo = (routeName) => {
    if (navigator) {
        navigator.dispatch(NavigationActions.navigate({
            routeName: routeName
        }));
    }
};

export default class HomeScreen extends Component {

    static navigationOptions = {
        title: 'Hjem',
        drawerIcon: ({tintColor}) => (<Icon name='home' style={{fontSize: 15, color: tintColor}}/>),
        headerTitleStyle: {
            fontSize: 18
        },
        headerMode: 'none'
    };

    componentDidMount() {
        if (this.props.navigation.state.params) {
            let action = this.props.navigation.state.params.action;
            if (action) {
                navigator.dispatch(NavigationActions.navigate({
                    routeName: action
                }));
                this.props.navigation.state.params.action = undefined;
            }
        }
    }

    setRef = (nav) => {
        navigator = nav;
    };

    render() {
        return (
            <HomeTab
                ref={this.setRef}
                screenProps={{rootNavigation: this.props.navigation}}/>
        );
    }
}