var language; // 全局语言

languageList = { "zh_CN": "中文（简体）", "zh_HK": "中文（繁体）", "en_US": "English", "ja_JP": "日本語", "hu_MA": "焱暒妏", };

// 更改语言函数
function changeLanguage(lang) {
    if (lang == "auto") { // 设置为自动
        document.cookie = "pageLanguage=" + "auto" + "; max-age=999999999999999; path=/; ";
        return changeLanguage(undefined);
    }
    else if (lang == undefined) { // 视为页面载入时执行的，而不是更改语言。此种情况作判定
        if (!getCookie('pageLanguage') || getCookie('pageLanguage') == "auto") { // 没有设置Cookie或者Cookie为auto，可以按照浏览器判断
            lang = navigator.language || navigator.userLanguage;
            // bugfix: 对于某些设置语言不包含地区的用户配置列表中第一个支持的语言
            if (lang.indexOf("-" == -1)) {
                for (lanSearch in languageList) {
                    if (lanSearch.split("_")[0] == lang) { lang = lanSearch; break; }
                }
            }
            lang = lang.replace('-', '_');
        }
        else {
            // 设置了 Cookie，按Cookie来
            lang = getCookie('pageLanguage');
        }
        if (!languageList[lang]) lang = "en_US";
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
    $("#footer_selectLanguageButton span")[0].innerHTML = (languageList[language]);
}
changeLanguage();

if (getUrlParam("lan")) {
    changeLanguage(getUrlParam("lan"));
    changeURLParam("lan", "");
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

function changeURLParam(name, value) {
    var url = document.URL, resultUrl = ''
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg);
    var replaceText = name + '=' + value;
    if (r != null) {
        var tmp = url.replace(unescape(name + '=' + r[2]), replaceText);
        resultUrl = (tmp);
    } else {
        if (url.match('[\?]')) {
            resultUrl = url + '&' + replaceText;
        }
        else {
            resultUrl = url + '?' + replaceText;
        }
    }
    history.replaceState(null, null, resultUrl)
}