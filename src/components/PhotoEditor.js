import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, TouchableWithoutFeedback, ViewPropTypes, ActionSheetIOS, Platform, Alert }
    from 'react-native';
import { Button, Icon, Input, Item, Card, CardItem, Body } from 'native-base';
import Popup from './Popup';
import BottomBar from './BottomBar';
import Photo from './Photo';

const TOOLBAR_HEIGHT = 120;

export default class PhotoEditor extends React.Component {

    static propTypes = {
        style: ViewPropTypes.style,
        picture: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        useCircleProgress: PropTypes.bool,
        useShare: PropTypes.bool,
        useSpawn: PropTypes.bool,
        onDelete: PropTypes.func,
        onSpawn: PropTypes.func,
        customBtn: PropTypes.array,
    };

    static defaultProps = {
        useShare: true,
        useSpawn: true,
        onDelete: null,
        onSpawn: null,
        customBtn: [],
    };

    constructor(props) {
        super(props);

        this._onClose = this._onClose.bind(this);
        this._onResizeByWidth = this._onResizeByWidth.bind(this);
        this._onResizeByHeight = this._onResizeByHeight.bind(this);
        this._onResize = this._onResize.bind(this);
        this._onCancel = this._onCancel.bind(this);
        this._onChangeWidthText = this._onChangeWidthText.bind(this);
        this._onChangeHeightText = this._onChangeHeightText.bind(this);
        this._onClockwise = this._onClockwise.bind(this);
        this._onCClockwise = this._onCClockwise.bind(this);
        this._onVerticalFlip = this._onVerticalFlip.bind(this);
        this._onHorizontalFlip = this._onHorizontalFlip.bind(this);
        this._onUndo = this._onUndo.bind(this);
        this._onReset = this._onReset.bind(this);
        this._onShare = this._onShare.bind(this);
        this._onDelete = this._onDelete.bind(this);
        this._onSpawn = this._onSpawn.bind(this);
        this._onCrop = this._onCrop.bind(this);
        this._onSliderChange = this._onSliderChange.bind(this);

        this.state = {
            picture: props.picture,
            modal: false,
            resize: '',
            width: '0',
            height: '0',
        };
        this.cropArea = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        };
        this._customBtn = [];
    }

    get customBtn() {
        return this.props.customBtn.concat(this._customBtn);
    }

    set customBtn(btns) {
        this._customBtn = btns;
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({picture: nextProps.picture});
        this.cropArea = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        };
        //console.log('componentWillReceiveProps:', this.inputWidth._root);
    }

    async _onClose(){
        await this.state.picture.cleanup();
        this.props.onClose(this.state.picture);
    }

    _onResizeByWidth(){
        this.setState({
            modal: true,
            resize: 'w',
            width: String(this.state.picture.width),
            height : String(this.state.picture.height),
        });
    }

    _onResizeByHeight(){
        this.setState({
            modal: true,
            resize: 'h',
            width: String(this.state.picture.width),
            height : String(this.state.picture.height),
        });
    }

    _onChangeWidthText( text ){
        if (text){
            const width = Number(text);
            this.setState({
                width: String(width),
                height : String(Math.round(this.state.picture.height / this.state.picture.width * width)),
            });
        } else {
            this.setState({
                width: '',
                height : '0',
            });
        }
    }

    _onChangeHeightText( text ){
        console.log('_onChangeHeightText', text);
        if (text){
            const height = Number(text);
            this.setState({
                height: String(height),
                width : String(Math.round(this.state.picture.width / this.state.picture.height * height)),
            });
        } else {
            this.setState({
                height: '',
                width : '0',
            });
        }
    }

    async _onResize(){
        let picture = await this.state.picture.resize(this.state.width, this.state.height);
        if (picture === null){
            this.setState({
                modal: false,
            });
        } else {
            this.setState({
                modal: false,
                picture: picture,
            });
        }
    }

    _onCancel(){
        this.setState({
            modal: false,
        });
    }


    async _onClockwise() {
        await this.state.picture.counterClockwise();
        this.forceUpdate();
    }

    async _onCClockwise() {
        await this.state.picture.clockwise();
        this.forceUpdate();
    }

    async _onVerticalFlip() {
        await this.state.picture.verticalFlip();
        this.forceUpdate();
    }

    async _onHorizontalFlip() {
        await this.state.picture.horizontalFlip();
        this.forceUpdate();
    }

    async _onCrop() {
        const { top, left, right, bottom } = this.cropArea;
        const picture = this.state.picture;
        const originX = left;
        const originY = top;
        const width = picture.width - left - right;
        const height = picture.height - top - bottom;
        console.log(originX, originY, width, height);
        await picture.crop(originX, originY, width, height);
        this.forceUpdate();
    }

    async _onUndo() {
        await this.state.picture.undo();
        this.forceUpdate();
    }

    async _onReset() {
        await this.state.picture.reset();
        this.forceUpdate();
    }

    _onShare() {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showShareActionSheetWithOptions(
                {
                    url: this.state.picture.uri,
                    message: 'Share  My Image',
                },
                () => {},
                () => {},
            );
        } else {
            alert(`handle sharing on android for ${this.state.picture.file}`);
        }
    }

    _onDelete() {
        if (this.props.onDelete) {
            this.props.onDelete(this.state.picture);
        }
    }

    _onSpawn() {
        const picture = this.state.picture;
        Alert.alert(
            'Notice',
            'Keep the original image and create a working copy with the current state.',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel overwriting image.'), style: 'cancel'},
                {
                    text: 'OK',
                    onPress: async () => {
                        let spawned;
                        if (this.props.onSpawn){
                            spawned = await this.props.onSpawn(picture);
                        }else spawned = await picture.spawn();
                        if (spawned)
                            this.setState({ picture : spawned});
                    }
                },
            ]
        );
    }

    _onSliderChange(direction, value) {
        switch(direction) {
            case 'down':
                this.cropArea.top = value;
                break;
            case 'up':
                this.cropArea.bottom = value;
                break;
            case 'ltr':
                this.cropArea.left = value;
                break;
            case 'rtl':
                this.cropArea.right = value;
                break;
            default:
                return;
        }
    }

    _renderPhoto(styles) {
        const { useCircleProgress } = this.props;
        const picture = this.state.picture;
        let height = this.props.height-TOOLBAR_HEIGHT;

        return (
            <View style={styles.flex}>
                <TouchableWithoutFeedback>
                    <Photo
                        useCircleProgress={useCircleProgress}
                        picture={picture}
                        height={height}
                        onSliderChange={this._onSliderChange}
                    />
                </TouchableWithoutFeedback>

            </View>
        );
    }

    _renderModal(styles) {
        let icon, callback, desc, value;
        switch(this.state.resize){
            case 'w' :
                icon = "arrow-expand-vertical";
                callback = this._onChangeWidthText;
                desc = 'height';
                value = this.state.width;
                break;
            case 'h' :
                icon = "arrow-expand-horizontal";
                callback = this._onChangeHeightText;
                desc = 'width';
                value = this.state.height;
                break;
            default:
                return;
        }
        return (
            <Card style={styles.card}>
                <CardItem header style={styles.block}>
                    <Text style={styles.title}> Resize </Text>
                </CardItem>
                <CardItem style={styles.block}>
                    <Body>
                        <Item >
                            <Icon style={styles.icon} type="MaterialCommunityIcons" name={icon} />
                            <Input style={styles.input} keyboardType={'number-pad'} autoFocus
                                   value={value} onChangeText={v => callback(v)}/>
                        </Item>
                        <Text style={styles.desc}>{`The ${desc} will be adjusted to maintain the aspect ratio.`}</Text>
                    </Body>
                </CardItem>
                <CardItem footer style={styles.block}>
                    <Button bordered warning style={styles.button} onPress={this._onCancel}>
                        <Text style={styles.warningText}>Cancel</Text>
                    </Button>
                    <Button bordered success style={styles.button} onPress={this._onResize}>
                        <Text style={styles.successText}>OK</Text>
                    </Button>
                </CardItem>
            </Card>
        );

    }

    get topLineBtn(){
        let buttons = [];
        if (this.props.onClose){
            buttons.push({
                callback: this._onClose,
                bordered: true,
                icon: {
                        name: 'logout-variant',
                        type: 'MaterialCommunityIcons',
                        flip: 'horizontal',
                    },
            })
        }
        if (this.props.useSpawn){
            buttons.push({
                callback: this._onSpawn,
                bordered: true,
                icon: {
                    name: 'add-to-photos',
                    type: 'MaterialIcons',
                },
                text: { label: 'Spawn' }
            })
        }
        buttons = buttons.concat(this.customBtn);
        if (this.props.useShare){
            buttons.push({
                callback: this._onShare,
                bordered: true,
                icon: {
                    name: 'share',
                    type: 'MaterialIcons',
                },
            })
        }
        if (this.props.onDelete){
            buttons.push({
                callback: this.props.onDelete,
                bordered: true,
                icon: {
                    name: 'delete',
                    type: 'MaterialIcons',
                },
            })
        }
        return buttons;
    }

    render() {
        const styles = this.getStyle();
        const picture = this.state.picture;

        return (
            <View style={[styles.flex, {height: this.props.height}]}>
                {this._renderPhoto(styles)}
                <BottomBar
                    height={TOOLBAR_HEIGHT}
                    picture={picture}
                    onCrop={this._onCrop}
                    onResizeByWidth={this._onResizeByWidth}
                    onResizeByHeight={this._onResizeByHeight}
                    onCClockwise={this._onClockwise}
                    onClockwise={this._onCClockwise}
                    onVerticalFlip={this._onVerticalFlip}
                    onHorizontalFlip={this._onHorizontalFlip}
                    onUndo={this._onUndo}
                    onReset={this._onReset}
                    customBtn={this.topLineBtn}
                />
                <Popup style={styles.modal} visible={this.state.modal} >
                    {this._renderModal(styles)}
                </Popup>
            </View>
        );
    }

    bottomLine = [
        {
            callback: (picture) => { this._onResizeByWidth(picture) },
            iconName: 'arrow-expand-horizontal',
            iconType: 'MaterialCommunityIcons',
            label: 'Apply',
        },
    ];

    getStyle() {
        return StyleSheet.create({
            flex: {
                flex: 1,
            },
            modal: {
                paddingTop: 20,
            },
            card: {
                height : 245,
                width : 260,
            },
            input: {
                width: 200,
                color: '#606060',
            },
            title: {
                fontWeight: 'bold',
            },
            desc: {
                marginTop: 8,
                fontSize: 10,
                color: "#62B1F6",
            },
            button: {
                justifyContent: 'center',
                width: 110,
            },
            successText: {
                color : "#5cb85c",
            },
            warningText: {
                color : "#f0ad4e",
            },
            block: {
                justifyContent: 'space-evenly',
            }
        });
    }
}
