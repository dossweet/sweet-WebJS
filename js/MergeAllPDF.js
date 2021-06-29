// ==UserScript==
// @name         网页文章转PDF(网页局部区域打印)-适用于知乎/CSDN/简书/博客园/开源中国/掘金/思否
// @namespace    https://greasyfork.org/zh-CN/scripts/421429
// @version      10.0
// @description  把知乎、CSDN、简书、博客园、开源中国、掘金、思否等主流博客网站的文章部分另存为PDF，便于本地进行编辑。兼容chrome,firefox,edge浏览器，其余未测试
// @author       sweet
// @include       https://zhuanlan.zhihu.com/p/*
// @include       https://www.zhihu.com/question/*/answer/*
// @include      https://www.zhihu.com/question/*
// @include      https://blog.csdn.net/*/article/details/*
// @include      https://www.jianshu.com/p/*
// @include      https://www.cnblogs.com/*
// @include      https://juejin.cn/post/*
// @include      https://my.oschina.net/*/blog/*
// @include      https://my.oschina.net/*/*/blog/*
// @include      https://segmentfault.com/a/*
// @run-at      document-idle
// @icon        https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/sweet.jpg
// @require     https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/resources/jquery-1.9.1.min.js
// @require     https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/resources/jQuery.print.js
// @require     http://www.jq22.com/jquery/jquery-migrate-1.2.1.min.js
// @require     https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/resources/jquery-tooltipify.min.js
// @license     GPL3.0 only
// @note        v10.0整合了是否
// @note        v9.0整合了开源中国
// @note        v8.0整合了掘金
// @note        v7.0整合了博客园
// @note        v6.0整合了简书
// @note        v5.0整合了csdn
// @note        v4.0整合了知乎
// @note        v1.0实现知乎网页打印功能
// ==/UserScript==
(function () {
    'use strict';
    var page2pdfClick = false;
    var listItemNumber = 0;
    var buttonCLickCount = 0;
    var opeArray = new Array();
    var hasAddStyle = false;

    let pageConfigure = {//不同网址下的页面布局有可能不同
        parentDiv: "",
        firstChild: "",
        lastChild: "",
        index: 0,
        pageHref: "",
        ifNeedPageRedirect: false,
        currentPage: 0
    }
    var pageHref = window.location.href;//获取网址
    if (pageHref.indexOf("www.zhihu.com/question/") != -1 && pageHref.indexOf("/answer/") != -1) {//表示是讨论回答
        pageConfigure.index = pageHref.indexOf("answer");
        pageConfigure.pageHref = pageHref.substring(0, pageConfigure.index - 1);
        pageConfigure.parentDiv = "QuestionButtonGroup";
        pageConfigure.firstChild = "FollowButton";
        pageConfigure.ifNeedPageRedirect = true;
        pageConfigure.currentPage = 0;//表示是知乎
    } else if (pageHref.indexOf("zhuanlan.zhihu.com/p") != -1) {//表示是文章页
        pageConfigure.pageHref = pageHref;
        pageConfigure.parentDiv = "ColumnPageHeader-Button";
        pageConfigure.firstChild = "ColumnPageHeader-WriteButton";
        pageConfigure.currentPage = 0;//表示是知乎
    } else if (pageHref.indexOf("www.zhihu.com/question/") != -1) {//知乎讨论回答，包含所有回答
        pageConfigure.pageHref = pageHref;
        pageConfigure.parentDiv = "QuestionButtonGroup";
        pageConfigure.firstChild = "FollowButton";
        //给所有讨论的父节点添加className,便于后续监听页面懒加载
        var listParentDiv = $(".List-item")[0].parentElement;
        listParentDiv.className = "listParent";
        pageConfigure.currentPage = 0;//表示是知乎
    } else if (pageHref.indexOf("csdn") != -1) {//表示是csdn文章页
        pageConfigure.pageHref = pageHref;
        pageConfigure.parentDiv = "onlyUser";
        pageConfigure.lastChild = "toolbar-btn-write";
        pageConfigure.firstChild = "toolbar-btn-vip";
        pageConfigure.currentPage = 1;//表示是csdn
    } else if (pageHref.indexOf("jianshu") != -1) {//表示是简书文章页
        pageConfigure.pageHref = pageHref;
        pageConfigure.parentDiv = "_26qd_C";
        pageConfigure.currentPage = 2;//表示是简书
    } else if (pageHref.indexOf("cnblogs") != -1) {//表示是博客园
        pageConfigure.pageHref = pageHref;
        pageConfigure.parentDiv = "navList";
        pageConfigure.currentPage = 3;//表示是博客园
    } else if (pageHref.indexOf("juejin") != -1) {//表示是掘金文章页
        pageConfigure.pageHref = pageHref;
        pageConfigure.currentPage = 4;//表示是掘金
    } else if (pageHref.indexOf("oschina") != -1) {//表示是开源中国
        pageConfigure.pageHref = pageHref;
        pageConfigure.parentDiv = "action-box";
        pageConfigure.currentPage = 5;//表示是开源中国
    } else if (pageHref.indexOf("segmentfault") != -1) {//表示是思否
        pageConfigure.pageHref = pageHref;
        pageConfigure.currentPage = 6;//表示是思否
    }

    if (pageConfigure.ifNeedPageRedirect == true) {
        window.location.replace(pageConfigure.pageHref);
    }

    // 关闭登录框-仅适用于知乎
    function closeLogin() {
        if (pageConfigure.currentPage == 0) {
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

    var parentDiv = "";
    var firstChild = "";
    if (pageConfigure.currentPage == 0) {
        firstChild = document.querySelector('.' + pageConfigure.firstChild);
    }
    var div = "";
    if (pageConfigure.currentPage == 0 || pageConfigure.currentPage == 1) {
        parentDiv = document.querySelector('.' + pageConfigure.parentDiv);
        div = document.createElement("div");
        div.innerHTML = '<button type="button" class="printButton">\n' +
            '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo.png">\n' +
            '        <p>文章转PDF</p>\n' +
            '    </button>';
        div.className = "pagePrint";
    } else if (pageConfigure.currentPage == 2) {
        parentDiv = document.querySelector('.' + pageConfigure.parentDiv);
        div = document.createElement("button");
        div.innerHTML = '文章转PDF';
        div.className = "_1OyPqC _3Mi9q9 _1YbC5u printButton";
        div.type = "button";
    } else if (pageConfigure.currentPage == 3) {
        parentDiv = document.querySelector('#' + pageConfigure.parentDiv);
        if (!parentDiv) {//博客园特殊的一个网页模板
            parentDiv = document.getElementById("leftmenu").children[1];
        }
        div = document.createElement("li");
        div.innerHTML = '<a id="printButton" class="menu" href="javascript:void(0);">\n' +
            '        文章转PDF' +
            '    </a>';
        div.id = "pagePrint";
    } else if (pageConfigure.currentPage == 4) {
        div = document.createElement("div");
        div.innerHTML =
            '        <div class="pagePrint panel-btn">\n' +
            '        <div title="文章转PDF">\n' +
            '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo03.png">\n' +
            '        </div>\n' +
            '        </div>\n';
        div.className = "printButton";
    } else if (pageConfigure.currentPage == 5) {
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
    } else if (pageConfigure.currentPage == 6) {
        div = document.createElement("div");
        div.innerHTML =
            '        <div class="pagePrint panel-btn">\n' +
            '        <div title="文章转PDF">\n' +
            '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo05.png">\n' +
            '        </div>\n' +
            '        </div>\n';
        div.className = "printButton";
    }

    var cssStyle = "";
    var object = "";
    var pos = "";
    var btnTop = "";
    var btnLeft = "";
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    var tooltipify = ".tooltipify {\n" +
        "    background: #000;\n" +
        "    border-radius: 5px;\n" +
        "    z-index: 1000;\n" +
        "}\n" +
        "\n" +
        ".tooltipify > span.icon {\n" +
        "    border: 7px solid transparent;\n" +
        "    height: 0;\n" +
        "    position: absolute;\n" +
        "    width: 0;\n" +
        "}\n" +
        "\n" +
        ".tooltipify.left {\n" +
        "    margin-left: -10px;\n" +
        "}\n" +
        "\n" +
        ".tooltipify.bottom > span.icon {\n" +
        "    margin-left: 3px;\n" +
        "    border-top: 0;\n" +
        "    border-bottom-color: #000;\n" +
        "    top: -7px;\n" +
        "}\n" +
        ".tooltipify > .content {\n" +
        "    color: #FFF;\n" +
        "    font-size: 11px;\n" +
        "    font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n" +
        "    padding: 10px;\n" +
        "}\n";
    if (pageConfigure.currentPage == 0) {
        parentDiv.insertBefore(div, firstChild);//插在第一个按钮的前面
        cssStyle = ".printButton {\n" +
            "        background-color: #0066ff;\n" +
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
    } else if (pageConfigure.currentPage == 1) {
        parentDiv.appendChild(div);//插在最后一个按钮的后面
        cssStyle = ".printButton {\n" +
            "        background-color: #ff4d4d;\n" +
            "        color: white;\n" +
            "        border-radius: 3px;\n" +
            "        padding-right: 5px !important;\n" +
            "        margin-top: 8px !important;\n" +
            "        margin-left: 5px !important;\n" +
            "        font-size: 14px;\n" +
            "        line-height: 32px;\n" +
            "        border: none;\n" +
            "        text-align: center;\n" +
            "        display: inline-flex;\n" +
            "    }\n" +
            "    #printLogo{\n" +
            "        width: 24px;\n" +
            "        height: 24px;\n" +
            "        margin-top: 5.25px;\n" +
            "    }\n" +
            "    .pagePrint{\n" +
            "        display: -webkit-inline-box;\n" +
            "    }";
    } else if (pageConfigure.currentPage == 2) {
        parentDiv.appendChild(div);//插在最后一个按钮的后面
        cssStyle = "";
    } else if (pageConfigure.currentPage == 3) {
        parentDiv.appendChild(div);//插在最后一个按钮的后面
        cssStyle = ".printButton {\n" +
            "        background-color: #ff4d4d;\n" +
            "        color: white;\n" +
            "        border-radius: 3px;\n" +
            "        padding-right: 5px !important;\n" +
            "        margin-top: 8px !important;\n" +
            "        margin-left: 5px !important;\n" +
            "        font-size: 14px;\n" +
            "        line-height: 32px;\n" +
            "        border: none;\n" +
            "        text-align: center;\n" +
            "        display: inline-flex;\n" +
            "    }\n" +
            "    #printLogo{\n" +
            "        width: 24px;\n" +
            "        height: 24px;\n" +
            "        margin-top: 5.25px;\n" +
            "    }\n" +
            "    .pagePrint{\n" +
            "        display: -webkit-inline-box;\n" +
            "    }";
    } else if (pageConfigure.currentPage == 4) {
        document.body.appendChild(div);//插在最后一个按钮的后面
        object = document.getElementsByClassName("like-btn")[0];
        if (object) {
            pos = object.getBoundingClientRect();
            btnLeft = pos.left;
            btnTop = pos.top + pos.height * 10;
        } else {
            //当前浏览器不支持该方法
            var actualLeft = getElementLeft(object);
            var actualTop = getElementTop(object);
            btnLeft = actualLeft - scrollLeft;
            btnTop = actualTop - scrollTop + object.offsetWidth * 1.25;
        }
        cssStyle =
            ".pagePrint{\n" +
            "        background-color: white;\n" +
            "        border-radius: 50%;\n" +
            "        text-align: center;\n" +
            "        height: 3em;\n" +
            "        width: 3em;\n" +
            "        position: fixed;\n" +
            "        top: " + btnTop + "px;\n" +
            "        left: " + btnLeft + "px;\n" +
            "        z-index: 1000;\n" +
            "    }\n" +
            "    #printLogo{\n" +
            "        width:2em;\n" +
            "        height:2em;\n" +
            "        margin-top:0.5em;\n" +
            "    }\n" + tooltipify;
    } else if (pageConfigure.currentPage == 5) {
        parentDiv.appendChild(div);
        cssStyle =
            "    #printLogo{\n" +
            "        width:1.1em;\n" +
            "        height:1.1em;\n" +
            "    }\n";
    } else if (pageConfigure.currentPage == 6) {
        document.body.appendChild(div);
        object = document.getElementsByClassName("dropdown")[5];
        if (object) {
            pos = object.getBoundingClientRect();
            btnLeft = pos.left;
            btnTop = pos.top + pos.height * 1;
        } else {
            object = document.getElementsByClassName("dropdown")[1];
            //当前浏览器不支持该方法
            var actualLeft = getElementLeft(object);
            var actualTop = getElementTop(object);
            btnLeft = actualLeft - scrollLeft;
            btnTop = actualTop - scrollTop + object.offsetWidth * 1.25;
        }

        cssStyle =
            ".pagePrint{\n" +
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
            "    }\n" + tooltipify;
    }
    let cssNode = document.createElement("style");
    cssNode.id = "THT_Style";
    cssNode.setAttribute("type", "text/css");
    cssNode.innerHTML = cssStyle;
    document.body.appendChild(cssNode);

    if (pageConfigure.currentPage == 4 || pageConfigure.currentPage == 6) {
        $(".pagePrint [title]").tooltipify({position: 'bottom'});
    }

    if (pageConfigure.currentPage != 3) {
        $(".printButton").click(function () {
            if (pageConfigure.currentPage == 0) {
                if (page2pdfClick == false) {//第一次点击时所有讨论都加上文章转PDF的文字
                    if (buttonCLickCount > 0) {
                        removeStyle();
                    }
                    page2pdfClick = true;
                    if (pageConfigure.pageHref.indexOf("/p") != -1) {
                        //先隐藏部分元素，然后打印。在打印完毕后再展示
                        Promise.all([updateStyle()]).then(transformPDF);
                    } else if (pageConfigure.pageHref.indexOf("/question") != -1) {
                        addPrintText();
                        $(".printButton").text('取消转换');
                    }
                } else {
                    var cssStyle =
                        "    .pageButtons{\n" +
                        "        display:none;\n" +
                        "    }";
                    addStyle(cssStyle);
                    page2pdfClick = false;
                    if (pageConfigure.pageHref.indexOf("/question") != -1) {
                        $(".printButton").text('文章转PDF');
                    }
                    buttonCLickCount++;
                }
            } else if (pageConfigure.currentPage == 1 || pageConfigure.currentPage == 4 || pageConfigure.currentPage == 5 || pageConfigure.currentPage == 6) {
                Promise.all([updateStyle()]).then(transformPDF);
            } else if (pageConfigure.currentPage == 2) {
                createParentEle(".ouvJEz", 0);
                Promise.all([updateStyle()]).then(transformPDF);
            }
        });
    } else {
        $("#printButton").click(function () {
            Promise.all([updateStyle()]).then(transformPDF);
        });
    }

    function updateStyle() {//修改样式
        if (pageConfigure.currentPage == 0) {
            var parentDiv = $(".is-bottom")[0].parentElement;
            parentDiv.className = "articleComment";
            addStyle(".Post-Author,.Reward,.Post-topicsAndReviewer,.articleComment,.ContentItem-actions,.LabelContainer-wrapper{display:none !important;}");
        } else if (pageConfigure.currentPage == 1) {
            addStyle(".article-info-box,#csdn-shop-window-top{display:none !important;}");
        } else if (pageConfigure.currentPage == 2) {
            addStyle(".rEsl9f,._1kCBjS,._19DgIp,._13lIbp,.d0hShY{display:none !important;}");
        } else if (pageConfigure.currentPage == 3) {
            addStyle(".postDesc,#blog_post_info_block,#comment_form{display:none !important;}");
        } else if (pageConfigure.currentPage == 4) {
            var partentDiv01 = $(".footer-author-block")[0].parentElement;
            partentDiv01.id = "jj-author"
            addStyle(".main-header-box,.tag-list-box,.article-banner,#jj-author,#comment-box,.recommended-area,.author-info-block,.column-container{display:none !important;}");
        } else if (pageConfigure.currentPage == 5) {
            addStyle(".article-box__meta,.article-box__group,.tags-box,.copyright-box,.action-box,.recommend-box{display:none !important;}");
        } else if (pageConfigure.currentPage == 6) {
            addStyle(".justify-content-between,.functional-area-bottom,.text-secondary,.flex-sm-row{display:none !important;}");
        }
    }

    // 文章转pdf
    function transformPDF() {
        if (pageConfigure.currentPage == 0) {
            $(".Post-Main").print({
                debug: false,
                importCSS: true,
                printContainer: true,
                operaSupport: true
            });
        } else if (pageConfigure.currentPage == 1) {
            $(".blog-content-box").print({
                debug: false,
                importCSS: true,
                printContainer: true,
                operaSupport: true
            });
        } else if (pageConfigure.currentPage == 2) {
            $("#jsPrint").print({
                debug: false,
                importCSS: true,
                printContainer: true,
                operaSupport: true
            });
        } else if (pageConfigure.currentPage == 3) {
            $("#post_detail").print({
                debug: false,
                importCSS: true,
                printContainer: true,
                operaSupport: true
            });
        } else if (pageConfigure.currentPage == 4) {
            $(".column-view").print({
                debug: false,
                importCSS: true,
                printContainer: true,
                operaSupport: true
            });
        } else if (pageConfigure.currentPage == 5) {
            $(".article-box").print({
                debug: false,
                importCSS: true,
                printContainer: true,
                operaSupport: true
            });
        } else if (pageConfigure.currentPage == 6) {
            $(".card-body").print({
                debug: false,
                importCSS: true,
                printContainer: true,
                operaSupport: true
            });
        }
        if (hasAddStyle == true) {
            removeStyle();
        }
        safeWaitFunction();
    }

    // 新增样式
    function addStyle(style) {
        var newStyle = document.getElementById("THT_Style");
        newStyle.appendChild(document.createTextNode(style));
        hasAddStyle = true;
    }

    // 恢复样式
    function removeStyle() {
        var newStyle = document.getElementById("THT_Style");
        newStyle.removeChild(newStyle.lastChild);
        hasAddStyle = false;
    }

    //为现有节点添加新的父元素，便于操作当前节点
    function createParentEle(currentNode, newParentIndex) {
        var printDiv = $(currentNode)[newParentIndex];
        var parentNew = document.createElement("div");
        var parentID = "";
        if (pageConfigure.currentPage == 0) {
            parentID = 'newParentIndex' + newParentIndex;
        } else if (pageConfigure.currentPage == 2) {
            parentID = 'jsPrint';
        }
        parentNew.id = parentID;
        printDiv.parentNode.replaceChild(parentNew, printDiv);
        parentNew.appendChild(printDiv);
    }

    //需要使用offsetLeft，offsetTop方法。需要明确的是这两个方法都是当前元素相对于其父元素的位置，所以要得到相对于页面的距离需要循环计算。
    function getElementLeft(ele) {
        var actualLeft = ele.offsetLeft;
        var current = ele.offsetParent;
        // 如果当前元素不是根元素
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    }

    function getElementTop(ele) {
        var actualTop = ele.offsetTop;
        var current = ele.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    function eventListener() {//归纳所有的事件监听到一个函数
        if (pageConfigure.currentPage == 0) {
            document.addEventListener('DOMNodeInserted', function () {//添加监听事件，检测是否发生懒加载
                var listItemLength = document.getElementsByClassName('List-item').length;
                if (opeArray.length == 0 || opeArray.includes(listItemLength) == false) {
                    opeArray.push(listItemLength);
                    if (page2pdfClick == true) {
                        addPrintText();
                    }
                }
            });
        }
    }

    function addPrintText() {
        //给每个讨论都加上打印的按钮，然后再打印
        let parentDiv = document.querySelectorAll('.AnswerItem-authorInfo');
        // let parentDiv = document.querySelectorAll('.AuthorInfo');//不能用这个来查，因为一个讨论里class为Authorinfo的不止一个
        let temp = listItemNumber;
        for (let newIndex = temp; newIndex < parentDiv.length; newIndex++) {
            let div1 = document.createElement("div");
            let divId = "printButton" + newIndex;
            div1.innerHTML = '<p id="' + divId + '" style="color:#4e6ef2;font-size: 14px;cursor:pointer;">\n' +
                '        文章转PDF\n' +
                '    </p>';
            div1.className = "pageButtons";
            parentDiv[newIndex].appendChild(div1);
            let className1 = "printButton" + newIndex;
            let newParentId = "newParentIndex" + newIndex;
            createParentEle(".ModalWrap", newIndex);
            var cssStyle2 = "\n" + "#" + newParentId + "{display:none;}" + "\n";
            addStyle(cssStyle2);
            $(document).on("click", "#" + className1, function () {//获取讨论编号data-za-index,然后打印讨论编号data-za-index对应的讨论
                let buttonIndex = document.getElementById(className1).parentElement.parentElement.parentElement.parentElement.getAttribute('data-za-index');
                transformPDF1(buttonIndex);
            });
        }
        listItemNumber = parentDiv.length;
    }

    // 文章转pdf--讨论--知乎专用
    function transformPDF1(buttonIndex) {
        var printDiv = $(".AnswerItem")[buttonIndex];
        var parentNew = document.createElement("div");
        var parentID = 'printDiv' + buttonIndex;
        parentNew.id = parentID;
        printDiv.parentNode.replaceChild(parentNew, printDiv);
        parentNew.appendChild(printDiv);
        $("#" + parentID).print({
            debug: false,
            importCSS: true,
            printContainer: true,
            operaSupport: true
        });
    }

    //修改博客园导航栏的宽度
    function updateNavWidthT() {
        if (pageConfigure.currentPage == 3) {
            let a = document.getElementById("pagePrint");
            let width = getComputedStyle(a).width.replace("px", "");
            let fontSize = getComputedStyle(a).fontSize.replace("px", "");
            if (fontSize >= 14 && fontSize * 6 > width) {
                let newCss = "\n#pagePrint{width:" + fontSize * 7.5 + "px !important;}\n"
                addStyle(newCss);
            }
        }
    }

    //写一个周期函数，检测文章转pdf的按钮有没有加上
    function safeWaitFunction() {
        setInterval(function () {
            var a = document.getElementsByClassName("printButton");
            if (a.length == 0) {
                if (pageConfigure.currentPage == 1 || pageConfigure.currentPage == 2 || pageConfigure.currentPage == 3 || pageConfigure.currentPage == 5) {
                    parentDiv.appendChild(div);
                } else if (pageConfigure.currentPage == 4 || pageConfigure.currentPage == 6) {
                    document.body.appendChild(div);
                } else if (pageConfigure.currentPage == 0) {
                    parentDiv.insertBefore(div, firstChild);
                }
                clearInterval();
            }
        }, 500);
    }

    eventListener();
    updateNavWidthT();
    safeWaitFunction();
})
();