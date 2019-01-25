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
        displaySelectionButtons: PropTypes.bool,
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
        displaySelectionButtons: false,
        onPhotoTap: () => {},
        itemPerRow: 3,
    };

    constructor(props) {
        super(props);
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({ item, index }) => {
      const {
        displaySelectionButtons,
        onPhotoTap,
        onMediaSelection,
        itemPerRow,
        square,
        offset,
      } = this.props;
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
                  displaySelectionButtons={displaySelectionButtons}
                  picture={item}
                  onSelection={(isSelected) => {
                    onMediaSelection(index, isSelected);
                  }}
              />
            </View>
          </TouchableHighlight>
      );
    };

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    horizontal={false}
                    keyExtractor={this.keyExtractor}
                    data={this.props.pictureList.list}
                    initialNumToRender={21}
                    numColumns={this.props.itemPerRow}
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
