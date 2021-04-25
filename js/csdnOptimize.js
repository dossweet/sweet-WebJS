// ==UserScript==
// @name         CSDN文章阅读优化，过滤相关推荐中的下载模块&免登录查看所有评论&去广告&免登录复制
// @namespace    https://greasyfork.org/zh-CN/scripts/425479
// @version      4.0
// @description  csdn文章阅读界面下侧的相关文章中会有下载模块，但是一般我们只是想看文章，不想跳到相关下载，因此想写个脚本过滤掉下载模块，同时还实现免登录查看所有评论的功能，评论保留翻页功能,页面实现去广告
// @author       sweet
// @include      *://blog.csdn.net/*/article/details/*
// @run-at      document-idle
// @icon        https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @license     GPL-3.0-only
// @note        v4.0实现免登录复制
// @note        v3.0实现去广告
// @note        v2.1完善免登录展开评论功能，评论可以自动翻页，现在不会弹登录窗口了
// @note        v2.0实现免登录展开评论功能，评论可以自动翻页
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
// @grant    GM_setClipboard
// @grant    unsafeWindow
// ==/UserScript==
(function () {
    'use strict';
    // 待隐藏的class名称集合
    var classNameArray = ['type_download', 'comment-list-box', 'text-center', 'd-none', 'login-mark'];
    var idNameArray = ['recommendAdBox'];
    var addStyle = GM_addStyle;
    var setClipboard = GM_setClipboard;

    // 隐藏元素
    function hideEle(className) {
        switch (className) {
            case 'type_download':
                let hideElement = document.querySelectorAll('.' + className);
                if (hideElement) {
                    for (let i = 0; i < hideElement.length; i++) {
                        hideElement[i].style.display = "none";
                    }
                }
                break;
            case 'comment-list-box':
                let hideElement01 = document.querySelector('.' + className);
                if (hideElement01) {
                    hideElement01.style = "";
                }
                break;
            case 'text-center':
                addStyle(".text-center{display:none;}");
                break;
            case 'd-none':
                addStyle(".d-none{display:block !important;}");
                break;
            case 'login-mark':
                addStyle(".login-mark,#passportbox{display:none !important;}");
                break;
        }
    }

    // 隐藏元素
    function hideEleById(idName) {
        switch (idName) {
            case 'recommendAdBox':
                let hideElement = document.querySelectorAll('#' + idName);
                if (hideElement) {
                    for (let i = 0; i < hideElement.length; i++) {
                        hideElement[i].style.display = "none";
                    }
                }
                break;
        }
    }

    //对于不同类的元素，写个方法来一起修正css样式
    function removeElements(classNameArray) {
        for (let i = 0; i < classNameArray.length; i++) {//批量执行操作
            hideEle(classNameArray[i]);
        }
    }

    //对于不同类的元素，写个方法来一起修正css样式
    function removeElementsById(idNameArray) {
        for (let i = 0; i < idNameArray.length; i++) {//批量执行操作
            hideEleById(idNameArray[i]);
        }
    }

    function safeWaitFunc(classNameArray, callbackFunc, time) {
        var times = time || 50;
        var id = setInterval(function () {
            clearInterval(id);
            callbackFunc(classNameArray);
        }, times);
    }

    function copyNoLogin(){
        $(".hljs-button").attr("data-title", "免登录复制");
        $(".hljs-button").click(function(){
            setClipboard(this.parentNode.innerText);//获取复制内容
            $(".hljs-button").attr("data-title", "复制成功");
            setTimeout(function(){
                $(".hljs-button").attr("data-title", "免登录复制");
            }, 1000);
        });
    }

    //打印脚本信息
    function printScript() {
        console.log("sweet-CSDN文章阅读优化，过滤相关推荐模块的下载部分&免登录查看全部评论&免登录复制&去广告~")
    }

    safeWaitFunc(classNameArray, removeElements);
    safeWaitFunc(idNameArray, removeElementsById);
    copyNoLogin();
    printScript();
})();