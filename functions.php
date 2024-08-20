<?php

define("start_time", getmicrotime());

define("languageList", array("zh_CN" => "中文（简体）", "zh_HK" => "中文（繁体）", "en_US" => "English", "ja_JP" => "日本語", "hu_MA" => "焱暒妏"));

// 检查语言cookie
if ($_GET['lan'] != '' && $_COOKIE['lang'] != 'auto') {
    $lang = $_GET['lan'];
} else if (!isset($_COOKIE['lang']) || $_COOKIE['lang'] == 'auto') {
    preg_match('/^([a-z\-]+)/i', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $matches);
    $lang = str_replace("-", "_", $matches[1], $lanUnderlineCount);
} else {
    $lang = $_COOKIE['lang'];
}
if (languageList[$lang] == null) {
    foreach (languageList as $key => $value) {
        if (str_split($lang, 2)[0] == str_split($key, 2)[0]) {
            $lang = $key;
            break;
        };
    }
}
if (!array_key_exists($lang, languageList)) {
    $lang = 'en_US';
}
setcookie('lang', ($_COOKIE['lang'] == "auto" ? "auto" : $lang), time() + 999999999, '/');

i18nInit($lang);
define("lang", $lang);
echo "<!-- (c) nmTeam -->\n";
echo "<!-- Page generated " . date("Y-m-d H:i:s") . " -->\n";
echo "<!-- Body language: " . lang . " -->\n";

