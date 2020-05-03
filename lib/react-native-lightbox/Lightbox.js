import React, {Children, cloneElement, Component} from 'react';
import PropTypes from 'prop-types';
import {Animated, TouchableWithoutFeedback, View} from 'react-native';

import LightboxOverlay from './LightboxOverlay';

export default class Lightbox extends Component {
  static propTypes = {
    activeProps: PropTypes.object,
    renderHeader: PropTypes.func,
    renderContent: PropTypes.func,
    underlayColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    onOpen: PropTypes.func,
    onLongPress: PropTypes.func,
    buttonStyle: PropTypes.object,
    onClose: PropTypes.func,
    originOffset: PropTypes.object,
    springConfig: PropTypes.shape({
      tension: PropTypes.number,
      friction: PropTypes.number,
    }),
    swipeToDismiss: PropTypes.bool,
  };

  static defaultProps = {
    swipeToDismiss: true,
    onOpen: () => {},
    onClose: () => {},
    onLongPress: () => {},
    originOffset: {x: 0, y: 0},
  };

  state = {
    isOpen: false,
    origin: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    layoutOpacity: new Animated.Value(1),
  };

  getContent = () => {
    if (this.props.renderContent) {
      return this.props.renderContent();
    } else if (this.props.activeProps) {
      return cloneElement(
        Children.only(this.props.children),
        this.props.activeProps,
      );
    }
    return this.props.children;
  };

  getOverlayProps = () => ({
    isOpen: this.state.isOpen,
    origin: this.state.origin,
    renderHeader: this.props.renderHeader,
    swipeToDismiss: this.props.swipeToDismiss,
    springConfig: this.props.springConfig,
    backgroundColor: this.props.backgroundColor,
    children: this.getContent(),
    onClose: this.onClose,
  });

  open = () => {
    this._root.measure((ox, oy, width, height, px, py) => {
      this.props.onOpen();

      this.setState(
        {
          isOpen: !!this.props.navigator,
          isAnimating: true,
          origin: {
            width,
            height,
            x: px + this.props.originOffset.x,
            y: py + this.props.originOffset.y,
          },
        },
        () => {
          if (this.props.navigator) {
            const route = {
              component: LightboxOverlay,
              passProps: this.getOverlayProps(),
            };
            const routes = this.props.navigator.getCurrentRoutes();
            routes.push(route);
            this.props.navigator.immediatelyResetRouteStack(routes);
          } else {
            this.setState({
              isOpen: true,
            });
          }
          setTimeout(() => {
            this._root && this.state.layoutOpacity.setValue(0);
          });
        },
      );
    });
  };

  close = () => {
    throw new Error(
      'Lightbox.close method is deprecated. Use renderHeader(close) prop instead.',
    );
  };

  onClose = () => {
    this.state.layoutOpacity.setValue(1);
    this.setState(
      {
        isOpen: false,
      },
      this.props.onClose,
    );
    if (this.props.navigator) {
      const routes = this.props.navigator.getCurrentRoutes();
      routes.pop();
      this.props.navigator.immediatelyResetRouteStack(routes);
    }
  };

  longPress = () => {
    this.props.onLongPress();
  };

  render() {
    // measure will not return anything useful if we dont attach a onLayout handler on android
    return (
      <View
        ref={component => (this._root = component)}
        style={this.props.style}
        onLayout={() => {}}>
        <Animated.View style={{opacity: this.state.layoutOpacity}}>
          <TouchableWithoutFeedback
            style={this.props.buttonStyle}
            underlayColor={this.props.underlayColor}
            onPress={this.open}
            onLongPress={this.longPress}>
            {this.props.children}
          </TouchableWithoutFeedback>
        </Animated.View>
        {this.props.navigator ? (
          false
        ) : (
          <LightboxOverlay {...this.getOverlayProps()} />
        )}
      </View>
    );
  }
}
