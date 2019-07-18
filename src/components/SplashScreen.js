import React, {Component} from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import colors from '../shared/colors';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.width / 2;

export default class SplashScreen extends Component {

    static navigationOptions = {
        header: null
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <Image
                        resizeMode='contain'
                        style={styles.image}
                        source={require('../../img/kollegianer.png')}
                    />
                </View>
            </View>
        );
    };
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    innerContainer: {
        backgroundColor: colors.backgroundColor,
        ...StyleSheet.absoluteFill
    },
    image: {
        flex: 1,
        height: IMAGE_HEIGHT,
        alignSelf: 'center',
        opacity: 0.8
    }
});