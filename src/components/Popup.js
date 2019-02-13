/**
 * @overview Definition of Popup component
 * for various dialog
 * last modified : 2019.01.09
 * @module components/Popup
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */
'use strict';

import React from 'react';
import { Modal, View, ViewPropTypes, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';

export default class Popup extends React.Component {

    static propTypes = {
        style: ViewPropTypes.style,
        visible: PropTypes.bool,
        onDismiss: PropTypes.func,
        onShow: PropTypes.func,
        children: PropTypes.node,
        orientation: PropTypes.string,
        backgroundColor: PropTypes.string,
    };

    static defaultProps = {
        style: null,
        visible: false,
        onDismiss: null,
        onShow: null,
        orientation: null,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    };

    constructor(props) {
        super(props);
        this._root = null;
        this.state = { visible: props.visible };
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(this.props.visible !== nextProps.visible)
            this.setState({ visible: nextProps.visible });
    }

    open() {
        if(this.props.onShow){
            this.props.onShow();
        }
        this.setState({visible: true});
    }

    close() {
        this.setState({visible: false});
        if(this.props.onDismiss){
            this.props.onDismiss();
        }
    }

    get supportedOrientations() {
        switch(this.props.orientation){
            case 'portrait':
                return ['portrait'];
            case 'landscape':
                return ['landscape'];
            default:
                return ['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right'];
        }
    }

    render() {
        const { style, children } = this.props;
        return (
            <Modal ref={(e) => { this._root = e; }} onRequestClose={this.close}
                   supportedOrientations={this.supportedOrientations}
                   transparent visible={this.state.visible} >
                <View importantForAccessibility="yes" accessibilityViewIsModal={true}
                      style={[this.styles.transparent, this.styles.absolute]} pointerEvents={'box-none'}>
                    <View style={{ flex: 1 }} pointerEvents={'box-none'} >
                        <View style={[ this.styles.modal, style ]} >
                            <TouchableWithoutFeedback onPress={this.close}>
                                <View style={[this.styles.absolute]} />
                            </TouchableWithoutFeedback>
                            {children}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    get styles() {
        return StyleSheet.create({
            modal: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: this.props.backgroundColor,
                justifyContent: 'flex-start',
                alignItems: 'center',
            },
            wrapper: {
                backgroundColor: "white"
            },
            transparent: {
                zIndex: 2,
                backgroundColor: 'rgba(0,0,0,0)'
            },
            absolute: {
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }
        });
    }
};
