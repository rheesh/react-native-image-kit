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

import { Animated, View, ViewPropTypes, StyleSheet } from 'react-native';
import { GestureHandler } from 'expo';
import { createArray, positionToValue, valueToPosition } from "../lib";
const { PanGestureHandler, State } = GestureHandler;

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

        onValuesChange: PropTypes.func,
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

        onValuesChange: value => { },
    };

    constructor(props) {
        super(props);
        this.optionsArray = createArray(props.min, props.max, props.step);
        let initialPosition = valueToPosition(props.value, this.optionsArray, props.sliderLength);
        this.value = props.value;
        this._direction = props.direction.toLowerCase();
        this._translate = new Animated.Value(0);
        if(this._direction === 'up' || this._direction === 'rtl')
            this._offset = props.sliderLength - initialPosition;
        else
            this._offset = initialPosition;
        this._translate.setOffset(this._offset);
    }

    _onGestureEvent = event => {
        const {translationX, translationY} = event.nativeEvent;
        const sliderLength = this.props.sliderLength;
        let x = this._offset + translationX;
        let y = this._offset + translationY;
        switch(this._direction) {
            case 'down':
            case 'up':
                if(y >= 0 && y <= sliderLength)
                    this._translate.setValue(translationY);
                break;
            case 'ltr':
            case 'rtl':
                if(x >= 0 && x <= sliderLength)
                    this._translate.setValue(translationX);
                break;
            default:
                return;
        }
    };

    _onHandlerStateChange = event => {
        const {translationX, translationY} = event.nativeEvent;
        const sliderLength = this.props.sliderLength;
        let position = 0;
        if (event.nativeEvent.oldState === State.ACTIVE) {
            switch(this._direction) {
                case 'down':
                    position = this._offset + translationY;
                    this.value = positionToValue( position, this.optionsArray, this.props.sliderLength );
                    position = valueToPosition( this.value, this.optionsArray, this.props.sliderLength );
                    this._offset = position;
                    break;
                case 'up':
                    position = sliderLength - this._offset - translationY;
                    this.value = positionToValue( position, this.optionsArray, this.props.sliderLength );
                    position = valueToPosition( this.value, this.optionsArray, this.props.sliderLength );
                    this._offset = sliderLength - position;
                    break;
                case 'ltr':
                    position = this._offset + translationX;
                    this.value = positionToValue( position, this.optionsArray, this.props.sliderLength );
                    position = valueToPosition( this.value, this.optionsArray, this.props.sliderLength );
                    this._offset = position;
                    break;
                case 'rtl':
                    position = sliderLength - this._offset - translationX;
                    this.value = positionToValue( position, this.optionsArray, this.props.sliderLength );
                    position = valueToPosition( this.value, this.optionsArray, this.props.sliderLength );
                    this._offset = sliderLength - position;
                    break;
                default:
                    return;
            }
            this._translate.setOffset(this._offset);
            this._translate.setValue(0);
            this.props.onValuesChange(this.value);
        }
    };

    componentWillReceiveProps(nextProps, nextContext) {
        const {direction, min, max, value, sliderLength, step} = nextProps;
        if(this._direction !== direction){
            this._direction = direction;
        }
        if ( this._direction !== direction.toLowerCase() ||
             min !== this.props.min ||
             max !== this.props.max ||
             value !== this.props.value ||
             step !== this.props.step ||
             sliderLength !== this.props.sliderLength) {
            this.optionsArray = createArray(min, max, step);
            let initialPosition = valueToPosition(value, this.optionsArray, sliderLength);
            this.value = value;
            this._direction = direction.toLowerCase();
            this._translate = new Animated.Value(0);
            if(this._direction === 'up' || this._direction === 'rtl')
                this._offset = sliderLength - initialPosition;
            else
                this._offset = initialPosition;
            this._translate.setOffset(this._offset);
        }
    }

    render() {
        const {style, edgeLength, trackRadius, sliderLength} = this.props;
        let styles = this.getStyle(edgeLength, trackRadius, sliderLength, );
        return (
            <PanGestureHandler
                onGestureEvent={this._onGestureEvent}
                onHandlerStateChange={this._onHandlerStateChange}>
                <View style={[style, styles.track]} >
                    <View style={styles.track1}/>
                    <View style={styles.track2}/>
                    <Animated.View style={styles.marker}/>
                </View>
            </PanGestureHandler>
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

        switch(this._direction){
            case 'down':
                css.marker.left = -(edgeLength - trackRadius)/2;
                css.marker.width = edgeLength;
                css.marker.height = 1;
                css.marker.transform = [ { translateY: this._translate }, ];
                css.track.flexDirection = 'row';
                css.track.width = trackRadius;
                css.track.height = sliderLength;
                css.track1.borderBottomLeftRadius = trackRadius;
                css.track2.borderBottomRightRadius = trackRadius;
                break;
            case 'up':
                css.marker.left = -(edgeLength - trackRadius)/2;
                css.marker.width = edgeLength;
                css.marker.height = 1;
                css.marker.transform = [ { translateY: this._translate }, ];
                css.track.flexDirection = 'row';
                css.track.width = trackRadius;
                css.track.height = sliderLength;
                css.track1.borderTopLeftRadius = trackRadius;
                css.track2.borderTopRightRadius = trackRadius;
                break;
            case 'ltr':
                css.marker.top = -(edgeLength - trackRadius)/2;
                css.marker.width = 1;
                css.marker.height = edgeLength;
                css.marker.transform = [ { translateX: this._translate }, ];
                css.track.flexDirection = 'column';
                css.track.width = sliderLength;
                css.track.height = trackRadius;
                css.track1.borderTopRightRadius = trackRadius;
                css.track2.borderBottomRightRadius = trackRadius;
                break;
            case 'rtl':
                css.marker.top = -(edgeLength - trackRadius)/2;
                css.marker.width = 1;
                css.marker.height = edgeLength;
                css.marker.transform = [ { translateX: this._translate }, ];
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