function setHeader()
{
    $title = (empty(t(page_title)) ? "" : t(page_title) . " - ") . "nmTeam - " . t("pagebases.official_website");
    $keywords = "nmTeam,nm,纳米团队,柠檬团队,纳米人,nmer," . t(page_keywords);
    $description = t(page_description) . "  " . t("pagebases.site_intro");
    $image = !empty(page_image) ? @page_image : "https://websiteres.nmteam.xyz/producticon/nmTeam/logo@128.png";
?>
    <!doctype html>
    <html lang="<?php echo str_replace("_", "-", lang); ?>" <?php if (defined('const_theme')) echo ' data-theme="' . const_theme . '" data-theme-is-const="true"'; ?>>

    <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-dns-prefetch-control" content="on">
        <link rel="dns-prefetch" href="https://api.nmteam.xyz" crossorigin>
        <title><?php echo $title; ?></title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0'>
        <meta name='apple-mobile-web-app-capable' content='yes'>
        <meta name='apple-mobile-web-app-status-bar-style' content='black'>
        <meta name='format-detection' content='telephone=no'>
        <meta name="keywords" content="<?php echo $keywords; ?>">
        <meta name="description" content="<?php echo $description; ?>">
        <meta http-equiv='content-language' content='<?php echo str_replace("_", "-", lang); ?>'>

        <meta property="og:site_name" content="nmTeam">
        <meta property="og:type" content="website">
        <meta property="og:image" content="<?php echo $image; ?>">
        <meta property="og:description" content="<?php echo $description; ?>">
        <meta property="og:title" content="<?php echo $title; ?>">
        <meta property="og:url" content="<?php echo GetCurUrl(); ?>">

        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="<?php echo $title; ?>">
        <meta name="twitter:description" content="<?php echo $description; ?>">
        <meta name="twitter:image" content="<?php echo $image; ?>">

        <link rel="stylesheet" type="text/css" href="/src/css/common.css">
        <link rel="stylesheet" type="text/css" href="/src/css/header.css">
        <?php
        foreach (page_head_css as $key => $value) {
            echo "<link rel='stylesheet' type='text/css' href='" . $value . "'>";
        }
        ?>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8202YMVF5B"></script>
        <script>
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', 'G-8202YMVF5B');
        </script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5779459433500433" crossorigin="anonymous"></script>
        <?php
        foreach (page_head_js as $key => $value) {
            echo "<script src='" . $value . "'></script>";
        }
        ?>
        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@graph": [{
                    "@type": "Organization",
                    "@id": "https://nmteam.xyz",
                    "name": "nmTeam",
                    "url": "https://nmteam.xyz/",
                    "sameAs": [],
                    "logo": {
                        "@type": "ImageObject",
                        "@id": "https://nmteam.xyz/#logo",
                        "inLanguage": "<?php echo str_replace("_", "-", lang); ?>",
                        "url": "<?php echo $image; ?>",
                        "width": 128,
                        "height": 128,
                        "caption": "nmTeam"
                    },
                    "image": {
                        "@id": "https://nmteam.xyz/#logo"
                    }
                }, {
                    "@type": "WebSite",
                    "@id": "https://nmteam.xyz/#website",
                    "url": "https://nmteam.xyz/",
                    "name": "nmTeam <?php p("pagebases.official_website"); ?>",
                    "description": "<?php echo $description; ?>",
                    "publisher": {
                        "@id": "https://nmteam.xyz/about"
                    },
                    "inLanguage": "<?php echo str_replace("_", "-", lang); ?>"
                }, {
                    "@type": "ImageObject",
                    "@id": "<?php echo $image; ?>",
                    "inLanguage": "<?php echo str_replace("_", "-", lang); ?>",
                    "url": "<?php echo $image; ?>",
                    "caption": "<?php echo $description; ?>"
                }, {
                    "@type": "WebPage",
                    "@id": "https://nmteam.xyz",
                    "url": "https://nmteam.xyz",
                    "name": "nmTeam",
                    "datePublished": "2022-02-31T11:45:14.000Z",
                    "dateModified": "2022-02-31T11:45:14.000Z",
                    "description": "<?php echo $description; ?> - nmTeam",
                    "inLanguage": "<?php echo str_replace("_", "-", lang); ?>",
                    "author": "nmTeam"
                }]
            }
        </script>
        <script>
            language = "<?php echo lang; ?>";
        </script>
        <script>
            // set theme color
            function setTheme(theme) {
                // if theme is const return
                if (document.documentElement.getAttribute("data-theme-is-const") == "true") {
                    return;
                }
                // set theme
                document.documentElement.setAttribute("data-theme", theme);
            }
            // get browser settings
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
            } else {
                setTheme('light');
            }

            // listen to system theme change
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (e.matches) {
                    setTheme('dark');
                } else {
                    setTheme('light');
                }
            });
        </script>
    </head>

    <body>
        <div id="hcont">
            <div class="placeHolder"></div>
            <div class="header hidden" id="pageHeader">
                <button class="left" onclick="headerClick();" aria-label="<?php p("header.title_button_aria_label"); ?>">
                    <i class="logo" aria-label="<?php p("header.title_icon_aria_label"); ?>"></i>
                    <p class="name">nmTeam</p>
                </button>
                <div class="right" onclick='if(window.innerWidth < 800) headerClick();'>
                    <div class="links">
                        <a href="/" aria-label="<?php p("header.home"); ?>"><?php p("header.home"); ?></a>
                        <a href="/products/" aria-label="<?php p("header.products"); ?>"><?php p("header.products"); ?></a>
                        <a href="https://support.nmteam.xyz" aria-label="<?php p("header.support"); ?>"><?php p("header.support"); ?></a>
                        <a href="https://newsroom.nmteam.xyz" target="_blank" aria-label="<?php p("header.newsroom"); ?>"><?php p("header.newsroom"); ?></a>
                        <a href="/aboutus" aria-label="<?php p("header.about"); ?>"><?php p("header.about"); ?></a>
                    </div>
                    <button class="accountBox" id="accountBox" tabindex="0" aria-label="<?php p("header.account_box_aria_label"); ?>">
                        <i id="avatarBox" aria-label="<?php p("header.avatar_aria_label"); ?>"></i>
                        <p id="userName"><?php p("account_v2.manage"); ?></p>
                    </button>
                </div>
            </div>
        </div>
    <?php
}

