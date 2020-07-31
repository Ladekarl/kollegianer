import React, {Component} from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import colors from '../shared/colors';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.width / 2;

export default class SplashScreen extends Component {
  render() {
    const innerContainer = [
      styles.innerContainer,
      {backgroundColor: colors.backgroundColor},
    ];
    return (
      <View style={styles.container}>
        <View style={innerContainer}>
          <Image
            resizeMode="contain"
            style={styles.image}
            source={require('../../img/kollegianer.png')}
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    ...StyleSheet.absoluteFill,
  },
  image: {
    flex: 1,
    height: IMAGE_HEIGHT,
    alignSelf: 'center',
    opacity: 0.8,
  },
});
