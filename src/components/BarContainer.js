/**
 * @overview Definition of BarContainer component
 * for bottom toolbar of PhotoEditor.
 * This source was adapted from and inspired by Halil Bilir's "React Native Photo Browser".
 * @see https://github.com/halilb/react-native-photo-browser
 *
 * last modified : 2019.01.28
 * @module components/BarContainer
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  StyleSheet,
  ViewPropTypes
} from 'react-native';

export default class BarContainer extends Component {

  static propTypes = {
    style: ViewPropTypes.style,
    height: PropTypes.number,
    onLayout: PropTypes.func,
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);

    this.state = {
      animation: new Animated.Value(1),
    };
  }

  componentDidUpdate() {
    Animated.timing(this.state.animation, {
      toValue: 1,
      duration: 300,
    }).start();
  }

    render() {
        const { style, children, height, onLayout } = this.props;
        return (
            <Animated.View
                onLayout={onLayout}
                style={[
                    style,
                    styles.container,
                    {
                        height,
                        opacity: this.state.animation,
                        transform: [{
                            translateY: this.state.animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [ height , 0],
                            }),
                        }],
                    },
                ]}
            >
                {children}
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
  },
});

