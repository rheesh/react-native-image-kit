/**
 * @overview Definition of EdgeSlider Component for croping picture.
 *
 * This source was adapted from and inspired by Tomas Roos's "React Native Multi Slider."
 * @see https://github.com/ptomasroos/react-native-multi-slider/blob/master/converters.js
 *
 * last modified : 2019.01.09
 * @module component/EdgeSlider
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */

import React from 'react';
import PropTypes from 'prop-types';

import { PanResponder, View, ViewPropTypes, StyleSheet } from 'react-native';
import { createArray, positionToValue, valueToPosition } from "../lib";

const slipDisplacement = 200;

export default class EdgeSlider extends React.Component {
    static propTypes = {
        value: PropTypes.number,
        style: ViewPropTypes.style,
        edgeLength: PropTypes.number,
        trackRadius: PropTypes.number,
        min: PropTypes.number,
        max: PropTypes.number,
        sliderLength: PropTypes.number,
        step: PropTypes.number,
        direction: PropTypes.string,
        edgeColor: PropTypes.string,
        trackColor: PropTypes.string,
        trackColor1: PropTypes.string,
        trackColor2: PropTypes.string,

        onValuesChangeStart: PropTypes.func,
        onValuesChange: PropTypes.func,
        onValuesChangeFinish: PropTypes.func,
    };

    static defaultProps = {
        value: 0,
        edgeLength: 300,
        trackRadius: 41,
        min: 0,
        max: 100,
        sliderLength: 100,
        step: 1,
        direction: 'down',
        edgeColor: '#095FFF',
        trackColor: null,
        trackColor1: 'rgba(0, 0, 0, 0.2)',
        trackColor2: 'rgba(255, 255, 255, 0.2)',

        onValuesChangeStart: () => { },
        onValuesChange: value => { },
        onValuesChangeFinish: value => { },
    };

    constructor(props) {
        super(props);
        this.optionsArray = createArray(props.min, props.max, props.step);
        let initialPosition = valueToPosition(props.value, this.optionsArray, props.sliderLength);
        this.state = {
            pressed: false,
            value: this.props.value,
            past: initialPosition,
            position: initialPosition,
        };
        let customPanResponder = (start, move, end) => {
            return PanResponder.create({
                onStartShouldSetPanResponder: (evt, gestureState) => true,
                onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
                onMoveShouldSetPanResponder: (evt, gestureState) => true,
                onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
                onPanResponderGrant: (evt, gestureState) => start(),
                onPanResponderMove: (evt, gestureState) => move(gestureState),
                onPanResponderTerminationRequest: (evt, gestureState) => false,
                onPanResponderRelease: (evt, gestureState) => end(),
                onPanResponderTerminate: (evt, gestureState) => end(),
                onShouldBlockNativeResponder: (evt, gestureState) => true,
            });
        };

        this._panResponder = customPanResponder(
            this.onStart,
            this.onMove,
            this.onEnd,
        );
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.pressed) {
            return;
        }

