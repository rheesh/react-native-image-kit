# React Native Image Kit

## Information

Expo provides several basic editing functions, such as resizing and cutting images through the ImageManipulator API. 
The purpose of this package is to provide the UI for users to take advantage of this feature.
React Native Image Kit depends on the following packages:

* Native Base
* Expo
* React Native Progress
* UUID

For more information, please refer to the "package.json".

## Installation

````
yarn add react-native-image-kit
````

## Usage

### PhotoEditor

````
import { Picture, PhotoEditor } from "react-native-image-kit";

    ...
    
    _onCloseEditor() {
        this._toggleFullScreen(false);
    }

    render() {
    
        let picture = new Picture(uri);
                        
        ...     
    
        return (
            ...
                <PhotoEditor
                    picture={picture} // picture should be "Picture" type object.
                    onClose={this._onCloseEditor}
                    topMargin={this.state.headerHeight+Common.statusBar.height}
                />
            ...
        );
    }
````

### PhotoBrowser

````
import React from 'react';
import { withNavigationFocus } from 'react-navigation';
import { PhotoBrowser, PictureList } from "react-native-image-kit"


class Images extends React.Component {

    static navigationOptions = {
        headerStyle: {
            display: 'none',
        },
    };

    ...

    _onClose = (pictureList) => {
        this.props.navigation.navigate('Home');
        pictureList.cleanup();
    };

    render() {
        let pictureList = new PictureList('images');
            
    
        return (
            <PhotoBrowser pictureList={pictureList} // pictureList should be "PictureList" type object.
                          isModal={false}
                          onClose={this._onClose}
                          show={this.props.isFocused}/>
        );
    }
}

export default withNavigationFocus(Images);

````

## Components

### PhotoEditor

Simple image editor component. It's editing function depends on the expo.ImageManipulator.

1. Properties

| Prop name          | Type     | Default value | Description                                                           | 
| ------------------ | -------- | ------------- | ----------------------------------------------------------------------|
| `style`            | Style    | `null`        | Overrides default container style.                                    |
| `picture`          | object   |               | Required, "Picture" type object.                                      |
| `onClose`          | function |               | Required, Custom function for closing PhotoEditor.                    |
| `onDelete`         | function | `null`        | Custom function to delete image file pointing to "picture" object.    |
| `onSpawn`          | function | `null`        | Receive a Picture object as a parameter and return a new Picture object that stores the current edit state, and you can continue state, and you can continue editing it. The image file that was originally passed to the feature property does not change. For more information, please refer to the _onSpawn() function in "PhotoEditor.js". |
| `onShare`          | function | `null`        | Receive a Picture object as a parameter and send it to other app. If this property is defined, displays button for sharing photo.       |
| `customBtn`        | array    | `[]`          | Array to specify custom buttons to be added to the toolbar.           |
| `useCircleProgress`| Boolean  | `false`       | If true, displays Progress.Circle. (Default : Progress.Bar)           |
| `useSpawn`         | Boolean  | `true`        | If true, displays button for spawning photo. If onSpawn is not specified, use the built-in function. |
| `topMargin`        | Number   | `0`           | Distance from the top of the screen to the top of the PhotoEditor component. (by pt) |
| `bottomMargin`     | Number   | `0`           | Distance from the bottom of the PhotoEditor component to the bottom of the screen. (by pt) |

2. Setter

| Prop name          | Type     | Default value | Description                                                           | 
| ------------------ | -------- | ------------- | ----------------------------------------------------------------------|
| customBtn          | array    | []            | Array to specify custom buttons to be added to the toolbar.           |

3. Getter

| Prop name          | Type     | Default value | Description                                                           | 
| ------------------ | -------- | ------------- | ----------------------------------------------------------------------|
| customBtn          | array    | []            | Returns an array that combines the values of the "customBtn" property and the "customBtn" setter. The custom button that is finally added to the toolbar is based on this value. |

### PhotoBrowser

Simple image browser component for predefined folder. 
When you click on the thumbnail of the image, PhotoEditor component open it.

1. Properties

