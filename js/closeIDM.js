// ==UserScript==
// @name         关闭IDM提示去官网下载的标签页
// @namespace    https://greasyfork.org/zh-CN/scripts/421429
// @version      1.3
// @description  使用IDM破解版后经常提示不安全并自动弹出去官网下载的页面，很烦人！！！故写了个脚本关闭该页面
// @author       sweet
// @include     https://www.internetdownloadmanager.com/download*
// @run-at      document-start
// @icon        https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @grant       window.close
// @license     MIT
// @note        v1.3修复edge、firefox关闭标签页失败的问题
// @note        v1.2加大拦截力度
// @note        v1.1加快拦截速度
// @note        v1.0实现拦截功能
// ==/UserScript==
(function() {
    'use strict';
    window.close();//关闭弹窗
})();