function setFooter()
{
    if (!empty(page_update)) {
        echo '<div class="updateDate">' . str_replace("{year}", substr(page_update, 0, 4), str_replace("{month}", substr(page_update, 4, 2), str_replace("{day}", substr(page_update, 6, 2), t("page_update")))) . '</div>';
    }
    ?><div id="fcont">
            <div class="footer-body">
                <div class="footer-table">
                    <div class="row">
                        <div class="rowName"><?php p("footer.table.products.title"); ?></div>
                        <a href="/products/"><?php p("footer.table.products.library"); ?></a>
                        <a href="/products/overview/nmBot-Telegram">nmBot</a>
                        <a href="/products/overview/nmBrowser-StartPage"><?php p("footer.table.products.nmBrowserStartPage"); ?></a>
                    </div>
                    <div class="row">
                        <div class="rowName"><?php p("footer.table.service.title"); ?></div>
                        <a href="https://accounts.nmteam.xyz" target="blank"><?php p("footer.table.service.accountCenter"); ?></a>
                        <a href="/status" target="blank"><?php p("footer.table.service.systemStatus"); ?></a>
                        <a href="/support"><?php p("footer.table.service.support"); ?></a>
                    </div>
                    <div class="row">
                        <div class="rowName"><?php p("footer.table.about.title"); ?></div>
                        <a href="/aboutus"><?php p("footer.table.about.aboutUs"); ?></a>
                        <a href="/products/overview/product-accessibility"><?php p("footer.table.about.accessibility"); ?></a>
                        <a href="https://newsroom.nmteam.xyz" target="blank"><?php p("footer.table.about.newsroom"); ?></a>
                        <a href="/join/"><?php p("footer.table.about.joinUs"); ?></a>
                        <a href="/supportus"><?php p("footer.table.about.supportUs"); ?></a>
                    </div>
                    <div class="row">
                        <button id="footer_selectLanguageButton" onclick="window.location.href = window.location.origin + '/language.php?bks=' + escape(window.location.href);" aria-label="<?php echo languageList[lang]; ?><?php p('footer.language_selector_button_aria_label'); ?>"><i><svg t="1638693385062" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M511.777943 68.191078c-245.204631 0-443.586864 198.60429-443.586864 443.808922s198.382233 443.808922 443.586864 443.808922 444.030979-198.60429 444.030979-443.808922S756.982574 68.191078 511.777943 68.191078zM819.11568 334.476841 688.191838 334.476841c-14.423501-55.476499-34.617425-108.733447-61.245899-157.995407C708.606797 204.440206 776.509303 261.025968 819.11568 334.476841zM512 158.506037c37.058011 53.256948 65.906036 112.505353 84.767616 175.96978L427.232384 334.475817C446.093964 271.01139 474.941989 211.762985 512 158.506037zM168.491459 600.76158c-7.322779-28.40391-11.538801-58.139142-11.538801-88.76158s4.216022-60.35767 11.538801-88.76158l149.785421 0c-3.550873 29.069059-5.991458 58.582233-5.991458 88.76158s2.440585 59.69252 6.213515 88.76158L168.491459 600.76158zM204.662263 689.523159l130.923842 0c14.423501 55.476499 34.617425 108.733447 61.245899 158.217465C315.171146 819.780829 247.267617 762.974032 204.662263 689.523159zM335.586105 334.476841 204.662263 334.476841c42.605354-73.449849 110.508883-130.257669 192.168718-158.217465C370.202507 225.743394 350.009605 279.000342 335.586105 334.476841zM512 865.493963c-36.835953-53.256948-65.683978-112.505353-84.767616-175.96978l169.535231 0C577.682955 752.987586 548.835953 812.235992 512 865.493963zM615.851253 600.76158 408.148747 600.76158c-4.216022-29.069059-7.100722-58.582233-7.100722-88.76158s2.8847-59.69252 7.100722-88.76158l207.702506 0c4.216022 29.069059 7.100722 58.582233 7.100722 88.76158S620.067274 571.69252 615.851253 600.76158zM627.167996 847.51959c26.628474-49.485041 46.821375-102.519931 61.245899-157.995407l130.923842 0C776.510326 762.974032 708.606797 819.558771 627.167996 847.51959zM705.500039 600.76158c3.550873-29.069059 6.213515-58.582233 6.213515-88.76158s-2.440585-59.69252-6.213515-88.76158l149.785421 0c7.322779 28.40391 11.760858 58.139142 11.760858 88.76158s-4.216022 60.35767-11.760858 88.76158L705.500039 600.76158z">
                                    </path>
                                </svg></i><span id="footer_language"><?php echo languageList[lang]; ?></span></button>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="left">
                        <p><?php p("footer.cr"); ?><br /></p>
                        <p><a class="footer-a" href="/legal/network-service-protocol" target="_blank"><?php p("footer.svca"); ?></a>
                            | <a class="footer-a" href="/legal/privacy-policy" target="_blank"><?php p("footer.svcb"); ?></a>
                            | <a class="footer-a" href="/sitemap" target="_blank"><?php p("footer.sitemap"); ?></a></p>
                        <p><span><?php p("footer.email"); ?></span><a class="footer-a" href="mailto:support@nmteam.xyz" target="_blank">support@nmteam.xyz</a>
                        </p>
                        <style>
                            .freshping_badge {
                                display: inline-block;
                                width: 136px;
                                height: 41px;
                                background-image: url(https://statuspage.freshping.io/badge/1a22cbf2-da50-4d6e-a364-71e6b74a3717?0.24063971371569437);
                                background-size: 136px;
                                background-repeat: no-repeat;
                                margin: 6px 0px 0 0 !important;
                            }
                        </style>
                        <p><a href="/status" target="_blank" title="Freshping Badge. <?php p("status_page.description"); ?>" style="display: inline-block;"><object style="display: inline-block;">
                                    <div class="freshping_badge"></div>
                                </object></a></p>
                    </div>
                    <div class="right">
                        <i onclick="window.location.href='/'" style="background-image: url('https://websiteres.nmteam.xyz/producticon/nmTeam/logo@64.png'); filter: brightness(0); width: 60px; height: 60px; opacity: 0.16;"></i>
                    </div>
                </div>
            </div>
            <div class="pageDialogs">
                <div class="pageConfirmDialog" id="pageCookieConfirmDialog">
                    <div class="pageConfirmDialogHeader"><?php p("cookie.cookieConfirmDialog.header"); ?></div>
                    <div class="pageConfirmDialogBody">
                        <p><?php p("cookie.cookieConfirmDialog.body.0"); ?></p>
                        <p><?php p("cookie.cookieConfirmDialog.body.1"); ?></p>
                    </div>
                    <div class="pageConfirmDialogFooter">
                        <!-- <button><?php p("cookie.cookieConfirmDialog.button.customize"); ?></button> -->
                        <button onclick="localStorage.cookieTipv0Checked = 'true'; pageCookieConfirmDialog.setAttribute('data-status', 'close');"><?php p("cookie.cookieConfirmDialog.button.accept"); ?></button>
                    </div>
                </div>
            </div>
        </div>

        <script src="/src/js/header.js"></script>
        <script src="/src/js/jquery.min.js"></script>
        <?php
        foreach (page_body_js as $key => $value) {
            echo "<script src='" . $value . "'></script>";
        }
        if (!empty($_GET['lan'])) {
            echo "<script>changeURLParam('lan', '');</script>";
        }
        ?>
    </body>

    </html>
<?php
    $runtime = getmicrotime() - start_time;
    echo "<!-- Page load end " . $runtime . " -->";
}

function p($id)
{
    echo t($id);
}

function t($id)
{
    $search_para = explode(".", $id);
    foreach (lang_search_list as $key => $value) {
        $searched_text = lang_json[$value];
        foreach ($search_para as $key2 => $value2) {
            $searched_text = $searched_text[$value2];
        }
        if ($searched_text != null) {
            return $searched_text;
        }
    }
    return $id;
}

function i18nInit($lang)
{
    define("lang_search_list", array($lang, "en_US", "zh_CN"));
    $lang_json_cache = array();
    foreach (lang_search_list as $lang_search) {
        $lang_file = $_SERVER['DOCUMENT_ROOT'] . "/src/locales/" . $lang_search . ".json";
        if (file_exists($lang_file)) {
            $lang_json = file_get_contents($lang_file);
            $lang_json = json_decode($lang_json, true);
            if (!empty($lang_json)) {
                $lang_json_cache[$lang_search] = $lang_json;
            }
        }
    }
    define("lang_json", $lang_json_cache);
}

function getmicrotime()
{
    list($a, $b) = explode(' ', microtime());
    return $a + $b;
}

// php 获取当前访问的完整url
function GetCurUrl()
{
    $url = 'http://';
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
        $url = 'https://';
    }

    // 判断端口
    if ($_SERVER['SERVER_PORT'] != '80' && $_SERVER['SERVER_PORT'] != '443') {
        $url .= $_SERVER['SERVER_NAME'] . ':' . $_SERVER['SERVER_PORT'] . '' . $_SERVER['REQUEST_URI'];
    } else {
        $url .= $_SERVER['SERVER_NAME'] . '' . $_SERVER['REQUEST_URI'];
    }

    return $url;
}
