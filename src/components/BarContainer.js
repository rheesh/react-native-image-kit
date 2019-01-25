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
    const { style, children, height } = this.props;
    return (
      <Animated.View
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

