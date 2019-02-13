/**
 * @overview Definition of Picture Class
 * for handling picture file in user document directory
 * last modified : 2019.01.09
 * @module lib/Picture
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */
'use strict';

import { Image } from "react-native";
import { ImageManipulator } from "expo";
import FileUtil from "./FileUtil";

// Only image files of jpg type and png type are supported.
const imageType = new Set(['jpeg', 'jpg', 'png']);

let _tempFolderName = '_temp_';

export default class Picture {

    static get tempFolderName() {
        return _tempFolderName;
    }

    static set tempFolderName( folder ) {
        return _tempFolderName = folder;
    }


    /**
     * Ceate a picture
     * @param {string} uri - Picture file uri started with 'file:///'.
     * @param {number} width - Picture image width. 0 if unknown.
     * @param {number} height - Picture image height. 0 if unknown.
     * @param {boolean} tempFolderExist - Whether a temporary folder is created to keep the ImageManipulator application results.
     */
    constructor(uri, width=0, height=0, tempFolderExist = false) {
        if(uri.startsWith('file:///') && Picture.availableType(uri)){
            this._uri = uri;
            this._history = [ ];
            this._tempFolder = this.tempFolderURI;
            this.selected = false;
            this._tempFolderExist = tempFolderExist;
            this._initHistory(uri, width, height).catch(e => {
                console.log("constructor in Picture.js", e);
            });
        } else throw "Bad uri. Image file must be local file and png or jpg type.";
    }

    get tempFolderURI(){
        if (this.hasOwnProperty('_tempFolder')) return this._tempFolder;
        else if (this._uri.startsWith(FileUtil.documentFolder))
            return FileUtil.path(this._uri) + '/' + Picture.tempFolderName;
        else
            return FileUtil.documentFolder + '/' + Picture.tempFolderName;
    }

    async _initHistory(uri, width=0, height=0){
        const target = this.tempFolderURI + '/' + FileUtil.uniqueName() + '.' + this.ext;
        let item = {uri: target, width, height};
        this._history.unshift(item);
        if (! this._tempFolderExist){
            this._tempFolderExist = await FileUtil.confirmFolderExists(this._tempFolder);
            if (! this._tempFolderExist) return Promise.reject( "Can not create temp folder!");
        }
        if( await FileUtil.copy(uri, target)){
            if ( width === 0 || height === 0 ) await this.calcSize();
        } else return Promise.reject( "Can not create history!");
    }

    async _unshiftHistory(uri, width=0, height=0){
        const target = this.tempFolderURI + '/' + FileUtil.uniqueName() + '.' + this.ext;
        if( await FileUtil.move(uri, target) ){
            let item = {uri: target, width, height};
            this._history.unshift(item);
            if ( width === 0 || height === 0 ) await this.calcSize();
            return item;
        }
        return null;
    }

    get length() {
        return this._history.length;
    }

    get width() {
        if(this.length === 0) return 0;
        return this._history[0].width;
    }

    set width( value ) {
        if(this.length === 0) return 0;
        else return this._history[0].width = value;
    }

    get height() {
        if(this.length === 0) return 0;
        return this._history[0].height;
    }

    set height( value ) {
        if(this.length === 0) return 0;
        else return this._history[0].height = value;
    }

    get uri() {
        if (this.length > 0) return this._history[0].uri;
        else return this._uri;
    }

    get source(){
        return this._uri;
    }

    get path() {
        return FileUtil.path(this._uri);
    }

    get fileName() {
        return FileUtil.fileName(this._uri);
    }

    get ext() {
        return FileUtil.ext(this.uri);
    }

    static availableType(fileName) {
        try{
            let ext = FileUtil.ext(fileName);
            return imageType.has(ext);
        } catch (e) {
            console.log("availableType in Pictues.js", e);
        }
        return false;
    }

    static type(fileName) {
        let ext = FileUtil.ext(fileName);
        if (imageType.has(ext)){
            if (ext === 'png') return 'png';
            else return 'jpeg';
        }
        return '';
    }

    get format() {
        return Picture.type(this.uri);
    }

    calcSize() {
        try{
            Image.getSize(this.uri, (width, height) => {
                this._history[0].width = width;
                this._history[0].height = height;
                //console.log("calcSize in Pictues.js", width, height);
            });
        } catch (err){
            console.log("calcSize in Pictues.js", err);
        }
    }

    async exists() {
        return await FileUtil.exists(this.uri);
    }

