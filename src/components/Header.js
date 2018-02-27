import React, {Component} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '../shared/colors';
import PropTypes from 'prop-types';
import Icon from 'react-native-fa-icons';

export default class HeaderScreen extends Component {

    static propTypes = {
        navigation: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
    }

    openDrawer = () => {
        this.props.navigation.navigate('DrawerOpen');
    };

    openSettings = () => {
        this.props.navigation.navigate('Settings');
    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.headerButton} onPress={this.openDrawer}>
                    <Icon name='bars' style={styles.icon}/>
                </TouchableOpacity>
                <Text style={styles.headerText}>Kollegianer</Text>
                <TouchableOpacity style={styles.headerButton} onPress={this.openSettings}>
                    <Icon name='cog' style={styles.icon}/>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Platform.OS === 'ios' ? colors.inactiveTabColor : colors.backgroundColor,
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        paddingBottom: 10
    },
    headerText: {
        fontSize: 20,
        color: Platform.OS === 'ios' ? colors.backgroundColor : colors.inactiveTabColor,
        fontWeight: 'bold'
    },
    headerButton: {
        height: 35,
        width: 35,
        borderRadius: 100,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.inactiveTabColor
    },
    icon: {
        fontSize: Platform.OS === 'ios' ? 20 : 15,
        height: undefined,
        width: undefined,
        color: Platform.OS === 'ios' ? colors.backgroundColor : colors.backgroundColor
    }
});