| Prop name          | Type     | Default value | Description                                                           | 
| ------------------ | -------- | ------------- | ----------------------------------------------------------------------|
| `style`            | Style    | `null`        | Overrides default container style.                                    |
| `isModal`          | Boolean  | `true`        | If true, PhotoBrowser is full screen modal box.                       |
| `folder`           | String   | `'images'`    | Path to the image folder. THis path shoud be under "expo.FileSystem.documentDirectory" |
| `pictureList`      | Object   | `null`        | "PictureList" type object. If assigned, PhotoBrowser use this this list. Else, the PhotoBrowser will generate a PictureList object from the image files stored in the folder path.  |
| `onShare`          | function | `null`        | To pass sharing function to PhotoBrowser's PhotoEditor component      |
| `isModal`          | Boolean  | `true`        | If true, PhotoBrowser is full screen modal box.                       |
| `useSpawn`         | Boolean  | `true`        | If true, displays button for spawning photo in the PhotoEditor.       |
| `usePhotoLib`      | Boolean  | `true`        | If true, displays button for importing photo with the "expo.ImagePicker". |
| `getFromWeb`       | Boolean  | `true`        | If true, displays button for downloading photo from the web.          |
| `square`           | Boolean  | `false`       | If true, displays the thumbnails as squares.                          |
| `onClose`          | Boolean  | `true`        | If true, displays button for downloading photo from the web.          |
| `orientation`      | String   | `'auto'`      | One of 'auto', 'landscape', 'portrait'. It is effective only when the "isModal" is true. The orientation of the modal box is fixed according to the orientation value. If set to 'auto', use the current orientation of the device. |

2. Setter

| Prop name          | Type     | Default value | Description                                                           | 
| ------------------ | -------- | ------------- | ----------------------------------------------------------------------|
| `customBtn`        | array    | `[]`          | Array to specify custom buttons to be added to the toolbar.           |
| `customEditorBtn`  | array    | `[]`          | To pass custom button settings to PhotoBrowser's PhotoEditor component|

3. Getter

| Prop name          | Type     | Default value | Description                                                           | 
| ------------------ | -------- | ------------- | ----------------------------------------------------------------------|
| `customBtn`        | array    | `[]`          | Returns an array that combines the values of the "customBtn" property and the "customBtn" setter. The custom button that is finally added to the toolbar is based on this value. |
| `customEditorBtn`  | array    | `[]`          | Returns a custom button setting value for the PhotoEditor component called by the PhotoBrowser. |

## APIs

### Picture

Class to contain image file URI and edit history. Image file URI should be start with value of 
expo.FileSystem.documentDirectory.

#### constructor(fileUri, width=0, height=0, tempFolderExist=false)

**Arguments**

* fileUri (string) -- file:// URI to the image file, or a URI returned by CameraRoll.getPhotos(). (JPG or PNG only)

* width, height (number) -- The dimensions of the image.

* tempFolderExist (boolean) -- Whether a temporary folder is created. (for storing history of image manipulation)
                               If you are not sure, set false.

**Precautions**

* If zero is given for the width or height value, the asynchronous function is called internally to obtain this value. 

* If false is given for the tempFolderExist, the asynchronous function is called internally to create the temp folder.

### PictureList

Class to manage image files within a specific folder. The folder URI should be start with value of 
expo.FileSystem.documentDirectory. 

#### constructor(folder='images')

**Arguments**

* folder (string) -- URI to the image folder. Omit the preceding part equal to the expo.FileSystem.documentDirectory. 

## Example for custom buttons.

````
    let buttons = [
        {
            callback: this._onAction,
            bordered: true,
            icon: {
                name: 'icon name',
                type: 'icon type',
            },
            text: { label: 'action' }
        }
    ];
    
    return (
        <PhotoEditor
            picture={picture}
            useCircleProgress={false}
            onClose={this._onCloseEditor}
            onDelete={this._onDelete}
            onSpawn={this._onSpawn}
            useShare={this.props.useShare}
            useSpawn={this.props.useSpawn}
            topMargin={statusBarHeight}
            customBtn={buttons}
        />
    );
````

For the name and type of icon among the examples, see Native Base Package.

For more information, please refer to the "src/lib/Common.js".

## Changelog

**0.5.5**
- Rewrite EdgeSlider component. 

**0.5.4**
- Remove some bug(resize, etc...).  
- Add orientation props to Popup component.

**0.5.3**
- Remove some bug.

**0.5.2** 
- Remove some bug. (Heather Height Issues on Android, Property issues of the PhotoBrowser component)

**0.5.1**
- Modify readme.md


## Acknowledgement

* Many part of the React Native Image Kit was adapted from and inspired by Halil Bilir's "React Native Photo Browser".

* The EdgeSlider component was adapted from and inspired by Tomas Roos's "React Native Multi Slider."

* The OverlayMenu component was adapted from and inspired by @rt2zz's "React Native Drawer"

## License

**MIT**