        let nextState = {};
        if (nextProps.min !== this.props.min ||
            nextProps.max !== this.props.max ||
            nextProps.value !== this.state.value ||
            nextProps.sliderLength !== this.props.sliderLength) {
            this.optionsArray =  createArray(nextProps.min, nextProps.max, nextProps.step);
            nextState.position = valueToPosition(
                nextProps.value,
                this.optionsArray,
                nextProps.sliderLength,
            );
            nextState.value = nextProps.value;
            nextState.past = nextState.position;
        }
        if (nextState != {}) {
            this.setState(nextState);
        }
    }

    onStart = () => {
        this.props.onValuesChangeStart();
        this.setState({
            pressed: true,
        });
    };

    onMove = gestureState => {
        let delta;
        switch(this.props.direction.toLowerCase()){
            case 'down':
                delta = gestureState.dy;
                break;
            case 'up':
                delta = -gestureState.dy;
                break;
            case 'ltr':
                delta = gestureState.dx;
                break;
            case 'rtl':
                delta = -gestureState.dx;
                break;
            default:
                console.log('EdgeSlider : ', "this.props.direction has improper value." );
                return;
        }

        if (Math.abs(delta) < slipDisplacement) {
            delta += this.state.past;
            let position = delta < 0 ? 0 : (0 > this.props.sliderLength ? this.props.sliderLength : delta);
            let value = positionToValue(
                position,
                this.optionsArray,
                this.props.sliderLength,
            );
            position = valueToPosition(
                value,
                this.optionsArray,
                this.props.sliderLength,
            );

            if (value !== this.state.value) {
                this.setState(
                    {
                        value: value,
                        position: position,
                    },
                    () => {
                        this.props.onValuesChange(this.state.value);
                    },
                );
            }
        }
    };

    onEnd = () => {
        this.setState(
            {
                past: this.state.position,
                pressed: false,
            },
            () => {
                let change = this.state.value;
                this.props.onValuesChangeFinish(change);
            },
        );
    };

    render() {
        const {style, edgeLength, trackRadius, sliderLength} = this.props;
        let styles = this.getStyle(edgeLength, trackRadius, sliderLength, );
        return (
            <View style={[style, styles.track]} {...this._panResponder.panHandlers}>
                <View style={styles.track1}/>
                <View style={styles.track2}/>
                <View style={styles.marker}/>
            </View>
        );
    }

    getStyle(edgeLength, trackRadius, sliderLength) {
        let { trackColor1, trackColor2, trackColor } = this.props;
        if (trackColor) {
            trackColor1 = trackColor;
            trackColor2 = trackColor;
        }
        let css = {
            track : {
                display : 'flex',
                flexDirection: 'column',
            },
            track1 : {
                flex: 1,
                backgroundColor: trackColor1,
            },
            track2 : {
                flex: 1,
                backgroundColor: trackColor2,
            },
            marker : {
                position: 'absolute',
                backgroundColor: this.props.edgeColor,
            }
        };

        switch(this.props.direction.toLowerCase()){
            case 'down':
                css.marker.top = this.state.position;
                css.marker.left = -(edgeLength - trackRadius)/2;
                css.marker.width = edgeLength;
                css.marker.height = 1;
                css.track.flexDirection = 'row';
                css.track.width = trackRadius;
                css.track.height = sliderLength;
                css.track1.borderBottomLeftRadius = trackRadius;
                css.track2.borderBottomRightRadius = trackRadius;
                break;
            case 'up':
                css.marker.bottom = this.state.position;
                css.marker.left = -(edgeLength - trackRadius)/2;
                css.marker.width = edgeLength;
                css.marker.height = 1;
                css.track.flexDirection = 'row';
                css.track.width = trackRadius;
                css.track.height = sliderLength;
                css.track1.borderTopLeftRadius = trackRadius;
                css.track2.borderTopRightRadius = trackRadius;
                break;
            case 'ltr':
                css.marker.left = this.state.position;
                css.marker.top = -(edgeLength - trackRadius)/2;
                css.marker.width = 1;
                css.marker.height = edgeLength;
                css.track.flexDirection = 'column';
                css.track.width = sliderLength;
                css.track.height = trackRadius;
                css.track1.borderTopRightRadius = trackRadius;
                css.track2.borderBottomRightRadius = trackRadius;
                break;
            case 'rtl':
                css.marker.right = this.state.position;
                css.marker.top = -(edgeLength - trackRadius)/2;
                css.marker.width = 1;
                css.marker.height = edgeLength;
                css.track.flexDirection = 'column';
                css.track.width = sliderLength;
                css.track.height = trackRadius;
                css.track1.borderTopLeftRadius = trackRadius;
                css.track2.borderBottomLeftRadius = trackRadius;
                break;
            default:
                console.log('EdgeSlider : ', "this.props.direction has improper value." );
                return;
        }


        return StyleSheet.create(css);
    }
}