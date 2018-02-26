import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Database from '../storage/Database';
import colors from '../shared/colors';
import Icon from 'react-native-fa-icons';

export default class ResidentsScreen extends Component {

    static navigationOptions = {
        title: 'Beboere',
        drawerIcon: ({tintColor}) => (<Icon name='users' style={{fontSize: 15, color: tintColor}}/>),
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
            <View key={renderUser.key}>
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeaderText}>{user.room}</Text>
                </View>
                <View style={styles.innerRowContainer}>
                    <Text style={styles.leftText}>Navn:</Text>
                    <Text style={styles.rightText}>{user.name}</Text>
                </View>
                <View style={styles.innerRowContainer}>
                    <Text style={styles.leftText}>Tjans:</Text>
                    <Text style={styles.rightText}>{user.duty}</Text>
                </View>
                <View style={styles.innerRowContainer}>
                    <Text style={styles.leftText}>Fødselsdag:</Text>
                    <Text style={styles.rightText}>{user.birthday}</Text>
                </View>
                <View style={styles.innerRowContainer}>
                    <Text style={styles.leftText}>Email:</Text>
                    <Text style={styles.rightText}>{user.email}</Text>
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
    },
    sectionHeaderContainer: {
        backgroundColor: colors.backgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15
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
        marginLeft: 10
    },
    sectionHeaderText: {
        fontSize: 18,
        marginLeft: 10
    },
    rightText: {
        marginRight: 10,
        color: colors.submitButtonColor
    }
});