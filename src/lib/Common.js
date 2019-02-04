'use strict';

import { Platform, Text, Dimensions } from "react-native";
import { Button, Icon } from "native-base";
import React from "react";

const scr = Dimensions.get("window");
const platform = Platform.OS;
const isIphoneX = platform === "ios" && (scr.height === 812 || scr.width === 812);
const isIphoneXR = platform === "ios" && (scr.height === 896 || scr.width === 896);

export default {
    /* this trim, ltrim, rtrim is copy from https://www.somacon.com/p355.php, © Shailesh N. Humbad */
    trim : function(stringToTrim) {
        return stringToTrim.replace(/^\s+|\s+$/g,"");
    },

    ltrim : function(stringToTrim) {
        return stringToTrim.replace(/^\s+/,"");
    },

    rtrim : function(stringToTrim) {
        return stringToTrim.replace(/\s+$/,"");
    },

    /* -------------------------------------------------------------------------------------------- */

    sleep : async function(ms) {
        return new Promise(res => setTimeout(res, ms));
    },

    equal : function (x, y) {
        if ( x === y ) return true;
        if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
        if ( x.constructor !== y.constructor ) return false;
        return JSON.stringify(x) === JSON.stringify(y);
    },

    defaultIconType : "MaterialCommunityIcons",

    icon : function(obj) {
        const type = obj.type ? obj.type : this.defaultIconType;
        let styles = [];
        if (obj.style) styles.push(obj.style);
        if (obj.rotate) {
            if ( Number.isInteger(obj.rotate)) obj.rotate += 'deg';
            styles.push({transform: [{ rotateZ: obj.rotate }]});
        }
        if (obj.flip) styles.push(
            obj.flip === 'vertical' ? {transform: [{ rotateX: '180deg'}]} : {transform: [{ rotateY: '180deg'}]}
        );
        if(obj.name)
            return (
                <Icon key={obj.key} style={styles} type={type} name={obj.name} />
            );
        else return null;
    },

    text : function(obj){
        let styles = [];
        if (obj.style) styles.push(obj.style);
        if(obj.label)
            return(
                <Text key={obj.key} style={styles}>{obj.label}</Text>
            );
        else return null;
    },

    button : function(obj, callback=null) {
        let styles = [];
        if (obj.style) styles.push(obj.style);
            return (
                <Button style={styles} onPress={callback ? callback : () => obj.callback(obj.arg)}
                        key={obj.key}
                        bordered={obj.bordered}
                        transparent={obj.transparent}
                        rounded={obj.rounded}
                        block={obj.block}
                        full={obj.full}
                        iconLeft={obj.iconLeft}
                        iconRight={obj.iconRight}
                        small={obj.small}
                        large={obj.large}
                        disabled={obj.disabled}
                        light={obj.light}
                        primary={obj.primary}
                        success={obj.success}
                        info={obj.info}
                        warning={obj.warning}
                        danger={obj.danger}
                        dark={obj.dark}
                >
                    {obj.icon ? this.icon(obj.icon) : null }
                    {obj.text ? this.text(obj.text) : null }
                </Button>
            );
    },

    buttonList : function(list, styles={}, arg=null) {
        return list.map( (v, i) => {
            v.key = i;
            if(arg) v.arg = arg;
            if(v.icon && styles.icon)
                v.icon.style = v.icon.style ? Object.assign(v.icon.style, styles.icon) : styles.icon;
            if(v.text && styles.text)
                v.text.style = v.text.style ? Object.assign(v.text.style, styles.text) : styles.text;
            v.style = v.style ? Object.assign(v.style, styles.text) : styles.button;
            return Common.button(v);
        });
    },

    platform,

    isIphoneX,
    isIphoneXR,

    /* Below is copy from Native-Base */
    color: {
        primary: platform === "ios" ? "#007aff" : "#3F51B5",
        info: "#62B1F6",
        success: "#5cb85c",
        danger: "#d9534f",
        warning: "#f0ad4e",
        dark: "#000",
        light: "#f4f4f4",
        textColor: "#303030",
    },

    // Header
    header: {
        height: isIphoneXR ? 72 : 64,
        padding: platform === "ios" ? (isIphoneXR ? 26 : 4) : 18,
    },

    statusBar: {
        height: platform === "ios" ? 0 : 20,
    },

    toolbar: {
        btnColor: platform === "ios" ? "#007aff" : "#fff",
        defaultBg: platform === "ios" ? "#F8F8F8" : "#3F51B5",
        searchIconSize: platform === "ios" ? 20 : 23,
        inputColor: platform === "ios" ? "#CECDD2" : "#fff",
        btnTextColor: platform === "ios" ? "#007aff" : "#fff",
        defaultBorder: platform === "ios" ? "#a7a6ab" : "#3F51B5",
    },

    searchBar : {
        height: platform === "ios" ? 30 : 40,
        inputHeight: platform === "ios" ? 30 : 50,
    },

    input: {
        fontSize: 17,
        borderColor: "#D9D5DC",
        successBorderColor: "#2b8339",
        errorBorderColor: "#ed2f2f",
        heightBase: 50,
    },
};
