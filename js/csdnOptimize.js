// ==UserScript==
// @name         sweet-CSDN文章阅读优化，过滤推荐文章模块中的下载部分
// @namespace    https://greasyfork.org/zh-CN/scripts/421429
// @version      1.0
// @description  csdn文章阅读界面下侧的相关推荐中经常会混入下载板块，但是一般我们只是想看文章，不想跳到相关下载，因此想写个脚本过滤掉下载部分
// @author       sweet
// @include      *://blog.csdn.net/*/article/details/*
// @run-at      document-idle
// @icon        https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @license     GPL-3.0-only
// @note        v1.0实现过滤下载模块功能
// @require     https://cdn.staticfile.org/vue/2.6.11/vue.min.js
// @require     https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js
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
// ==/UserScript==
(function () {
    'use strict';
    // 待隐藏的class名称集合，目前只有一个
    var classNameArray = ['type_download'];

    // 隐藏元素
    function hideEle(className) {
        var hideElement = document.getElementsByClassName(className);
        if (hideElement) {
            for (var i = 0; i < hideElement.length; i++) {
                hideElement[i].style.cssText = "display:none";
            }
        }
    }

    //对于不同类的元素，写个方法来一起隐藏，目前只有下载一种需要隐藏
    function removeElements(classNameArray) {
        for (var i = 0; i < classNameArray.length; i++) {//批量执行隐藏操作
            hideEle(classNameArray[i]);
        }
    }

    // 安全等待函数
    function safeWaitFunc(classNameArray, callbackFunc, time) {
        var time = time || 50;
        var id = setInterval(function () {
            clearInterval(id);
            callbackFunc(classNameArray);
        }, time);
    }

    //打印脚本信息
    function printScript() {
        console.log("sweet-CSDN文章阅读优化，过滤相关推荐模块的下载部分~")
    }

    safeWaitFunc(classNameArray,removeElements);
    printScript();
})();