    async _unshift(uri, width=0, height=0){
        const item = await this._unshiftHistory(uri, width, height);
        if(item) {
            if(! await FileUtil.copy(this.uri, this._uri)){
                this._history.shift();
                console.log('In _unshift of picture.js : ','Can not update original image!');
            }
        }
        return null;
    }

    cleanup(){
        if ( this.length > 1 ) {
            let history = this._history;
            this._history = [ history.shift() ];
            for (let item of history) {
                FileUtil.delete(item.uri);
            }
        }
        return false;
    }

    async reset() {
        let flag = true;
        if ( this.length > 1 ) {
            let src = this._history.pop();
            if (await FileUtil.copy(src.uri, this._uri)){
                flag = src.width === this.width && src.height === this.height;
                let history = this._history;
                this._history = [src];
                for (let item of history) {
                    await FileUtil.delete(item.uri);
                }
            } else {
                this._history.push(src);
                return null;
            }
        }
        return flag;
    }

    async undo() {
        let flag = true;
        if ( this.length > 1 ) {
            const last = this._history.shift();
            if (await FileUtil.copy(this.uri, this._uri)){
                flag = last.width === this.width && last.height === this.height;
                await FileUtil.delete(last.uri);
            }else{
                this._history.unshift(last);
                return null;
            }
        }
        return flag;
    }

    async remove() {
        for (let item of this._history) {
            await FileUtil.delete(item.uri);
        }
        this._history = [ ];
        await FileUtil.delete(this.uri);
        return this;
    }

    async copy(tempFolderExist=false) {
        const newPath = this.path + '/' + FileUtil.uniqueName() + '.' + this.ext;
        if (await FileUtil.copy(this.uri, newPath)){
            return new Picture(newPath, this.width, this.height, tempFolderExist);
        }
        return null;
    }

    async spawn(tempFolderExist=false) {
        let picture = await this.copy(tempFolderExist);
        if(picture) await this.reset();
        return picture;
    }

    /**
     * Download and create a picture and return.
     * @param {string} uri - Picture file uri started with 'file:///' or 'http://'
     * @param {number} width - Picture image width. 0 if unknown.
     * @param {number} height - Picture image height. 0 if unknown.
     * @param {number} downURI - Where picture file downloaded from "uri" will be stored.
     * @param {boolean} tempFolderExist
     * @returns {Promise<Picture>}
     */
    static async getPicture(uri, width=0, height=0, downURI=null, tempFolderExist=false){
        const orgName = FileUtil.fileName(uri);
        if (! downURI){
            downURI = orgName;
        }
        if (Picture.availableType(downURI)){
            const target = FileUtil.isFullPath(downURI) ? downURI : FileUtil.documentFolder + '/' + downURI;
            uri.startsWith('file:') ? await FileUtil.move(uri, target) : await FileUtil.download(uri, target);
            return new Picture(target, width, height, tempFolderExist);
        }
        return null;
    }

    static compress = 0.8;

    static base64 = false;

    async manipulate(options){
        const format = this.format;
        if ( format ){
            try{
                const result = await ImageManipulator.manipulateAsync(this.uri, options,
                    { compress: Picture.compress, format: format, base64: Picture.base64 });
                const flag = this.width === result.width && this.height === result.height;
                await this._unshift( result.uri, result.width, result.height );
                return flag;
            } catch (e) {
                console.log("manipulate in Picture :", e, "options :", options);
            }
        }
        return null;
    }

    async resize(width, height){
        width = Math.round(parseFloat(width));
        height = Math.round(parseFloat(height));
        if (isNaN(width) || isNaN(height) || width === 0 || height === 0) return null;
        return await this.manipulate([{ resize: { width: width, height: height } }]);
    }

    async rotate(angle){
        angle = parseFloat(angle);
        if (isNaN(angle) || angle === 0 ) return null;
        return await this.manipulate([{ rotate: angle}]);
    }

    async clockwise(){
        return await this.rotate( 90 );
    }

    async counterClockwise(){
        return await this.rotate( 270 );
    }

    async crop(originX, originY, width, height){
        originX = Math.round(parseFloat(originX));
        originY = Math.round(parseFloat(originY));
        width = Math.round(parseFloat(width));
        height = Math.round(parseFloat(height));
        if (isNaN(originX) || isNaN(originY) || isNaN(width) || isNaN(height) || width === 0 || height === 0) return null;
        return await this.manipulate([{ crop: { originX: originX, originY: originY, width: width, height: height } }]);
    }

    async verticalFlip(){
        return await this.manipulate([{ flip: { vertical: true }}]);
    }

    async horizontalFlip(){
        return await this.manipulate([{ flip: { horizontal: true }}]);
    }
}
