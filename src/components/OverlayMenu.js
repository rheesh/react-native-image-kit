/**
 * @overview Definition of OverlayMenu component
 * for right side icon bar
 * This component was adapted from and inspired by @rt2zz's "React Native Drawer"
 * @see https://github.com/root-two/react-native-drawer
 *
 * last modified : 2019.01.28
 * @module components/OverlayMenu
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */

'use strict';

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Drawer, Button, Icon, Text } from 'native-base';
import PropTypes from 'prop-types';
import Common from '../lib/Common';

export default class OverlayMenu extends React.Component {
    static propTypes = {
        buttons: PropTypes.array.isRequired,
        styles: PropTypes.object,
        open: PropTypes.bool,
        children: PropTypes.node,
        onOpen: PropTypes.func,
        onClose: PropTypes.func,
    };

    static defaultProps = {
        styles: {
            drawer: {
                backgroundColor: 'rgba(0,0,0,0.2)',
                shadowColor: '#000000',
                shadowOpacity: 0.8,
                shadowRadius: 3
            },
            main: {},
            drawerOverlay: {},
            mainOverlay: {},
        },
        open: false,
        onOpen: null,
        onClose: null,
    };

    constructor(props) {
        super(props);
        this.drawer = null;
        this.state = { open: props.open };
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this._onOpen = this._onOpen.bind(this);
        this._onClose = this._onClose.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(this.props.open !== nextProps.open){
            this.setState({open: nextProps.open});
        }
    }

    open() {
        this.setState({open: true});
    }

    _onOpen() {
        if( !this.state.open ) this.setState({open: true});
        if(this.props.onOpen) this.props.onOpen();
    }

    close() {
        this.setState({open: false});
    }

    _onClose() {
        if( this.state.open ) this.setState({open: false});
        if(this.props.onClose) this.props.onClose();
    }

    toggle() {
        if(this.state.open){
            this.close();
        }else{
            this.open();
        }
    }

    render() {
        const drawerStyles = this.props.styles;
        let buttons = this.props.buttons;
        let content = (
            <View style={[styles.absolute, styles.modal]}>
                <Button transparent style={[styles.button, styles.closeButton]} onPress={this.close}>
                    <Icon name={'close'} type={'MaterialCommunityIcons'} style={styles.icon}/>
                </Button>
                { buttons.map( (v, i) =>{
                    v.key = i;
                    v.icon.style = v.icon.style ? [styles.icon, v.icon.style] : styles.icon;
                    v.style = v.style ? [ styles.button , v.style] : styles.button;
                    v.transparent = true;
                    let callback = () => {
                        this.close();
                        v.callback(v.arg);
                    };
                    return Common.button(v, callback);
                } ) }
            </View>
        );
        return (
            <Drawer ref={(ref) => { this.drawer = ref; }} open={this.state.open}
                    side={'right'} type={"overlay"} openDrawerOffset={0}
                    onOpen={this._onOpen} onClose={this._onClose}
                    styles={drawerStyles}
                    content={content}
            >
                {this.props.children}
            </Drawer>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        padding: 0,
        marginTop: 8,
    },
    modal: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 20,
    },
    absolute: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width:60,
    },
    icon: {
        color:'#F0F0F0',
        fontSize: 28,
    },
    closeButton: {
        borderBottomWidth: 1,
        borderBottomColor: '#A0A0A0',
    },
});
