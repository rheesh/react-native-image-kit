/**
 * @overview Definition of GridContainer component
 * for display pictures as grid style.
 * This source was adapted from and inspired by Halil Bilir's "React Native Photo Browser".
 * @see https://github.com/halilb/react-native-photo-browser
 *
 * last modified : 2019.01.28
 * @module components/GridContainer
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */


import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, FlatList, TouchableHighlight, View, StyleSheet, ViewPropTypes } from 'react-native';

import Photo from './Photo';

// 1 margin and 1 border width
const ITEM_MARGIN = 2;

export default class GridContainer extends React.Component {

    static propTypes = {
        style: ViewPropTypes.style,
        pictureList: PropTypes.object.isRequired,
        square: PropTypes.bool,
        onPhotoTap: PropTypes.func,
        itemPerRow: PropTypes.number,

        /*
         * refresh the list to apply selection change
         */
        onMediaSelection: PropTypes.func,

        /**
         * offsets the width of the grid
         */
        offset: PropTypes.number,
    };

    static defaultProps = {
        style: null,
        onPhotoTap: () => {},
        itemPerRow: 3,
        offset: 0,
        square: false,
    };

    constructor(props) {
        super(props);
        this.itemPerRow = props.itemPerRow;
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({ item, index }) => {
        const {
            onPhotoTap,
            square,
            offset,
        } = this.props;
        const itemPerRow = this.itemPerRow;
        const screenWidth = Dimensions.get('window').width - offset;
        const photoWidth = (screenWidth / itemPerRow) - (ITEM_MARGIN * (itemPerRow-1));
        return (
            <TouchableHighlight onPress={() => onPhotoTap(index)}>
                <View style={styles.row}>
                    <Photo
                        index={index}
                        width={photoWidth}
                        height={square ? photoWidth : photoWidth * 2 / 3}
                        resizeMode={'cover'}
                        thumbnail
                        picture={item}
                    />
                </View>
            </TouchableHighlight>
        );
    };

    render() {
        const { pictureList } = this.props;
        const itemPerRow = this.itemPerRow;
        return (
            <View style={styles.container} >
                <FlatList
                    horizontal={false}
                    keyExtractor={this.keyExtractor}
                    data={pictureList.list}
                    initialNumToRender={21}
                    numColumns={itemPerRow}
                    renderItem={this.renderItem}
                    refreshing={true}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        justifyContent: 'center',
        margin: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 1,
    },
});
