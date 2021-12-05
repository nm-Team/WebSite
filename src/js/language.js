/* 为什么要把多语言单独做js？
 * 
 * 要执行下面的代码，很显然需要先加载JQuery和翻译js。
 * 但这两个js加载需要时间，这期间页面的header出不来。
 * header的加载优先级得高些，而且header也可能需要翻译。
 * 所以只好先加载header.js，再做翻译。
 * 但按照之前的逻辑，header.js是唯一可用加载完成后执行的js。
 * 只能再来一个js维持一下这样子。
 * 不知道效果怎么样额，不行再用Ctrl+Shift+H全局替换。
 * agou 2021.06.20  */

var language; // 全局语言

languageList = { "zh_CN": "中文（简体）", "zh_TW": "中文（繁体）", "en_US": "English", "ja_JP": "日本語", "hu_MA": "焱暒妏", };

// 更改语言函数
function changeLanguage(lang) {
    if (lang == "auto") { // 设置为自动
        document.cookie = "pageLanguage=" + "auto" + "; max-age=999999999999999; path=/; ";
        return changeLanguage(undefined);
    }
    else if (lang == undefined) { // 视为页面载入时执行的，而不是更改语言。此种情况作判定
        if (!getCookie('pageLanguage') || getCookie('pageLanguage') == "auto") { // 没有设置Cookie或者Cookie为auto，可以按照浏览器判断
            lang = navigator.language || navigator.userLanguage;
            lang = lang.replace('-', '_');
        }
        else {
            // 设置了 Cookie，按Cookie来
            lang = getCookie('pageLanguage');
        }
    }
    else {
        document.cookie = "pageLanguage=" + lang + "; max-age=999999999999999; path=/; ";
    }
    language = lang;
    i18n.init(
        {
            lng: language,
            // 所有翻译在 /src/locales/ 目录下
            // 注：该目录下的 dev.json 请勿删除
            fallbackLng: 'en_US',
            // 缺省语言
            resGetPath: '/src/locales/__lng__.json'
        },
        function (t) {
            $('html').i18n();
        }
    );
}
changeLanguage();



function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}