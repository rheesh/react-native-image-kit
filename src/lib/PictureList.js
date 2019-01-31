/**
 * @overview Definition of PictureList Class
 * for handling picture files in specific user folder.
 * last modified : 2019.01.09
 * @module lib/PictureList
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */

'use strict';
import Picture from './Picture';
import FileUtil from './FileUtil';


const defaultFolderName = 'images';

export default class PictureList {

    static indexFile = 'list.json';

    constructor(folder='images'){
        this._folder = folder;
        this._list = [];
        this._currentIndex = 0;
        this._initFolder();
    }

    get folder() {
        return FileUtil.documentFolder + this._folder;
    }

    get tempFolder() {
        return this.folder + '/' + Picture.tempFolderName;
    }

    get indexUri() {
        return this.folder + '/' + PictureList.indexFile;
    }

    get length() {
        return this._list.length;
    }

    get(i) {
        if (Number.isInteger(i)){
            let idx = parseInt(i);
            if (idx < 0 || idx >= this.length) return null;
            return this._list[idx];
        }else {
            let item = this.findByURI(i);
            if (item === undefined){
                let fileName = i.split('/').pop();
                item = this.findByName(fileName);
                if (item === undefined) return null;
                else return item;
            }
        }
    }

    map(func) {
        return this._list.map(func);
    }

    get list() {
        return this._list;
    }

    get currentIndex() {
        if (this.length === 0) return -1;
        else return this._currentIndex;
    }

    set currentIndex(idx) {
        if (idx < 0 || idx >= this.length) return -1;
        else return this._currentIndex = idx;
    }

    next() {
        if (this.length === 0) return null;
        let idx = this.currentIndex + 1;
        if (idx >= this.length) idx = 0;
        this.currentIndex = idx;
        return this.current();
    }

    prev() {
        if (this.length === 0) return null;
        let idx = this.currentIndex - 1;
        if (idx < 0) idx = this.length - 1;
        this.currentIndex = idx;
        return this.current();
    }

    get current() {
        if (this.length === 0) return null;
        else return this._list[this._currentIndex];
    }

    find(filter) {
        return this._list.find(filter);
    }

    findIndex(filter) {
        return this._list.findIndex(filter);
    }

    findByName(fileName) {
        return this.find( item => item.fileName === fileName);
    }

    findIndexByName(fileName) {
        return this.findIndex( item => item.fileName === fileName);
    }

    findByURI(uri) {
        return this.find( item => item.uri === uri);
    }

    findIndexByURI(uri) {
        return this.findIndex( item => item.uri === uri);
    }

    async _initFolder(){
        if (await FileUtil.confirmFolderExists(this.folder)){
            if (await FileUtil.confirmFolderExists(this.tempFolder)){
                await FileUtil.clearFolder(this.tempFolder);
                if(await FileUtil.exists(this.indexUri)){
                    if (! await this._readMediaList())
                        await this._rebuildMediaList();
                }else{
                    await this._rebuildMediaList();
                }
            } else throw "_initFolder of PictureList : Can not use folder " + this.tempFolder;
        } else throw "_initFolder of PictureList : Can not use folder " + this.folder;
    }

    async clearTempFolder(){
        await FileUtil.clearFolder(this.tempFolder);
    }

    async writeMediaList(){
        const list = this.map( item => {
            return { fileName: item.fileName, width: item.width, height: item.height };
        });
        await FileUtil.writeJSON(this.indexUri, list);
    }

    async _readMediaList(){
        let list = await FileUtil.readJSON(this.indexUri);
        if (list === null) list = [];
        let check = true;
        for ( let item of list ){
            let r = await FileUtil.exists(this.folder + '/' + item.fileName) && Picture.availableType(item.fileName);
            check = check && r;
        }
        if (check){
            this._list = list.map( item => {
                if (item.width && item.height)
                    return new Picture(this.folder + '/' + item.fileName, item.width, item.height, true);
                else
                    return new Picture(this.folder + '/' + item.fileName, 0, 0, true);
            });
        }
        return check;
    }

