// ==UserScript==
// @name         关闭IDM提示去官网下载的弹窗
// @namespace    https://greasyfork.org/zh-CN/scripts/421429
// @version      1.0
// @description  使用IDM破解版后经常提示不安全并自动弹出去官网下载的页面，很烦人！！！故写了个脚本关闭该页面
// @author       sweet
// @match       https://www.internetdownloadmanager.com/download.html?lng=chn2
// @icon        https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @license     MIT
// ==/UserScript==
(function() {
    'use strict';
    window.close();//关闭弹窗
})();