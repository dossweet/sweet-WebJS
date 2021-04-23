// ==UserScript==
// @name         sweet-CSDN文章阅读优化，过滤推荐文章模块中的下载专区
// @namespace    https://greasyfork.org/zh-CN/scripts/421429
// @version      1.0
// @description  csdn文章阅读界面下侧的相关文章中会有下载模块，但是一般我们只是想看文章，不想跳到相关下载，因此想写个脚本过滤掉下载部分
// @author       sweet
// @include      *://blog.csdn.net/*/article/details/*
// @run-at      document-idle
// @icon        https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @license     GPL-3.0-only
// @note        v2.0实现免登陆展开评论功能，评论可以自动翻页
// @note        v1.0实现过滤下载模块功能
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
// ==/UserScript==
(function () {
    'use strict';
    // 待隐藏的class名称集合
    var classNameArray = ['type_download', 'comment-list-box', 'opt-box text-center', 'd-none'];

    // 隐藏元素
    function hideEle(className) {
        switch (className) {
            case 'type_download':
                let hideElement = document.querySelectorAll('.' + className);
                if (hideElement) {
                    for (let i = 0; i < hideElement.length; i++) {
                        hideElement[i].style.display = "none";
                        console.log("hello");
                    }
                }
                break;
            case 'comment-list-box':
                let hideElement01 = document.querySelector('.' + className);
                hideElement01.style = "";
                console.log("yes");
                break;
            case 'opt-box text-center':
                let hideElement02 = document.querySelector('.' + className);
                hideElement02.style.display = "none";
                console.log("ok");
                break;
            case 'd-none':
                let hideElement03 = document.querySelector('.' + className);
                hideElement03.style.removeProperty("display");
                hideElement03.style.setProperty("display","block","important");
                console.log("~~");
                break;
        }
    }


    //对于不同类的元素，写个方法来一起隐藏，目前只有下载一种需要隐藏
    function removeElements(classNameArray) {
        for (var i = 0; i < classNameArray.length; i++) {//批量执行隐藏操作
            hideEle(classNameArray[i]);
        }
    }

    function safeWaitFunc(classNameArray, callbackFunc, time) {
        var times = time || 50;
        var id = setInterval(function () {
            clearInterval(id);
            callbackFunc(classNameArray);
        }, times);
    }

    //打印脚本信息
    function printScript() {
        console.log("sweet-CSDN文章阅读优化，过滤相关推荐模块的下载部分~")
    }

    safeWaitFunc(classNameArray, removeElements);
    printScript();
})();