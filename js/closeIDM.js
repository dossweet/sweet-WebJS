// ==UserScript==
// @name         关闭IDM提示去官网下载的标签页
// @namespace    https://greasyfork.org/zh-CN/scripts/421429
// @version      1.1
// @description  使用IDM破解版后经常提示不安全并自动弹出去官网下载的页面，很烦人！！！故写了个脚本关闭该页面
// @author       sweet
// @match       https://www.internetdownloadmanager.com/download.html?lng=chn2
// @run-at      document-start
// @icon        https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @license     MIT
// @note        v1.0实现拦截功能
// @note        v1.1加快拦截速度
// ==/UserScript==
(function() {
    'use strict';
    window.close();//关闭弹窗
})();