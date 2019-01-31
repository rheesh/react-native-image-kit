/**
 * @overview Definition of BottomBar component
 * for bottom toolbar of PhotoEditor.
 * This source was adapted from and inspired by Halil Bilir's "React Native Photo Browser".
 * @see https://github.com/halilb/react-native-photo-browser
 *
 * last modified : 2019.01.28
 * @module components/BottomBar
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView, Text, StyleSheet, Dimensions, View } from 'react-native';
import {Button, Icon } from 'native-base';

import BarContainer from './BarContainer';
import Common from '../lib/Common';

export default class BottomBar extends React.Component {

    static propTypes = {
        height: PropTypes.number,
        picture: PropTypes.object,
        onResizeByWidth: PropTypes.func,
        onResizeByHeight: PropTypes.func,
        onCClockwise: PropTypes.func,
        onClockwise: PropTypes.func,
        onCrop: PropTypes.func,
        onVerticalFlip: PropTypes.func,
        onHorizontalFlip: PropTypes.func,
        onUndo: PropTypes.func,
        onReset: PropTypes.func,
        customBtn: PropTypes.array,
    };

    static defaultProps = {
        picture: {},
        onResizeByWidth: () => {},
        onResizeByHeight: () => {},
        onCClockwise: () => {},
        onClockwise: () => {},
        onCrop: () => {},
        onVerticalFlip: () => {},
        onHorizontalFlip: () => {},
        onUndo: () => {},
        onReset: () => {},
        customBtn: []
    };

    constructor(props) {
        super(props);
        const {width, height} = Dimensions.get('window');
        this.state = {
            width: width,
            height: height,
        }
    }

    _onLayout = (e) => {
        const scr = Dimensions.get('window');
        if ( this.state.width !== scr.width || this.state.height !== scr.height){
            this.setState({
                width: scr.width,
                height: scr.height,
            });
        }
    };

    render() {
        const { picture, height, onResizeByWidth, onResizeByHeight,
            onCrop, onVerticalFlip, onHorizontalFlip, onUndo,
            onReset, onCClockwise, onClockwise } = this.props;
        const styles = this.getStyles(this.state.width, this.state.height);
        return (
            <BarContainer
                onLayout={this._onLayout}
                height={height}
                style={styles.container}
            >
                <ScrollView style={styles.buttonContainer}
                            bounces horizontal centerContent showsVerticalScrollIndicator={false}>
                    <View style={styles.contentContainer}>
                        { this.props.customBtn.map( (v, i) =>{
                            v.key = i;
                            v.arg = picture;
                            if(v.icon) v.icon.style = styles.icon;
                            if(v.text) v.text.style = styles.btnText;
                            v.style = styles.button;
                            return Common.button(v);
                        } ) }
                    </View>
                </ScrollView>
                <ScrollView style={styles.buttonContainer}
                            bounces horizontal centerContent showsVerticalScrollIndicator={false}>
                    <View style={styles.contentContainer}>
                        <Button bordered style={styles.button} onPress={onResizeByWidth}>
                            <Icon style={styles.icon} type="MaterialCommunityIcons" name="arrow-expand-horizontal" />
                            <Text style={styles.btnText}>{picture.width}</Text>
                        </Button>
                        <Button bordered style={styles.button} onPress={onResizeByHeight}>
                            <Icon style={styles.icon} type="MaterialCommunityIcons" name="arrow-expand-vertical" />
                            <Text style={styles.btnText}>{picture.height}</Text>
                        </Button>
                        <Button bordered style={styles.button} onPress={onCrop}>
                            <Icon style={styles.icon} type="MaterialIcons" name="crop" />
                        </Button>
                        <Button bordered style={styles.button} onPress={onCClockwise} >
                            <Icon style={styles.icon} type={'MaterialCommunityIcons'} name={'rotate-left-variant'} />
                        </Button>
                        <Button bordered style={styles.button} onPress={onClockwise} >
                            <Icon style={styles.icon} type={'MaterialCommunityIcons'} name={'rotate-right-variant'}/>
                        </Button>
                        <Button bordered style={styles.button} onPress={onVerticalFlip} >
                            <Icon style={styles.clockIcon} type={'MaterialIcons'} name={'flip'} />
                        </Button>
                        <Button bordered style={styles.button} onPress={onHorizontalFlip}>
                            <Icon style={styles.icon} type={'MaterialIcons'} name={'flip'}/>
                        </Button>
                        <Button bordered style={styles.button} onPress={onUndo}>
                            <Icon style={styles.icon} type={'MaterialIcons'} name={'undo'}/>
                            <Text style={styles.btnText}>Undo</Text>
                        </Button>
                        <Button bordered style={styles.button} onPress={onReset}>
                            <Icon style={styles.icon} type={'MaterialIcons'} name={'skip-previous'}/>
                            <Text style={styles.btnText}>Reset</Text>
                        </Button>
                    </View>
                </ScrollView>
            </BarContainer>
        );
    }

    getStyles(w, h) {
        return StyleSheet.create({
            container: {
                flex: 1,
                flexDirection: 'column',
            },
            buttonContainer: {
                flex: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            },
            contentContainer:{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                minWidth: w,
            },
            icon: {
                color: '#B0B0B0',
            },
            clockIcon: {
                color: '#B0B0B0',
                transform: [{ rotateZ: '90deg'}]
            },
            mirrorIcon: {
                color: '#B0B0B0',
                transform: [{ rotateY: '180deg'}]
            },
            button:{
                borderColor: '#606060',
                marginLeft: 4,
                marginTop: 4,
            },
            btnText: {
                color: '#909090',
                marginLeft: -4,
                paddingLeft: 0,
                marginRight: 8,
            },
        });
    }
}


