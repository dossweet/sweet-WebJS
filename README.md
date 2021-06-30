### 声明
本脚本仅供学习交流！！！不允许以任何目的将源码进行商业用途，否则追究法律责任！！！
### 注意事项：
1. 第一次使用时记得在弹出窗口设置为另存为PDF，如果不想要页眉页脚，也请手动勾选
2. 本脚本仅在Chrome、firefox、Edge三大浏览器进行了兼容测试，如果您使用的浏览器无法使用，请考虑更换浏览器或者联系我进行脚本定制
3. 如果在上述三大平台内无法使用，请尝试多次刷新页面。如仍不可用，建议更换/重启/重装浏览器。如仍不可用，联系本人远程解决。
4. 打印文章前，请确保文章内的所有图片都已加载完成。建议把滚动条拖至底部(浏览一遍文章)。否则转出的PDF内图片可能显示不出来。出现这个问题的主要原因是现在的网站为了节流对图片均以懒加载的形式进行加载，导致调起打印时图片未加载完成。
5. 如果觉得脚本不错，请给我一个免费的Star！
6. [脚本的安装](#scriptuse)
### 脚本功能：
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;提供知乎、CSDN、简书、博客园、开源中国、掘金、思否等主流博客网站的文章部分另存为PDF的功能，便于本地对文章进行编辑/做笔记。兼容chrome,firefox,edge浏览器，其余未测试。
### 思路来源：
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;不知有没有小伙伴和我一样在网上的主流博客网站浏览技术文章时，看到能解决自己问题并且是一篇有很价值的博客时，就想如果能对文章进行编辑就好了，这样以后再看到这篇文章时，就知道自己看到了哪一个地方，有什么感悟，从而大幅度提高阅读效率。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;直接在网页上对博客进行编辑并保存是不现实的。但我们可以将文章转存为PDF下载到本地进行阅读，这样就可以直接编辑并保存笔记啦~
### 使用说明：
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;本脚本目前覆盖了描述中的7大主流技术博客网站。每个网站的博客页面都加了一个文章转PDF的按钮。为了美观以及网页整体效果的呈现，每个网站所加按钮的位置和样式都不相同，但都很显眼，并且用户只需点击按钮即可实现博客内容转PDF的功能。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;下面分别介绍文章转PDF的按钮在各大网站博文网页的具体位置：     
#### 1. 知乎        
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;知乎的博文有两种形式，第一种是文章详情页；第二种是话题讨论的回答。对于这两种博文，均实现了文章转PDF的功能：  
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.1 文章详情页  
   文章转PDF按钮的位置如下图所示：
   ![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF01.png)  
   点击按钮即可调出转PDF，<B>第一次使用时记得在弹出窗口设置为另存为PDF，如果不想要页眉页脚，也请手动勾选</B>。  
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.2 讨论回答  
   讨论回答页面的文章转DPF按钮的位置如下图所示：  
   ![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF02.png) 
   先点击文章转PDF的蓝色按钮，所有的讨论就都会加上文章转PDF的标签，点击标签即可调起具体文章的转换功能。  
#### 2. CSDN    
文章转PDF按钮的位置如下图所示：
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF03.png)  
#### 3. 博客园    
博客园的网页排版有多种方式，针对每一种，本人都加了不影响美观的文章转PDF按钮。下面放几个示意图，如果用户打开的网页不是下面几种方式，可以据此类推：
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF04.png)
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF05.png)
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF06.png)
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF07.png)
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF08.png)
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF09.png)  
#### 4. 掘金    
文章转PDF按钮的位置如下图所示：
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF10.png)  
#### 5. 开源中国    
文章转PDF按钮的位置如下图所示：
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF11.png)  
#### 6. 思否  
文章转PDF按钮的位置如下图所示：
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF12.png)  
#### 7. 简书  
文章转PDF按钮的位置如下图所示：
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/2PDF13.png)   

<span id="scriptuse">脚本安装</span>
**1. 安装脚本管理器 Tampermonkey 或暴力猴**

|  浏览器 |  安装地址 |
| ------------ | ------------ |
|  360极速浏览器 |  https://ext.chrome.360.cn/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo |
|  QQ浏览器 |  qqbrowser://extensions/search?key=Tampermonkey |
|  UC浏览器 |  离线安装包 [Tampermonkey.crx](https://open-1252026789.cos.ap-beijing.myqcloud.com/Tampermonkey.crx?q-sign-algorithm=sha1&q-ak=AKID5vs71lFeyZfPygxk2FKr00awLkM2CtH9&q-sign-time=1552783829;1552785629&q-key-time=1552783829;1552785629&q-header-list=&q-url-param-list=&q-signature=f6af0eeaa1aec2eeb91ec733010f3a55f945876d&x-cos-security-token=4ea51c804f012501a972cdb19e18a2f6560452af10001) |
|  遨游浏览器 |  http://extension.maxthon.cn/detail/index.php?view_id=1680&category_id=10 |
|  Chrome浏览器 |  https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo |
|  火狐浏览器 |  https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/ |
|  Microsoft Edge |  https://www.microsoft.com/store/p/tampermonkey/9nblggh5162s |
|  其他浏览器 |  同UC |

安装成功后浏览器扩展栏将出现

![](https://i.loli.net/2019/05/15/5cdbe9c3e025f86043.jpg)

**2. 安装 网页文章转PDF(网页局部区域打印)-适用于知乎/CSDN/简书/博客园/开源中国/掘金/思否**

点击安装此脚本 [安装地址](https://greasyfork.org/zh-CN/scripts/421429) 
### 关于捐赠
本脚本不收取任何使用费用 , 如果您觉得本脚本对您有帮助，您可以通过支付宝或微信，扫描二维码，捐赠 X元，^_^，谢谢！
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/zfb.jpg)
![](https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/weixin.jpg)


   
   
