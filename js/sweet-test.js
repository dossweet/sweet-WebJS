// ==UserScript==
// @name         sweet-脚本测试线上版
// @namespace    https://greasyfork.org/
// @version      1.0
// @description  sweet-脚本测试，自己写着玩的
// @author       sweet
// @include      *baidu.com*
// @include      *google*
// @icon https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @require https://cdn.staticfile.org/vue/2.6.11/vue.min.js
// @require https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js
// @grant    GM_getValue
// @grant    GM.getValue
// @grant    GM_setValue
// @grant    GM.setValue
// @grant    GM_addStyle
// @grant    GM_getResourceURL
// @grant    GM_listValues
// @grant    GM_getResourceUrl
// @grant    GM.getResourceUrl
// @grant    GM_xmlhttpRequest
// @grant    GM_getResourceText
// @grant    GM_registerMenuCommand
// @grant    unsafeWindow
// @license  MIT
// ==/UserScript==

(function() {
    'use strict';
    console.log("sweet-script start...");
    // 隐藏的class集合
    var classArray = ['before-content','lemmaWgt-promotion-vbaike','topA','appdownload'];
    // 隐藏操作
    function hideClass(className){
        var hideEle = document.getElementsByClassName('.'+className);
        // hideEle.style.
    }

})();