    async _rebuildMediaList() {
        this._list = [];
        let result = await FileUtil.fileList(this.folder);
        if (result !== null){
            result.forEach( item => {
                let fileName = FileUtil.fileName(item);
                if (Picture.availableType(fileName))
                    this._list.push(new Picture(this.folder + '/' + fileName, 0, 0, true));
            });
        }
        await this.writeMediaList();
    }

    async check() {
        let ghost = [];
        for (let item of this._list){
            let r = await item.exists();
            if(r){
                item.calcSize();
            }else{
                ghost.push(item);
            }
            console.log('check : ', item.fileName, r);
        }
        if(ghost.length > 0){
            while(ghost.length > 0){
                await this.remove(ghost.pop().uri)
            }
        }
    }

    async reset() {
        let r = true;
        for (let item of this._list){
            if ( null === await item.reset() )
                r = false;
        }
        await this.writeMediaList();
        return r;
    }

    async cleanup() {
        let r = true;
        for (let item of this._list){
            if ( null === await item.cleanup())
                r = false;
        }
        await this.writeMediaList();
        return r;
    }

    getIndex(uri=null){
        if (uri===null) return this.currentIndex;
        let idx;
        if (Number.isInteger(uri)){
            idx = parseInt(uri);
        }else{
            let fileName = FileUtil.fileName(uri);
            idx = this.findIndexByName(fileName);
            if (idx < 0){
                idx = this.findIndexByURI(uri);
            }
        }
        if (idx < this.length) return idx;
        else return -1;
    }

    async insert(src, width=0, height=0){
        if (Picture.availableType(src)) {
            const target = this.folder + '/' + FileUtil.uniqueName() + '.' + FileUtil.ext(src);
            let picture = await Picture.getPicture(src, width, height, target, true);
            if (picture !== null) {
                this._list.unshift(picture);
                await this.writeMediaList();
                return picture;
            }
        }
        return null;
    }

    async spawn(){
        let picture = await this.current.spawn(true);
        if (picture !== null){
            this._list.unshift(picture);
            this.currentIndex = 0;
            await this.writeMediaList();
        } else {
            console.log('PictureList.spawn : ', picture);
        }
        return picture;
    }

    async remove(uri=null){
        let idx = this.getIndex(uri);
        if (idx < 0) return null;
        try{
            let picture = this.get(idx);
            if (await picture.remove()){
                if (idx === this.currentIndex && idx > 0)
                    this.currentIndex = this.currentIndex - 1;
                this._list.splice(idx, 1);
                await this.writeMediaList();
                return picture;
            }
        } catch (e) {
            console.log("remove in PictureList", e);
        }
        return null;
    }

    async undo() {
        if (this.length > 0){
            const flag = await this.current.undo();
            if(! flag) await this.writeMediaList();
            return this.current;
        }
        return null;
    }

    async resize(width, height){
        if (this.length > 0){
            const flag = await this.current.resize(width, height);
            if(! flag) await this.writeMediaList();
            return true;
        }
        return null;
    }

    async clockwise(){
        if (this.length > 0){
            const flag = await this.current.clockwise();
            if(! flag) await this.writeMediaList();
            return true;
        }
        return null;
    }

    async counterClockwise(){
        if (this.length > 0){
            const flag = await this.current.counterClockwise();
            if(! flag) await this.writeMediaList();
            return true;
        }
        return null;
    }

    async crop(originX, originY, width, height){
        if (this.length > 0){
            const flag = await this.current.crop(originX, originY, width, height);
            if(! flag) await this.writeMediaList();
            return true;
        }
        return null;
    }

    async verticalFlip(){
        if (this.length > 0){
            const flag = await this.current.verticalFlip();
            if(! flag) await this.writeMediaList();
            return true;
        }
        return null;
    }

    async horizontalFlip(){
        if (this.length > 0){
            const flag = await this.current.horizontalFlip();
            if(! flag) await this.writeMediaList();
            return true;
        }
        return null;
    }
}
