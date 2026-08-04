// ==UserScript==
// @name         博客转PDF(网页局部区域打印)-适用于知乎、CSDN、掘金、博客园、开源中国、简书、思否
// @namespace    https://greasyfork.org/zh-CN/scripts/428697
// @homepageURL  https://greasyfork.org/zh-CN/scripts/428697
// @home-url1    https://github.com/dossweet/sweet-WebJS
// @version      10.15
// @description  把知乎、CSDN、简书、博客园、开源中国、掘金、思否七大主流博客网站的文章部分另存为PDF，便于本地进行编辑。兼容chrome,firefox,edge浏览器，其余未测试
// @author       dossweet
// @include       https://zhuanlan.zhihu.com/p/*
// @include       https://www.zhihu.com/question/*/answer/*
// @include      https://www.zhihu.com/question/*
// @include      https://blog.csdn.net/*/article/details/*
// @include      https://*.blog.csdn.net/article/details/*
// @match        https://www.jianshu.com/p/*
// @include      https://www.cnblogs.com/*
// @include      https://juejin.cn/post/*
// @include      https://my.oschina.net/*/blog/*
// @include      https://my.oschina.net/*/*/blog/*
// @include      https://www.oschina.net/question/*
// @include      https://segmentfault.com/a/*
// @run-at      document-idle
// @icon        https://cdn.jsdelivr.net/gh/dossweet/sweet-WebJS@master/image/sweet.jpg
// @require     https://cdn.staticfile.org/jquery/1.9.1/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/jQuery.print@1.5.1/jQuery.print.min.js
// @require     https://code.jquery.com/jquery-migrate-1.2.1.min.js
// @note        v10.15 继续优化代码结构，重构为更清晰的配置驱动模式
// @note        v10.14 代码优化，提升脚本可维护性和稳定性
// @note        v10.13 优化知乎中公式重复出现问题逻辑
// @note        v10.12 修复知乎中公式重复出现的问题
// @note        v10.11 代码升级，采用更规范的写法 & 修复知乎公式打印失败的问题(较复杂) 1024程序员节快乐呀
// @note        v10.10 修复博客园长图片打印失败的问题
// @note        v10.9 修复掘金和思否图标添加失败的问题
// @note        v10.8 修复知乎平台公式图片加载失败问题
// @note        v10.7 修复由于知乎平台的代码优化导致的公式打印失败问题
// @note        v10.6 修复由于掘金改版导致的打印失效的问题&&修复知乎讨论页打印失败的问题&&恢复保留所有平台的作者信息
// @note        v10.5 修改脚本名称
// @note        v10.4 修复由于知乎改版带来的新bug以及question推荐页面强制跳转的bug
// @note        v10.3 删除许可证
// @note        v10.2 修复csdn页面打印不全的bug
// @note        v10.1 修复csdn个别页面失效问题
// @note        v10.0 整合了思否
// @note        v9.0 整合了开源中国
// @note        v8.0 整合了掘金
// @note        v7.0 整合了博客园
// @note        v6.0 整合了简书
// @note        v5.0 整合了csdn
// @note        v4.0 整合了知乎
// @note        v1.0 实现知乎网页打印功能
// ==/UserScript==
(function () {
    'use strict';
    const PAGE_TYPE = {
        ZHIHU: 0,
        CSDN: 1,
        JIANSHU: 2,
        CNBLOGS: 3,
        JUEJIN: 4,
        OSCHINA: 5,
        SEGMENTFAULT: 6
    };
    const PAGE_VARIANT = {
        NONE: 'none',
        ZHIHU_ARTICLE: 'zhihu_article',
        ZHIHU_ANSWER_DETAIL: 'zhihu_answer_detail',
        ZHIHU_QUESTION_LIST: 'zhihu_question_list',
        CSDN_ARTICLE: 'csdn_article',
        JIANSHU_ARTICLE: 'jianshu_article',
        CNBLOGS_ARTICLE: 'cnblogs_article',
        JUEJIN_ARTICLE: 'juejin_article',
        OSCHINA_BLOG: 'oschina_blog',
        OSCHINA_QUESTION: 'oschina_question',
        SEGMENTFAULT_ARTICLE: 'segmentfault_article'
    };
    const PRINT_OPTIONS = {
        debug: false,
        importCSS: true,
        printContainer: true,
        operaSupport: true
    };
    let page2pdfClick = false;
    let listItemNumber = 0;
    let buttonClickCount = 0;
    let opeArray = [];
    let dynamicStyleNodes = [];
    let safeWaitTimer = null;

    let pageConfigure = {
        parentDiv: "",
        firstChild: "",
        lastChild: "",
        index: 0,
        pageHref: "",
        ifNeedPageRedirect: false,
        currentPage: null,
        pageVariant: PAGE_VARIANT.NONE
    };
    let pageHref = window.location.href;//获取网址

    function assignPageConfig(config) {
        pageConfigure = Object.assign(pageConfigure, {
            pageHref: pageHref,
            parentDiv: "",
            firstChild: "",
            lastChild: "",
            ifNeedPageRedirect: false,
            pageVariant: PAGE_VARIANT.NONE
        }, config);
    }

    function setupZhihuAnswerDetailPage() {
        $(document).ready(function () {
            let readMoreBtn = document.querySelectorAll('.ContentItem-expandButton');
            for (let i = 0; i < readMoreBtn.length; i++) {
                readMoreBtn[i].click();
            }
        });

        let readAllAnswer = $('.ViewAll-QuestionMainAction');
        for (let i = 0; i < readAllAnswer.length; i++) {
            readAllAnswer[i].setAttribute('href', 'javascript:void(0)');
            readAllAnswer[i].addEventListener('click', () => {
                toAllAnswerPage();
            });
        }
    }

    function setupZhihuQuestionListPage() {
        let zhihuListItem = $(".List-item")[0];
        if (!zhihuListItem || !zhihuListItem.parentElement) {
            return;
        }
        zhihuListItem.parentElement.className = "listParent";
    }

    const PAGE_MATCHERS = [
        {
            match: function (href) {
                return href.indexOf("www.zhihu.com/question/") != -1 && href.indexOf("/answer/") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.ZHIHU,
                    pageVariant: PAGE_VARIANT.ZHIHU_ANSWER_DETAIL,
                    parentDiv: "QuestionButtonGroup",
                    firstChild: "FollowButton"
                });
                setupZhihuAnswerDetailPage();
            }
        },
        {
            match: function (href) {
                return href.indexOf("zhuanlan.zhihu.com/p") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.ZHIHU,
                    pageVariant: PAGE_VARIANT.ZHIHU_ARTICLE,
                    parentDiv: "ColumnPageHeader-Button",
                    firstChild: "ColumnPageHeader-WriteButton"
                });
            }
        },
        {
            match: function (href) {
                return href.indexOf("www.zhihu.com/question/") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.ZHIHU,
                    pageVariant: PAGE_VARIANT.ZHIHU_QUESTION_LIST,
                    parentDiv: "QuestionButtonGroup",
                    firstChild: "FollowButton"
                });
                setupZhihuQuestionListPage();
            }
        },
        {
            match: function (href) {
                return href.indexOf("csdn") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.CSDN,
                    pageVariant: PAGE_VARIANT.CSDN_ARTICLE,
                    parentDiv: "onlyUser",
                    lastChild: "toolbar-btn-write",
                    firstChild: "toolbar-btn-vip"
                });
            }
        },
        {
            match: function (href) {
                return href.indexOf("jianshu") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.JIANSHU,
                    pageVariant: PAGE_VARIANT.JIANSHU_ARTICLE,
                    parentDiv: "_26qd_C"
                });
            }
        },
        {
            match: function (href) {
                return href.indexOf("cnblogs") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.CNBLOGS,
                    pageVariant: PAGE_VARIANT.CNBLOGS_ARTICLE,
                    parentDiv: "navList"
                });
            }
        },
        {
            match: function (href) {
                return href.indexOf("juejin") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.JUEJIN,
                    pageVariant: PAGE_VARIANT.JUEJIN_ARTICLE
                });
            }
        },
        {
            match: function (href) {
                return href.indexOf("oschina") != -1 && href.indexOf("blog") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.OSCHINA,
                    pageVariant: PAGE_VARIANT.OSCHINA_BLOG,
                    parentDiv: "action-box"
                });
            }
        },
        {
            match: function (href) {
                return href.indexOf("oschina") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.OSCHINA,
                    pageVariant: PAGE_VARIANT.OSCHINA_QUESTION
                });
            }
        },
        {
            match: function (href) {
                return href.indexOf("segmentfault") != -1;
            },
            apply: function () {
                assignPageConfig({
                    currentPage: PAGE_TYPE.SEGMENTFAULT,
                    pageVariant: PAGE_VARIANT.SEGMENTFAULT_ARTICLE
                });
            }
        }
    ];

    function initializePageConfig() {
        for (let i = 0; i < PAGE_MATCHERS.length; i++) {
            if (PAGE_MATCHERS[i].match(pageHref)) {
                PAGE_MATCHERS[i].apply();
                break;
            }
        }
    }

    initializePageConfig();

    if (pageConfigure.ifNeedPageRedirect === true) {
        window.location.replace(pageConfigure.pageHref);
    }

    function toAllAnswerPage() {
        let index = pageConfigure.pageHref.indexOf("answer");
        let pageHref = pageConfigure.pageHref.substring(0, index - 1);
        window.location.replace(pageHref);
    }

    function appendElement(parent, element, beforeNode) {
        if (!parent || !element) {
            return;
        }
        if (beforeNode) {
            parent.insertBefore(element, beforeNode);
            return;
        }
        parent.appendChild(element);
    }

    function mountPrintEntry() {
        if (currentHandler && typeof currentHandler.mountEntry === 'function') {
            currentHandler.mountEntry();
        }
    }

    function runPrintFlow(beforePrint) {
        if (typeof beforePrint === 'function') {
            beforePrint();
        }
        transformPDF();
    }

    function printElement(selector) {
        $(selector).print(PRINT_OPTIONS);
    }

    function clearDynamicStyles() {
        while (dynamicStyleNodes.length > 0) {
            removeStyle();
        }
    }

    function bindTooltipHover() {
        $(".printButton").hover(function () {
            $(".tooltips").show(100);
        }, function () {
            $(".tooltips").hide(100);
        });
    }

    function bindCommonPrintClick(beforePrint) {
        $(".printButton").click(function () {
            if (typeof beforePrint === 'function') {
                beforePrint();
            }
            runPrintFlow(updateStyle);
        });
    }

    function getEntrySelector() {
        if (currentHandler && typeof currentHandler.getEntrySelector === 'function') {
            return currentHandler.getEntrySelector();
        }
        return '.printButton';
    }

    function createStandardPrintEntry(imageUrl, buttonText) {
        let entry = document.createElement("div");
        entry.innerHTML = '<button type="button" class="printButton">\n' +
            '        <img id="printLogo" src="' + imageUrl + '">\n' +
            '        <p>' + buttonText + '</p>\n' +
            '    </button>';
        entry.className = "pagePrint";
        return entry;
    }

    function createTooltipEntry(buttonText) {
        let tooltip = document.createElement("div");
        tooltip.innerHTML = '<div class="tooltip-one"></div>\n' +
            '    <div class="tooltip-two">' + buttonText + '</div>';
        tooltip.className = "tooltips";
        return tooltip;
    }

    function createFloatingPrintEntry(imageUrl) {
        let entry = document.createElement("div");
        entry.innerHTML =
            '        <div class="pagePrint panel-btn">\n' +
            '        <div>\n' +
            '        <img id="printLogo" src="' + imageUrl + '">\n' +
            '        </div>\n' +
            '        </div>\n';
        entry.className = "printButton";
        return entry;
    }

    function createJuejinPrintEntry(imageUrl) {
        let entry = document.createElement("div");
        entry.innerHTML =
            '        <div class="pagePrint panel-btn">\n' +
            '        <div class="tooltip">\n' +
            '        <img id="printLogo" src="' + imageUrl + '">\n' +
            '        </div>\n' +
            '        </div>\n';
        entry.className = "printButton";
        return entry;
    }

    function buildInlineButtonStyle(options) {
        return ".printButton {\n" +
            "        background-color: " + options.backgroundColor + ";\n" +
            "        color: white;\n" +
            "        border-radius: 3px;\n" +
            "        padding-right: " + (options.paddingRight || '5px') + " !important;\n" +
            "        margin-top: " + (options.marginTop || '8px') + " !important;\n" +
            "        margin-left: " + (options.marginLeft || '5px') + " !important;\n" +
            "        font-size: 14px;\n" +
            "        line-height: " + (options.lineHeight || '32px') + ";\n" +
            "        border: none;\n" +
            "        text-align: center;\n" +
            "        display: inline-flex;\n" +
            "    }\n" +
            "    #printLogo{\n" +
            "        width: 24px;\n" +
            "        height: 24px;\n" +
            "        margin-top: 5.25px;\n" +
            "    }\n" +
            "    ." + (options.wrapperClass || 'pagePrint') + "{\n" +
            "        display: -webkit-inline-box;\n" +
            "    }";
    }

    function buildZhihuButtonStyle() {
        return ".printButton {\n" +
            "        background-color: #056de8;\n" +
            "        color: white;\n" +
            "        padding: 0 12px;\n" +
            "        border-radius: 3px;\n" +
            "        margin-right: 5px;\n" +
            "        font-size: 14px;\n" +
            "        line-height: 34.5px;\n" +
            "        border: none;\n" +
            "        text-align: center;\n" +
            "        display: inline-flex;\n" +
            "    }\n" +
            "    #printLogo{\n" +
            "        width: 24px;\n" +
            "        height: 24px;\n" +
            "        margin-top: 5.25px;\n" +
            "    }\n" +
            "    .QuestionButtonGroup{\n" +
            "        display: -webkit-inline-box;\n" +
            "    }";
    }

    function buildBottomTooltipStyle(position) {
        return "    .tooltips{\n" +
            "        display: none;\n" +
            "        align-items: center;\n" +
            "        position: fixed;\n" +
            "        top: " + position.tipTop + "px;\n" +
            "        left: " + position.tipLeft + "px;\n" +
            "    }\n" +
            "    .tooltip-one {\n" +
            "        width: 0;\n" +
            "        height: 0;\n" +
            "        border-left: 6px solid transparent;\n" +
            "        border-right: 6px solid transparent;\n" +
            "        border-bottom: 12px solid black;\n" +
            "        margin-left: 20px;\n" +
            "    }\n" +
            "    .tooltip-two{\n" +
            "        background-color: black;\n" +
            "        color: white;\n" +
            "        font-size: 12px;\n" +
            "        width: 75px;\n" +
            "        height: 25px;\n" +
            "        text-align: center;\n" +
            "        border-radius: 5px;\n" +
            "        padding-top: 6px;\n" +
            "        margin-top: -5px;\n" +
            "    }";
    }

    function buildSideTooltipStyle(position) {
        return "    .tooltips{\n" +
            "        display: none;\n" +
            "        align-items: center;\n" +
            "        position: fixed;\n" +
            "        z-index: 3;\n" +
            "        top: " + position.tipTop + "px;\n" +
            "        left: " + position.tipLeft + "px;\n" +
            "    }\n" +
            "    .tooltip-one {\n" +
            "        width: 0;\n" +
            "        height: 0;\n" +
            "        border-top: 5px solid transparent;\n" +
            "        border-left: 10px solid black;\n" +
            "        border-bottom: 5px solid transparent;\n" +
            "        margin-left: 25px;\n" +
            "        margin-top: 5px;\n" +
            "    }\n" +
            "    .tooltip-two{\n" +
            "        background-color: black;\n" +
            "        color: white;\n" +
            "        font-size: 13px;\n" +
            "        width: 30px;\n" +
            "        height: 90px;\n" +
            "        text-align: center;\n" +
            "        border-radius: 5px;\n" +
            "        padding: 6px;\n" +
            "        margin-top: -15px;\n" +
            "    }";
    }

    function toggleZhihuQuestionPrintMode() {
        if (page2pdfClick === false) {
            if (buttonClickCount > 0) {
                removeStyle();
                buttonClickCount--;
            }
            page2pdfClick = true;
            addPrintText();
            $(".printButton").text('取消转换');
            return;
        }

        addStyle("    .pageButtons{\n        display:none;\n    }");
        page2pdfClick = false;
        $(".printButton").text('文章转PDF');
        buttonClickCount++;
    }

    function bindZhihuListEvents() {
        document.addEventListener('DOMNodeInserted', function () {
            let listItemLength = document.getElementsByClassName('List-item').length;
            if (opeArray.length == 0 || opeArray.includes(listItemLength) == false) {
                opeArray.push(listItemLength);
                if (page2pdfClick === true) {
                    addPrintText();
                }
            }
        });
    }

    // 关闭登录框
    function closeLogin() {
        if (pageConfigure.currentPage === PAGE_TYPE.ZHIHU) {
            let removeLoginModal = e => {
                if (e.target.innerHTML && e.target.getElementsByClassName('Modal-wrapper').length > 0) {
                    if (e.target.getElementsByClassName('Modal-wrapper')[0].querySelector('.signFlowModal')) {
                        let button = e.target.getElementsByClassName('Button Modal-closeButton Button--plain')[0];
                        if (button) button.click();
                    }
                }
            }
            document.addEventListener('DOMNodeInserted', removeLoginModal);
        }
    }

    closeLogin();

    let parentDiv = "";
    let firstChild = "";
    // 1代表csdn，4代表掘金，5代表开源中国，6代表思否
    // 在本脚本中，0-知乎，1-csdn，2-简书，3-博客园，4-掘金，5-开源中国，6-思否
    let div = "";
    let div1 = "";
    let div4 = "";
    let div5 = "";
    let div6 = "";
    const SITE_HANDLERS = {
        [PAGE_TYPE.ZHIHU]: {
            initElements: function () {
                firstChild = document.querySelector('.' + pageConfigure.firstChild);
                parentDiv = document.querySelector('.' + pageConfigure.parentDiv);
                div = createStandardPrintEntry("https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo.png", "文章转PDF");
            },
            mountEntry: function () {
                appendElement(parentDiv, div, firstChild);
            },
            getInitialStyle: function () {
                return buildZhihuButtonStyle();
            },
            updateStyle: function () {
                let zhihuArticleComment = $(".is-bottom")[0].parentElement;
                zhihuArticleComment.className = "articleComment";
                addStyle(".Post-Author{width:100%;}");
                addStyle(".FollowButton,.Reward,.Post-topicsAndReviewer,.RichContent-action,.articleComment,.RichContent-actions,.ContentItem-actions,.LabelContainer-wrapper,.css-d5ulu0-CatalogContainer{display:none !important;}");
            },
            print: function () {
                printElement(".Post-Main");
            }
        },
        [PAGE_TYPE.CSDN]: {
            initElements: function () {
                parentDiv = document.querySelector('.' + pageConfigure.parentDiv);
                div = createStandardPrintEntry("https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo.png", "文章转PDF");
            },
            mountEntry: function () {
                appendElement(parentDiv, div);
            },
            getInitialStyle: function () {
                return buildInlineButtonStyle({
                    backgroundColor: '#ff4d4d'
                });
            },
            bindClickHandlers: function () {
                bindCommonPrintClick();
            },
            updateStyle: function () {
                addStyle(".article-type-img,.blog-tags-box,.slide-content-box,.operating,#blog_detail_zk_collection,.article-heard-img,.read-count,#csdn-shop-window-top,#blogColumnPayAdvert{display:none !important;}\n");
                addStyle(".article-header-box,.baidu_pl{width:90% !important;}");
            },
            print: function () {
                printElement(".blog-content-box");
            }
        },
        [PAGE_TYPE.JIANSHU]: {
            initElements: function () {
                parentDiv = document.querySelector('.' + pageConfigure.parentDiv);
                div = document.createElement("button");
                div.innerHTML = '文章转PDF';
                div.className = "_1OyPqC _3Mi9q9 _1YbC5u printButton";
                div.type = "button";
            },
            mountEntry: function () {
                appendElement(parentDiv, div);
            },
            getInitialStyle: function () {
                return "";
            },
            bindClickHandlers: function () {
                $(".printButton").click(function () {
                    createParentEle(".ouvJEz", 0);
                    runPrintFlow(updateStyle);
                });
            },
            updateStyle: function () {
                addStyle("._3tCVn5,._1kCBjS,._19DgIp,._13lIbp,.d0hShY{display:none !important;}");
                addStyle(".rEsl9f{margin-bottom:5px;}");
            },
            print: function () {
                printElement("#jsPrint");
            }
        },
        [PAGE_TYPE.CNBLOGS]: {
            initElements: function () {
                parentDiv = document.querySelector('#' + pageConfigure.parentDiv);
                if (!parentDiv) {
                    parentDiv = document.getElementById("leftmenu").children[1];
                }
                div = document.createElement("li");
                div.innerHTML = '<a id="printButton" class="menu" href="javascript:void(0);">\n' +
                    '        文章转PDF' +
                    '    </a>';
                div.id = "pagePrint";
            },
            mountEntry: function () {
                appendElement(parentDiv, div);
            },
            getInitialStyle: function () {
                return buildInlineButtonStyle({
                    backgroundColor: '#ff4d4d'
                });
            },
            getEntrySelector: function () {
                return '#pagePrint';
            },
            bindClickHandlers: function () {
                $("#printButton").click(function () {
                    runPrintFlow(updateStyle);
                });
            },
            afterBind: function () {
                setTimeout(function () {
                    removeImgLazyLoading('#mainContent', 0);
                }, 1000);
            },
            updateStyle: function () {
                addStyle(".postDesc,#blog_post_info_block,#comment_form{display:none !important;}");
            },
            print: function () {
                printElement("#post_detail");
            }
        },
        [PAGE_TYPE.JUEJIN]: {
            initElements: function () {
                div = createJuejinPrintEntry("https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo-jj.png");
                div4 = createTooltipEntry("文章转PDF");
            },
            mountEntry: function () {
                appendElement(document.body, div);
                appendElement(document.body, div4);
            },
            getInitialStyle: function (layout) {
                let object = document.getElementsByClassName("panel-btn")[0];
                let btnLeft = 0;
                let btnTop = 0;
                let tipTop = 0;
                let tipLeft = 0;
                if (object) {
                    let pos = object.getBoundingClientRect();
                    btnLeft = pos.left;
                    btnTop = pos.top + pos.height * 9;
                    tipTop = btnTop + pos.height;
                    tipLeft = btnLeft - 5;
                } else {
                    let actualLeft = getElementLeft(object);
                    let actualTop = getElementTop(object);
                    btnLeft = actualLeft - layout.scrollLeft;
                    btnTop = actualTop - layout.scrollTop + object.offsetWidth * 1.25;
                    tipTop = btnTop + object.offsetHeight;
                    tipLeft = btnLeft - 5;
                }
                return ".pagePrint{\n" +
                    "        background-color: white;\n" +
                    "        border-radius: 50%;\n" +
                    "        text-align: center;\n" +
                    "        height: 4rem;\n" +
                    "        width: 4rem;\n" +
                    "        position: fixed;\n" +
                    "        top: " + btnTop + "px;\n" +
                    "        left: " + btnLeft + "px;\n" +
                    "        z-index: 1000;\n" +
                    "    }\n" +
                    "    #printLogo{\n" +
                    "        width:2rem;\n" +
                    "        height:2rem;\n" +
                    "        margin-top:1rem;\n" +
                    "    }\n" +
                    buildBottomTooltipStyle({
                        tipTop: tipTop,
                        tipLeft: tipLeft
                    });
            },
            bindClickHandlers: function () {
                bindCommonPrintClick();
            },
            updateStyle: function () {
                addStyle(".tag-list-box,.extension-banner,.follow-button{display:none !important;}");
                addStyle(".author-info-block{margin-bottom:0rem !important;}");
            },
            print: function () {
                printElement(".article");
            },
            bindHover: function () {
                bindTooltipHover();
            }
        },
        [PAGE_TYPE.OSCHINA]: {
            bindClickHandlers: function () {
                bindCommonPrintClick();
            }
        },
        [PAGE_TYPE.SEGMENTFAULT]: {
            initElements: function () {
                div = createFloatingPrintEntry("https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo05.png");
                div6 = createTooltipEntry("文章转PDF");
            },
            mountEntry: function () {
                appendElement(document.body, div);
                appendElement(document.body, div6);
            },
            getInitialStyle: function (layout) {
                let object = document.getElementsByClassName("dropdown")[2];
                let btnLeft = 0;
                let btnTop = 0;
                let tipTop = 0;
                let tipLeft = 0;
                if (object) {
                    let pos = object.getBoundingClientRect();
                    btnLeft = pos.left;
                    btnTop = pos.top + pos.height * 1;
                    tipTop = btnTop + pos.height;
                    tipLeft = btnLeft - 5;
                } else {
                    object = document.getElementsByClassName("dropdown")[1];
                    let actualLeft = getElementLeft(object);
                    let actualTop = getElementTop(object);
                    btnLeft = actualLeft - layout.scrollLeft;
                    btnTop = actualTop - layout.scrollTop + object.offsetWidth * 1.25;
                    tipTop = btnTop + object.offsetHeight;
                    tipLeft = btnLeft - 5;
                }
                return ".pagePrint{\n" +
                    "        background-color: white;\n" +
                    "        border-radius: 50%;\n" +
                    "        text-align: center;\n" +
                    "        height: 2em;\n" +
                    "        width: 2em;\n" +
                    "        position: fixed;\n" +
                    "        top: " + btnTop + "px;\n" +
                    "        left: " + btnLeft + "px;\n" +
                    "        z-index: 1000;\n" +
                    "    }\n" +
                    "#printLogo{\n" +
                    "        width:1.2em;\n" +
                    "        height:1.2em;\n" +
                    "        margin-top:0.4em;\n" +
                    "    }\n" +
                    buildBottomTooltipStyle({
                        tipTop: tipTop,
                        tipLeft: tipLeft
                    });
            },
            bindClickHandlers: function () {
                bindCommonPrintClick();
            },
            updateStyle: function () {
                addStyle(".functional-area-bottom,.flex-sm-row,.pt-4 align-items-center row{display:none !important;}");
            },
            print: function () {
                printElement(".card-body");
            },
            bindHover: function () {
                bindTooltipHover();
            }
        }
    };
    const VARIANT_HANDLER_OVERRIDES = {
        [PAGE_VARIANT.ZHIHU_ARTICLE]: {
            bindClickHandlers: function () {
                $(".printButton").click(function () {
                    if (getBrowserUserAgent()) {
                        runPrintFlow(function () {
                            removeImgLazyLoading('.Post-Main', 0);
                            updateStyle();
                        });
                        return;
                    }
                    let el = document.getElementsByTagName('article')[0];
                    specialPrint(el, 'article');
                });
            }
        },
        [PAGE_VARIANT.ZHIHU_ANSWER_DETAIL]: {
            bindClickHandlers: function () {
                $(".printButton").click(toggleZhihuQuestionPrintMode);
            },
            bindPageEvents: function () {
                bindZhihuListEvents();
            }
        },
        [PAGE_VARIANT.ZHIHU_QUESTION_LIST]: {
            bindClickHandlers: function () {
                $(".printButton").click(toggleZhihuQuestionPrintMode);
            },
            bindPageEvents: function () {
                bindZhihuListEvents();
            }
        },
        [PAGE_VARIANT.OSCHINA_BLOG]: {
            initElements: function () {
                parentDiv = document.querySelectorAll('.' + pageConfigure.parentDiv)[1];
                div = document.createElement("div");
                div.innerHTML =
                    '        <div class="action-item__button">\n' +
                    '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo04.png">\n' +
                    '        </div>\n' +
                    '        <div class="action-item__text">\n' +
                    '        <p>转PDF</p>' +
                    '        </div>\n';
                div.className = "action-item printButton";
            },
            mountEntry: function () {
                appendElement(parentDiv, div);
            },
            getInitialStyle: function () {
                return "    #printLogo{\n" +
                    "        width:1.1em;\n" +
                    "        height:1.1em;\n" +
                    "    }\n";
            },
            updateStyle: function () {
                addStyle(".article-box__group,.tags-box,.copyright-box,.action-box,.recommend-box,.comment-box{display:none !important;}");
                addStyle(".article-box__meta,.item-list{display:inline-flex;}");
                addStyle(".item{margin-right:1rem;}");
            },
            print: function () {
                printElement(".article-box");
            }
        },
        [PAGE_VARIANT.OSCHINA_QUESTION]: {
            initElements: function () {
                div1 = document.createElement("div");
                div1.innerHTML =
                    '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo04.png">\n';
                div1.className = "printButton";
                div5 = createTooltipEntry("文章转PDF");
            },
            mountEntry: function () {
                appendElement(document.body, div1);
                appendElement(document.body, div5);
            },
            getInitialStyle: function (layout) {
                let object = document.getElementsByClassName("codeBlock")[0];
                let objectIcon = document.getElementsByClassName("codeIcon")[0];
                let btnLeft = 0;
                let btnTop = 0;
                let btnWidth = 0;
                let tipTop = 0;
                let tipLeft = 0;
                if (object) {
                    let pos = object.getBoundingClientRect();
                    btnLeft = pos.left;
                    btnTop = pos.top - pos.height - 3;
                    btnWidth = pos.width * 0.935;
                    tipTop = btnTop;
                    tipLeft = btnLeft - btnWidth;
                } else {
                    let actualLeft = getElementLeft(object);
                    let actualTop = getElementTop(object);
                    btnLeft = actualLeft - layout.scrollLeft;
                    btnTop = actualTop - layout.scrollTop + object.offsetWidth * 1.25;
                    btnWidth = object.offsetWidth * 0.93;
                    tipTop = btnTop;
                    tipLeft = btnLeft - btnWidth;
                }
                let margin = (btnWidth - objectIcon.offsetWidth) / 2;
                return "    .printButton{\n" +
                    "        position:fixed;\n" +
                    "        top:" + btnTop + "px;\n" +
                    "        left:" + btnLeft + "px;\n" +
                    "        width:" + btnWidth + "px;\n" +
                    "        height:" + btnWidth + "px;\n" +
                    "        z-index:2;\n" +
                    "        border: 1px solid #ddd;\n" +
                    "        background: #f5f5f5;\n" +
                    "        box-sizing: content-box;\n" +
                    "    }\n" +
                    "    #printLogo{\n" +
                    "        width:" + objectIcon.offsetWidth + "px;\n" +
                    "        height:" + objectIcon.offsetWidth + "px;\n" +
                    "        margin:" + margin + "px;\n" +
                    "    }\n" +
                    buildSideTooltipStyle({
                        tipTop: tipTop,
                        tipLeft: tipLeft
                    });
            },
            updateStyle: function () {
                addStyle(".tags,.poll-wrap,.additional-remarks,.segment{display:none !important;}");
            },
            print: function () {
                printElement(".article-detail");
            },
            bindHover: function () {
                bindTooltipHover();
            }
        }
    };
    const currentHandler = Object.assign(
        {},
        SITE_HANDLERS[pageConfigure.currentPage] || {},
        VARIANT_HANDLER_OVERRIDES[pageConfigure.pageVariant] || {}
    );
    if (typeof currentHandler.initElements === 'function') {
        currentHandler.initElements();
    }

    let cssStyle = "";
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    mountPrintEntry();
    if (typeof currentHandler.getInitialStyle === 'function') {
        cssStyle = currentHandler.getInitialStyle({
            scrollTop: scrollTop,
            scrollLeft: scrollLeft
        });
    }

    let cssNode = document.createElement("style");
    cssNode.id = "THT_Style";
    cssNode.setAttribute("type", "text/css");
    cssNode.innerHTML = cssStyle;
    document.body.appendChild(cssNode);

    if (typeof currentHandler.bindClickHandlers === 'function') {
        currentHandler.bindClickHandlers();
    }
    if (typeof currentHandler.afterBind === 'function') {
        currentHandler.afterBind();
    }

    function updateStyle() {
        if (currentHandler && typeof currentHandler.updateStyle === 'function') {
            currentHandler.updateStyle();
        }
    }

    function removeImgLazyLoading(parentDom, index) {
        let parentDiv = document.querySelectorAll(parentDom)[index];
        if (!parentDiv) {
            return;
        }
        let img = parentDiv.getElementsByTagName('img');
        for (let i = 0; i < img.length; i++) {
            img[i].removeAttribute('loading');
            img[i].removeAttribute('data-lazy-status');
        }
    }

    // 文章转pdf
    function transformPDF() {
        if (currentHandler && typeof currentHandler.print === 'function') {
            currentHandler.print();
        }

        clearDynamicStyles();
        safeWaitFunctionTT();
    }

    // 新增样式，去除局部打印区域中不要的元素
    function addStyle(style) {
        let newStyle = document.getElementById("THT_Style");
        if (!newStyle || !style) {
            return;
        }
        let textNode = document.createTextNode(style);
        newStyle.appendChild(textNode);
        dynamicStyleNodes.push(textNode);
    }

    // 恢复样式
    function removeStyle() {
        let newStyle = document.getElementById("THT_Style");
        let lastStyleNode = dynamicStyleNodes.pop();
        if (!newStyle || !lastStyleNode || lastStyleNode.parentNode !== newStyle) {
            return;
        }
        newStyle.removeChild(lastStyleNode);
    }

    //为现有节点添加新的父元素，便于操作当前节点
    function createParentEle(currentNode, newParentIndex) {
        let printDiv = $(currentNode)[newParentIndex];
        let parentNew = document.createElement("div");
        let parentID = "";
        if (pageConfigure.currentPage === PAGE_TYPE.ZHIHU) {
            parentID = 'newParentIndex' + newParentIndex;
        } else if (pageConfigure.currentPage === PAGE_TYPE.JIANSHU) {
            parentID = 'jsPrint';
        }
        parentNew.id = parentID;
        printDiv.parentNode.replaceChild(parentNew, printDiv);
        parentNew.appendChild(printDiv);
    }

    //需要使用offsetLeft，offsetTop方法。需要明确的是这两个方法都是当前元素相对于其父元素的位置，所以要得到相对于页面的距离需要循环计算。
    function getElementLeft(ele) {
        let actualLeft = ele.offsetLeft;
        let current = ele.offsetParent;
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    }

    function getElementTop(ele) {
        let actualTop = ele.offsetTop;
        let current = ele.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    function hoverEvent() {
        if (currentHandler && typeof currentHandler.bindHover === 'function') {
            currentHandler.bindHover();
        }
    }

    function eventListener() {//归纳所有的事件监听到一个函数
        if (currentHandler && typeof currentHandler.bindPageEvents === 'function') {
            currentHandler.bindPageEvents();
        }
    }

    function addPrintText() {
        //给每个讨论都加上打印的按钮，然后再打印
        let parentDiv = document.querySelectorAll('.AnswerItem-authorInfo');
        let temp = listItemNumber;
        for (let newIndex = temp; newIndex < parentDiv.length; newIndex++) {
            let div = document.createElement("div");
            let divId = "printButton" + newIndex;
            let behindDom = document.getElementsByClassName('AnswerItem-authorInfo')[newIndex].getElementsByTagName('button')[0];
            div.innerHTML = '<p id="' + divId + '"color:#4e6ef2;font-size: 14px;">\n' +
                '        转\n' +
                '    </p>';
            div.className = "pageButtons";
            div.setAttribute("style", "width: 34px; line-height:34px;text-align: center; border-radius: 50%; border: 1px solid #e6f0fd; margin-left: 10px; margin-right: 10px;cursor:pointer;");
            parentDiv[newIndex].insertBefore(div, behindDom);
            let className = "printButton" + newIndex;

            $(document).on("click", "#" + className, function () {
                let newParentId = "newParentIndex" + newIndex;
                createParentEle(".AnswerItem", newIndex);
                let cssStyle2 = "\n" + "#" + newParentId + ",.ModalExp-content,.LabelContainer-wrapper,.css-1k5dpte,.ContentItem-actions,.Reward{display:none;}" + "\n";
                addStyle(cssStyle2);
                // let buttonIndex = document.getElementById(className1).parentElement.parentElement.parentElement.parentElement.getAttribute('data-za-index');
                let buttonIndex = className.substring(11);
                transformAnswerPDF(buttonIndex);
            });
        }
        listItemNumber = parentDiv.length;
    }

    // 文章转pdf--讨论--知乎专用
    function transformAnswerPDF(buttonIndex) {
        let printDiv = $(".AnswerItem")[buttonIndex];
        let parentNew = document.createElement("div");
        let parentID = 'printDiv' + buttonIndex;
        parentNew.id = parentID;
        printDiv.parentNode.replaceChild(parentNew, printDiv);
        parentNew.appendChild(printDiv);
        removeImgLazyLoading(".AnswerItem", buttonIndex);
        let isFirefoxEnv = getBrowserUserAgent();
        switch (isFirefoxEnv) {
            case true:
                printElement("#" + parentID);
                break;
            case false:
                // 等待DOM节点挂载成功后，再执行打印操作
                Promise.resolve().then(() => {
                    let el = document.getElementById(parentID);
                    specialPrint(el, 'answer');
                });
                break;
        }
        removeStyle();
    }

    // 特殊打印，针对知乎文章里公式打印失败的问题
    function specialPrint(el, pageType) {
        if (!el) {
            return;
        }
        // 创建iframe
        let iframe = document.createElement("iframe");
        // 设置iframe样式
        iframe.setAttribute("id", "print-box");
        iframe.setAttribute(
            "style",
            "position:absolute;width:800px;height:500px;left:-500px;top:-500px;"
        );
        document.body.appendChild(iframe);
        // 获取iframe内的html
        let doc = iframe.contentWindow.document;
        // load iframe page resource
        loadIframePageHead(doc);
        // 将需要打印的DOM插入iframe
        let printMain = document.createElement("div");
        printMain.setAttribute("id", "print-box");
        printMain.innerHTML = el.innerHTML;
        doc.body.appendChild(printMain);
        // remove MathJax
        removeMathJax(doc, "span[id^='MathJax-']");
        // load iframe page resource
        loadIframePageScript(doc);
        let allImg = doc.getElementsByTagName("img");
        // add iframe style
        addIframeStyle(doc, pageType);
        loadImgWithoutLazyLoading(doc, allImg);

        function printIframe() {
            setTimeout(() => {
                // remove same dom
                removeSameDom(doc, "span[id^='MathJax-']");
                // 关闭iframe
                doc.close();
                // 使iframe失去焦点
                iframe.contentWindow.focus();
                // 调用iframe的打印方法
                iframe.contentWindow.print();
                // 移除iframe
                document.body.removeChild(iframe);
            }, 3000);
        }

        if (allImg.length === 0) {
            printIframe();
            return;
        }

        allImg[allImg.length - 1].onload = printIframe;
    }

    function loadIframePageHead(doc) {
        // 当前页面样式
        let headDom = document.getElementsByTagName("head");

        // 设置iframe内的header，添加样式文件
        for (let i = 0; i < headDom.length; i++) {
            doc.getElementsByTagName("head")[i].innerHTML = headDom[i].innerHTML;
        }

        let mathJax_Message = document.getElementById("MathJax_Message");
        if (mathJax_Message) {
            mathJax_Message.setAttribute("style", "display:none;");
        }
    }

    function loadIframePageScript(doc) {
        let scriptDom = document.getElementsByTagName("script");

        // 添加内联script
        let js_clientConfig_script = document.getElementById('js-clientConfig');
        let js_initialData_script = document.getElementById('js-initialData');
        if (js_clientConfig_script) {
            let configScriptClone = js_clientConfig_script.cloneNode(true);
            configScriptClone.setAttribute("nonce", "");
            doc.body.append(configScriptClone);
        }
        if (js_initialData_script) {
            let initialDataScriptClone = js_initialData_script.cloneNode(true);
            initialDataScriptClone.setAttribute("nonce", "");
            doc.body.append(initialDataScriptClone);
        }

        // 在iframe中插入script
        for (let i = 0; i < scriptDom.length; i++) {
            if (!scriptDom[i].src && !scriptDom[i].type) continue;
            let mathJax = document.createElement("script");
            if (scriptDom[i].id) {
                mathJax.id = scriptDom[i].id;
            }

            if (scriptDom[i].src) {
                mathJax.setAttribute("crossorigin", "");
                mathJax.src = scriptDom[i].src;
            }

            if (scriptDom[i].type) {
                mathJax.type = scriptDom[i].type;
            }
            doc.body.appendChild(mathJax);
        }
    }

    function addIframeStyle(doc, pageType) {
        let domStyle = document.createElement('style');
        switch (pageType) {
            case 'answer':
                domStyle.innerHTML = '.css-1vse7nz{display:flex;}\n .ContentItem-actions,.RichText-ADLinkCardContainer,.RichText-MCNLinkCardContainer,.Reward{display: none;}';
                break;
            case 'article':
                domStyle.innerHTML = 'h1{font-size: 25px; font-weight: bold;}\n .Post-Author{width:100%;}\n .FollowButton,.Reward,.Post-topicsAndReviewer,.RichContent-action,.articleComment,.RichContent-actions,.ContentItem-actions,.LabelContainer-wrapper,.css-d5ulu0-CatalogContainer{display:none !important;}';
                break;
        }
        doc.getElementsByTagName('head')[0].appendChild(domStyle);
    }

    function loadImgWithoutLazyLoading(allImg) {
        for (let i = 0; i < allImg.length; i++) {
            allImg[i].removeAttribute('loading');
            allImg[i].removeAttribute('data-lazy-status');
            let dataSrc = allImg[i].getAttribute('data-actualsrc');
            if (dataSrc) {
                allImg[i].src = dataSrc;
            }
        }
    }

    function removeMathJax(document, dom) {
        let mathJaxs = document.querySelectorAll(dom);
        for (let i = 0; i < mathJaxs.length; i++) {
            mathJaxs[i].parentNode.removeChild(mathJaxs[i]);
        }
    }

    function removeSameDom(document, dom) {
        let mathJaxs = document.querySelectorAll(dom);
        for (let i = 1; i < mathJaxs.length; i++) {
            if (mathJaxs[i].id === mathJaxs[i - 1].id) {
                mathJaxs[i].parentNode.removeChild(mathJaxs[i]);
            }
        }
    }

    //修改博客园导航栏的宽度
    function updateNavWidth() {
        if (pageConfigure.currentPage === PAGE_TYPE.CNBLOGS) {
            let a = document.getElementById("pagePrint");
            if (!a) {
                return;
            }
            let width = getComputedStyle(a).width.replace("px", "");
            let fontSize = getComputedStyle(a).fontSize.replace("px", "");
            if (fontSize >= 14 && fontSize * 6 > width) {
                let newCss = "\n#pagePrint{width:" + fontSize * 7.5 + "px !important;}\n";
                let styleNode = document.getElementById("THT_Style");
                styleNode.appendChild(document.createTextNode(newCss));
            }
        }
    }

    // 判断浏览器的环境
    function getBrowserUserAgent() {
        return /firefox/i.test(navigator.userAgent);
    }

    //写一个周期函数，检测文章转pdf的按钮有没有加上
    function safeWaitFunctionTT() {
        if (safeWaitTimer) {
            clearInterval(safeWaitTimer);
        }
        safeWaitTimer = setInterval(function () {
            let mountedEntry = document.querySelectorAll(getEntrySelector());
            if (mountedEntry.length == 0) {
                mountPrintEntry();
                clearInterval(safeWaitTimer);
                safeWaitTimer = null;
            }
        }, 500);
    }

    eventListener();
    updateNavWidth();
    safeWaitFunctionTT();
    hoverEvent();
})
();
