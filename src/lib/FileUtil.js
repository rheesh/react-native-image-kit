/**
 * @overview Definition of FileUtil Class
 * for handling user file in user document directory
 * last modified : 2019.01.09
 * @module lib/FileUtil
 * @author Seungho.Yi <rh22sh@gmail.com>
 * @package react-native-image-kit
 * @license MIT
 */
'use strict';

import { FileSystem } from "expo";

const uuidv4 = require('uuid/v4');


export default class FileUtil {

    static documentFolder = FileSystem.documentDirectory;
    static intermediates = true;
    static idempotent = true;

    static fileName(uri) {
        let fileName = uri.trim().split('/').pop();
        return fileName.split('?').shift();
    }

    static path(uri) {
        if (uri){
            let path = uri.trim().split('/');
            if (path.length > 1){
                path.pop();
                return path.join('/');
            }
        }
        return '';
    }

    static ext(uri) {
        let buf = FileUtil.fileName(uri).split('.');
        if(buf.length > 1)
            return buf.pop().toLowerCase();
        else return '';
    }

    static pureFileName(uri){
        let fileName = FileUtil.fileName(uri);
        let buf = fileName.split('.');
        if(buf.length > 1) {
            buf = buf.pop();
            return buf.join('.');
        }else return fileName;
    }

    static isFullPath(uri) {
        if (uri){
            let path = uri.trim().split('/');
            if(path.length > 1)
                return path[0].indexOf(':') > 0;
        }
        return false;
    }

    static isFileNameOnly(uri) {
        if (uri){
            uri = uri.trim();
            return uri.indexOf('/', 1) < 0;
        }
        return false;
    }

    static uniqueName(){
        return uuidv4();
    }

    static async exists(uri) {
        try{
            const result = await FileSystem.getInfoAsync(uri);
            return result.exists;
        }catch(err){
            console.log("exists in FileUtil.js", err);
        }
        return false;
    }

    static async isFolder(uri) {
        try{
            const result = await FileSystem.getInfoAsync(uri);
            return result.isDirectory ;
        }catch(err){
            console.log("exists in FileUtil.js", err);
        }
        return false;
    }

    static async copy(src, target){
        try{
            const options = {
                from : src,
                to : target,
            };
            await FileSystem.copyAsync(options);
            return true;
        } catch(err){
            console.log("copy in FileUtil.js : ", err);
            return false;
        }
    }

    static async move(src, target){
        try{
            let options ={
                from : src,
                to : target,
            };
            await FileSystem.moveAsync(options);
            return true;
        } catch(err){
            console.log("move in FileUtil.js", err);
            return false;
        }
    }

    static async delete(src){
        try{
            let options ={
                idempotent : FileUtil.idempotent,
            };
            await FileSystem.deleteAsync(src, options);
            return true;
        } catch(err){
            console.log("delete in FileUtil.js", err);
            return false;
        }
    }

    static async clearFolder(uri){
        try{
            const result = await FileSystem.getInfoAsync(uri);
            if (result.exists){
                if(result.isDirectory){
                    let result = await FileUtil.fileList(uri);
                    if (result !== null){
                        let res = true;
                        result.forEach( async item => {
                            let r = await FileUtil.delete(uri + '/' + item);
                            if ( ! r ) console.log("clearFolder in FileUtil.js : ", item + ' can not delete.');
                            res = res && r;
                        });
                        return res;
                    }
                }else{
                    console.log("clearFolder in FileUtil.js : ", uri + ' is not a folder.');
                }
            } else {
                console.log("clearFolder in FileUtil.js : ", uri + ' is not exists.');
            }
        }catch(err){
            console.log("clearFolder in FileUtil.js : ", err);
        }
        return false;
    }

    static async makeFolder(src){
        try{
            let options ={
                intermediates : FileUtil.intermediates,
            };
            await FileSystem.makeDirectoryAsync(src, options);
            return true;
        } catch(err){
            console.log("makeFolder in FileUtil.js", err);
            return false;
        }
    }

    static async confirmFolderExists(uri){
        try{
            let result = await FileSystem.getInfoAsync(uri);
            if(result.exists){
                if(result.isDirectory) return true;
                else{
                    console.log(uri + ' is exists but normal file!');
                    return false;
                }
            }else{
                await FileUtil.makeFolder(uri);
                return await FileUtil.exists(uri);
            }
        }catch(err){
            console.log("confirmFolderExists in FileUtil.js", err);
        }
        return false;
    }

    static async fileList(folder){
        try{
            return await FileSystem.readDirectoryAsync(folder);
        } catch(err){
            console.log("fileList in FileUtil.js", err);
            return null;
        }
    }

    static async download(src, target){
        try{
            let options ={
                md5 : false,
            };
            const result = await FileSystem.downloadAsync(src, target, options);
            return result.status;
        } catch(err){
            console.log("download in FileUtil.js", err);
            return 0;
        }
    }

    static async read(uri){
        try{
            return await FileSystem.readAsStringAsync(uri);
        } catch(err) {
            console.log("read in FileUtil.js", err);
        }
        return null;
    }

    static async write(uri, data){
        try{
            await FileSystem.writeAsStringAsync(uri, data);
        } catch(err) {
            console.log("write in FileUtil.js", err);
        }
        return null;
    }

    static async readJSON(uri){
        try{
            const json = await FileUtil.read(uri);
            if (json) return JSON.parse(json);
        } catch(err) {
            console.log("readJSON in FileUtil.js", err);
        }
        return null;
    }

    static async writeJSON(uri, obj){
        try{
            await FileUtil.write(uri, JSON.stringify(obj));
        } catch(err) {
            console.log("writeJSON in FileUtil.js", err);
        }
    }
}