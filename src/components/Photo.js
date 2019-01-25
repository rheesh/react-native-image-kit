

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, Image, StyleSheet, View, ActivityIndicator, Platform, } from 'react-native';
import { Icon } from 'native-base';

import * as Progress from 'react-native-progress';
import EdgeSlider from "./EdgeSlider";


export default class Photo extends Component {

    static propTypes = {
        picture: PropTypes.object.isRequired,
        resizeMode: PropTypes.string,
        width: PropTypes.number,
        height: PropTypes.number,

        /*
         * size of selection images are decided based on this
         */
        thumbnail: PropTypes.bool,

        /*
         * image tag generated using require(asset_path)
         */
        progressImage: PropTypes.number,

        useCircleProgress: PropTypes.bool,
        trackWidth : PropTypes.number,
        onSliderChange : PropTypes.func,
    };

    static defaultProps = {
        resizeMode: 'contain',
        thumbnail: false,
        trackWidth : 41,
        onSliderChange: null,
    };

    constructor(props) {
        super(props);

        this.image = null;
        this._onProgress = this._onProgress.bind(this);
        this._onError = this._onError.bind(this);
        this._onLoad = this._onLoad.bind(this);
        this._onSliderChange = this._onSliderChange.bind(this);

        this.state = {
            picture: props.picture,
            progress: 0,
            error: false,
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            picture: nextProps.picture,
            progress: 0,
            error: false,
        });
    }

    _onProgress(event) {
        const progress = event.nativeEvent.loaded / event.nativeEvent.total;
        if (!this.props.thumbnail && progress !== this.state.progress) {
            this.setState({
                progress,
            });
        }
    }

    _onError() {
        this.setState({
            error: true,
            progress: 1,
        });
    }

    _onLoad() {
        this.setState({
            progress: 1,
        });
    }

    _onSliderChange( direction, value ) {
        this.props.onSliderChange(direction, value);
    }

    _renderProgressIndicator() {
        const { useCircleProgress } = this.props;
        const { progress } = this.state;

        if (progress < 1) {
            if (Platform.OS === 'android') {
                return <ActivityIndicator animating={ true }/>;
            }

            const ProgressElement = useCircleProgress ? Progress.Circle : Progress.Bar;
            return (
                <ProgressElement
                    progress={progress}
                    thickness={20}
                    color={'white'}
                />
            );
        }
        return null;
    }

    _renderErrorIcon() {
        return (
            <Icon style={{color: 'white'}} type={'FontAwesome'} name={'frown-o'}/>
        );
    }

    _renderPhoto(sizeStyle) {
        const { resizeMode } = this.props;
        return (
            <Image
                ref={ref => this.image = ref}
                style={[styles.image, sizeStyle]}
                source={{uri: this.state.picture.uri}}
                onProgress={this._onProgress}
                onError={this._onError}
                onLoad={this._onLoad}
                resizeMode={resizeMode}
            />
        );
    }

    _renderEdgeSlider(direction, sizeStyle) {
        direction = direction.toLowerCase();
        const {width, height} = sizeStyle;
        const trackWidth = this.props.trackWidth;
        const srcWidth= this.state.picture.width;
        const srcHeight= this.state.picture.height;

        let dispHeight = height;
        let scale = dispHeight / srcHeight;
        let dispWidth = scale * srcWidth;
        if (dispWidth > width){
            dispWidth = width;
            scale = dispWidth / srcWidth;
            dispHeight = scale * srcHeight;
        }

        let style = { position: 'absolute' };
        let edgeLength, sliderLength, max;
        switch(direction) {
            case 'down':
                style.top = (height - dispHeight) / 2;
                style.left = (width - trackWidth) / 2;
                edgeLength = dispWidth;
                sliderLength = dispHeight/2-trackWidth;
                max = srcHeight/2-trackWidth/scale;
                break;
            case 'up':
                style.top = height/2 + trackWidth;
                style.left = (width - trackWidth) / 2;
                edgeLength = dispWidth;
                sliderLength = dispHeight/2-trackWidth;
                max = srcHeight/2-trackWidth/scale;
                break;
            case 'ltr':
                style.top = (height - trackWidth) / 2;
                style.left = (width - dispWidth) / 2;
                edgeLength = dispHeight;
                sliderLength = dispWidth/2-trackWidth;
                max = srcWidth/2-trackWidth/scale;
                break;
            case 'rtl':
                style.top = (height - trackWidth) / 2;
                style.right = (width - dispWidth) / 2;
                edgeLength = dispHeight;
                sliderLength = dispWidth/2-trackWidth;
                max = srcWidth/2-trackWidth/scale;
                break;
            default:
                return null;
        }

        return (
            <EdgeSlider style={style} edgeLength={edgeLength} direction={direction}
                        sliderLength={sliderLength} trackRadius={trackWidth}
                        min={0} max={max} key={direction}
                        onValuesChange={ value => this._onSliderChange(direction, value) }/>
        );
    }

    render() {
        const { width, height } = this.props;
        const screen = Dimensions.get('window');
        const error = this.state.error;
        const sizeStyle = {
            width: width || screen.width,
            height: height || screen.height,
        };
        const directions = ['up', 'down', 'ltr', 'rtl'];
        return (
            <View style={[styles.container, sizeStyle]}>
                { error ? this._renderErrorIcon() : this._renderProgressIndicator() }
                { this._renderPhoto(sizeStyle) }
                { this.props.onSliderChange ? directions.map( item => this._renderEdgeSlider(item, sizeStyle) ) : null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
});
