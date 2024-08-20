<!-- nmBot Telegram Description Page v2 -->

<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", t("products.nmbot_telegram.title"));
define("page_keywords", "nmBot,Telegram,Telegram Bot,Telegram机器人,Telegram机器人开发,Telegram机器人开发教程,Telegram机器人教程,Telegram机器人API,Telegram机器人教程中文,Telegram机器人API中文");
define("page_description", "products.nmbot_telegram.description");
define("page_head_css", array("/src/css/products.css", "/src/css/products_detail.css"));
define("page_head_js", array());
define("page_body_js", array());
define("page_image", "");
define("page_update", "");
define("const_theme", "dark");
setHeader();

define("file_url", "https://websiteres.nmteam.xyz/pintroimg/nmBot-Telegram/v2/");
define("background_style", "background-size: cover; background-position: center; background-repeat: no-repeat;");

$footer_notes = [];

function pb($key)
{
    $text = t($key);

    // get all [footer:xxx] content, replace with link to footer
    $matches = [];
    preg_match_all('/\[footer:(.*?)\]/', $text, $matches);
    global $footer_notes;
    foreach ($matches[1] as $match) {
        $footer_notes[] = $match;
        $footer_note_count = count($footer_notes);
        $text = str_replace("[footer:$match]", "<sup><a href='#footer-note-$footer_note_count' id='footer-note-sup-$footer_note_count' class='footer-note-sup'>$footer_note_count</a></sup>", $text);
    }

    // spilt by ，。、：；add <bs>$1</bs> if currently no <bs> tag
    $text = preg_replace('/([^<bs>])([，。、：；])/u', '$1<bs>$2</bs>', $text);

    // spilt by |, if length > 1, add <nobr> to each
    $warp_points = explode("|", $text);

    if (count($warp_points) > 1) {
        $text = "";
        foreach ($warp_points as $point) {
            $text .= "<nobr>" . $point . "</nobr>";
        }
    }

    echo $text;
}
?>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ayahub/webfont-harmony-sans-sc@1.0.0/css/index.min.css" media="print" onload="this.media='all'" />

<style>
    :root {
        font-size: min(0.25vw, 0.25vh, 1px);
    }

    .nmbot-telegram {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -80rem;
        background-color: #1a1a1a;
        color: #ffffff;
        text-align: center;
        font-weight: 300;
    }

    .nmbot-telegram * {
        font-family: "HarmonyOS Sans SC", "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .nmbot-telegram .header {
        position: relative;
        width: 100%;
        height: 100vh;
        background-color: #000000;
    }

    .nmbot-telegram .header .background-image {
        width: 100%;
        height: 100vh;
        background-image: url("<?php echo file_url; ?>website intro header background.png");
        background-size: 175vh !important;
        <?php echo background_style; ?>
    }

    .nmbot-telegram .header .icon {
        position: absolute;
        top: 42%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(60vw, 30vh, 200rem);
        height: min(60vw, 30vh, 200rem);
        background-image: url("<?php echo file_url; ?>website intro header icon.png");
        <?php echo background_style; ?>
    }

    .nmbot-telegram .header .name {
        position: absolute;
        top: 72%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(60vw, 30vh, 200rem);
        height: calc(min(60vw, 30vh, 200rem) * 0.285);
        background-image: url("<?php echo file_url; ?>website intro header name.png");
        <?php echo background_style; ?>
    }

    .nmbot-telegram .header .description {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        text-align: center;
        color: #ffffff;
        font-size: min(4vw, 4vh, 26rem);
        padding: 20rem 0;
        opacity: 0;
    }

    .nmbot-telegram .fade-in {
        opacity: 0;
    }

    .nmbot-telegram .text-only-block {
        width: 100%;
        padding: 20rem 0;
        text-align: center;
    }

    .nmbot-telegram .text-only-block-title {
        margin: 10rem 20rem;
        line-height: 1.3;
        font-size: 40rem;
        font-weight: 500;
    }

    .nmbot-telegram .text-only-block-content {
        font-size: 20rem;
        line-height: 1.5;
        padding: 0 30rem;
    }

    .nmbot-telegram .text-only-block-links {
        margin: 20rem 0;
    }

    .nmbot-telegram .text-only-block-links .link {
        display: inline-block;
        margin: 4px;
        padding: 10rem 20rem;
        background-color: #222222;
        color: #ffffff !important;
        font-size: 18rem;
        font-weight: 500;
        border-radius: 50rem;
        text-decoration: none !important;
        border: 2rem solid #ffffff;
        transition: color 0.4s, background-color 0.4s;
    }

    .nmbot-telegram .text-only-block-links .link:hover,
    .nmbot-telegram .text-only-block-links .link:focus-visible {
        background-color: #ffffff;
        color: #222222 !important;
    }

    .nmbot-telegram .feature-detail-block {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        max-width: 1090rem;
        margin: auto;
        text-align: start;
    }

    .nmbot-telegram .feature-detail-block-item {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        margin: 20rem 0;
    }

    .nmbot-telegram .feature-detail-block-item .text {
        width: 50%;
        padding: 13rem 20rem 13rem 50rem;
        flex-grow: 1;
    }

    .nmbot-telegram .feature-detail-block-item .text-title {
        font-size: 22rem;
        font-weight: 500;
        margin-bottom: 3rem;
        line-height: 1.5;
    }

    .nmbot-telegram .feature-detail-block-item .text-content {
        font-size: 19rem;
        line-height: 1.7;
    }

    .nmbot-telegram .feature-detail-block-item .image {
        width: 320rem;
        height: 200rem;
        margin-inline-start: 20rem;
        margin-inline-end: 50rem;
        flex-shrink: 0;
        background-color: #333333;
        border-radius: 15rem;
        <?php echo background_style; ?>
    }

    @media (max-width: 800px) {
        .nmbot-telegram .feature-detail-block-item {
            flex-direction: column-reverse;
            align-items: center;
            margin: 10rem 0;
        }

        .nmbot-telegram .feature-detail-block-item .text {
            width: 80vw;
            padding: 13rem 20rem 13rem 20rem;
        }

        .nmbot-telegram .feature-detail-block-item .text-title {
            font-size: 18rem;
            margin-bottom: 2rem;
        }

        .nmbot-telegram .feature-detail-block-item .text-content {
            font-size: 16rem;
        }

        .nmbot-telegram .feature-detail-block-item .image {
            width: 85vw;
            height: calc(85vw * 0.625);
            margin-inline-start: 0;
            margin-inline-end: 0;
            margin-bottom: 10rem;
        }
    }

    .nmbot-telegram .empty-space {
        height: 100rem;
    }

    .nmbot-telegram .resources {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: stretch;
        width: 100%;
        max-width: 1090rem;
        margin: auto;
        text-align: center;
    }

    .nmbot-telegram .resource-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        width: calc(50% - 40rem);
        padding: 20rem;
        text-align: center;
    }

    @media (max-width: 800px) {
        .nmbot-telegram .resource-item {
            width: calc(100% - 40rem);
        }
    }

    .nmbot-telegram .resource-item .image {
        width: 240rem;
        height: 150rem;
        margin-bottom: 20rem;
        background-color: #333333;
        border-radius: 15rem;
        <?php echo background_style; ?>
    }

    .nmbot-telegram .resource-item .title {
        /* overrides default */
        background: none;
        position: relative;
        margin: 0;
        padding: 0;
        color: inherit;
        overflow: initial;
        font-size: 22rem;
        font-weight: 500;
        margin-bottom: 13rem;
    }

    .nmbot-telegram .resource-item .content {
        font-size: 18rem;
        line-height: 1.5;
        margin-bottom: 10rem;
    }

    .nmbot-telegram .resource-item .link {
        margin-top: 10rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .nmbot-telegram .resource-item .link-a {
        display: inline-block;
        padding: 10rem 20rem;
        background-color: #222222;
        color: #ffffff !important;
        font-size: 18rem;
        font-weight: 500;
        border-radius: 50rem;
        text-decoration: none !important;
        border: 2rem solid #ffffff;
        transition: color 0.4s, background-color 0.4s;
    }

    .nmbot-telegram .resource-item .link-a:hover,
    .nmbot-telegram .resource-item .link-a:focus-visible {
        background-color: #ffffff;
        color: #222222 !important;
    }

    .nmbot-telegram .footer-note-sup {
        color: #999999 !important;
    }

    .nmbot-telegram .footer-notes {
        width: 80vw;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        margin: auto;
        padding: 20rem 0;
    }

    .nmbot-telegram .footer-note {
        color: #999999;
        font-size: 14rem;
        line-height: 1.5;
        margin: 5rem 0;
        text-align: start;
    }

    .nmbot-telegram .footer-note a {
        color: #ffffff !important;
    }

    nobr {
        white-space: break-spaces;
        display: inline-block;
    }

    bs {
        font-weight: bolder;
    }

    sup {
        display: inline-block;
        margin-top: -9rem;
        font-size: 11rem;
    }
</style>

<div class="nmbot-telegram">
    <div class="header">
        <div class="background-image" style="background-position-y: 0vh; "></div>
        <div class="icon" aria-label="nmBot Logo"></div>
        <div class="name" aria-label="nmBot"></div>
        <div class="description"><?php pb("products.nmbot_telegram.description"); ?></div>
    </div>
    <script>
        // auto change background image position by scrollY
        function calcBackgroundPositionY() {
            let scrollY = window.scrollY;
            let background = document.querySelector(".nmbot-telegram .header .background-image");
            background.style.backgroundPositionY = scrollY / 4 + "px";

            // description fade in
            let description = document.querySelector(".nmbot-telegram .header .description");
            description.style.opacity = (scrollY - window.innerHeight) / (window.innerHeight) + 1;
            description.style.bottom = (0.05 * (scrollY - window.innerHeight) + 0.05 * window.innerHeight) + "px";
        }
        window.addEventListener("scroll", function() {
            calcBackgroundPositionY();
        });
        window.addEventListener("resize", function() {
            calcBackgroundPositionY();
        });
        calcBackgroundPositionY();
    </script>
    <div class="text-only-block fade-in">
        <div class="text-only-block-title">
            <?php pb("products.nmbot_telegram.first_intro.title"); ?>
        </div>
        <div class="text-only-block-content">
            <p><?php pb("products.nmbot_telegram.first_intro.content_1"); ?></p>
        </div>
        <div class="text-only-block-links">
            <a href="https://t.me/nmnmfunbot" target="_blank" rel="noopener noreferrer" class="link"><?php pb("products.nmbot_telegram.start_use"); ?></a>
            <a href="https://nmbot.nmnm.fun?ref=nmBotIntro" target="_blank" rel="noopener noreferrer" class="link"><?php pb("products.nmbot_telegram.go_to_panel"); ?></a>
        </div>
    </div>
    <div class="empty-space"></div>
    <div class="text-only-block fade-in">
        <div class="text-only-block-title">
            <?php pb("products.nmbot_telegram.panel.title"); ?>
        </div>
    </div>
    <!-- Starts panel screenshots area -->
    <style>
        .panel-screenshot-image {
            position: relative;
            width: 100%;
            /* for other phone's appearance animation */
            height: 250vh;
            overflow: hidden;
        }

        .panel-screenshot-image .mobile {
            position: absolute;
            top: 0;
            width: 100%;
            height: 90vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .panel-screenshot-image .mobile .mobile-phone {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: min(80vw, 360px);
            height: 0;
            padding-top: calc(min(80vw, 360px) * 2);
            <?php echo background_style; ?>
        }

        .panel-screenshot-image .mobile .mobile-phone-left {
            z-index: 1;
            background-image: url("<?php echo file_url; ?>website intro panel iphone 2.png");
        }

        .panel-screenshot-image .mobile .mobile-phone-center {
            z-index: 2;
            background-image: url("<?php echo file_url; ?>website intro panel iphone 1.png");
        }

        .panel-screenshot-image .mobile .mobile-phone-right {
            z-index: 1;
            background-image: url("<?php echo file_url; ?>website intro panel iphone 3.png");
        }
    </style>
    <div class="panel-screenshot-image" aria-hidden="true">
        <div class="mobile">
            <div class="mobile-phone mobile-phone-left"></div>
            <div class="mobile-phone mobile-phone-center"></div>
            <div class="mobile-phone mobile-phone-right"></div>
        </div>
    </div>
    <script>
        // auto change background image position by scrollY
        function calcPanelScreenshotImage() {
            let scrollY = window.scrollY;
            let element = document.querySelector(".panel-screenshot-image");
            let rect = element.getBoundingClientRect();
            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;
            let top = rect.top;
            let bottom = rect.bottom;
            let height = rect.height;
            let scrollPercent = (windowHeight - top) / windowHeight; // the percent of scroll

            let mobile = document.querySelector(".panel-screenshot-image .mobile");

            let images = document.querySelectorAll(".panel-screenshot-image .mobile .mobile-phone");
            // calc image size, set in css
            let imageWidth = Math.min(windowWidth * 0.8, 360);
            let imageHeight = imageWidth * 2;
            console.log('windowWidth', windowWidth, 'imageWidth', imageWidth);

            let animationStartPercent = 0.9;
            let animationEndPercent = 2.5;

            // if window width not enough for 3 images to show/height not enough, set scale
            let scaleTarget = 1;
            let scaleTargetX = 1;
            let scaleTargetY = 1;

            if (windowWidth < imageWidth * 3) {
                scaleTargetX = windowWidth / (imageWidth * 3);
            }
            if (windowHeight * 0.9 < imageHeight) {
                scaleTargetY = windowHeight / imageHeight * 0.9;
            }

            // use the smaller
            scaleTarget = Math.min(scaleTargetX, scaleTargetY);
            console.log('scaleTarget', scaleTarget);

            // if height not enough, scale here
            if (scaleTargetY < 1) {
                mobile.style.transform = "scale(" + scaleTargetY + ")";
            } else {
                mobile.style.transform = "scale(1)";
            }

            // if scrollPercent < 0.9, is normal
            if (scrollPercent < animationStartPercent) {
                mobile.style.position = "absolute";
                mobile.style.top = 0;
                mobile.style.bottom = 'auto';

                // hide other images by default
                images.forEach((image) => {
                    if (!image.className.includes('mobile-phone-center')) {
                        image.style.opacity = 0;
                    }
                });
            } else {
                // the percent between 0.8 with the bottom visible place
                let animationPercent = Math.min(1, (scrollPercent - animationStartPercent) / (animationEndPercent - animationStartPercent)); // between 0.8 and 2.5
                let animationExtraPercent = Math.max(0, (scrollPercent - animationEndPercent)); // after the bottom of the box appeared
                console.log('animationPercent', animationPercent, 'animationExtraPercent', animationExtraPercent);

                // calc scale percent of this position
                if (scaleTargetX < scaleTargetY) { // if still needs to scale
                    var scalePercent = scaleTargetY - (scaleTargetY - scaleTargetX) * (animationPercent);
                } else { // use the scale Y
                    var scalePercent = scaleTargetY;
                }

                // set scale
                mobile.style.transform = "scale(" + scalePercent + ")";

                // calc other images' position
                let targetOffset = imageWidth + 10; // target image position
                let offset = targetOffset * animationPercent; // position due to scroll height
                images.forEach((image) => {
                    image.style.opacity = 1; // display all

                    if (image.className.includes('mobile-phone-left')) {
                        image.style.left = 'calc(50% - ' + offset + 'px)';
                    } else if (image.className.includes('mobile-phone-right')) {
                        image.style.left = 'calc(50% + ' + offset + 'px)';
                    }
                });

                if (animationPercent === 1) { // after the bottom of the box appeared
                    mobile.style.position = "absolute";
                    mobile.style.top = "auto";
                    mobile.style.bottom = 0;

                    // if scale percent < 1, the image has space to go down
                    // because scale make the space between end of image and text below larger
                    // we don't want such huge space
                    // so we set the mobile images still fixed position, until reaches almost end of the whole box
                    if (scalePercent < 1 && animationExtraPercent > 0) {
                        // max space to go down
                        let maxOffset = Math.max(0, ((windowHeight) - ((imageHeight * scalePercent))) / 2 - 100);
                        if (maxOffset < 90) maxOffset = 0; // avoid jump problem, <90 don't need to move
                        console.log('maxOffset', maxOffset);

                        // if is already the end, return to absolute, set bottom to maxOffset
                        if (animationExtraPercent > maxOffset / windowHeight) {
                            mobile.style.position = "absolute";
                            mobile.style.top = 'auto';
                            mobile.style.bottom = -maxOffset + 'px';
                        } else {
                            // still uses fixed position
                            mobile.style.position = "fixed";
                            mobile.style.top = Math.min(0.1 * windowHeight, maxOffset) + 'px';
                        }
                    }

                } else {
                    // it's on the way 0.8 to 2.5
                    mobile.style.position = "fixed";
                    mobile.style.top = ((1 - animationStartPercent) * 100) + 'vh';
                    mobile.style.bottom = 'auto';
                }
            }
        }
        window.addEventListener("scroll", function() {
            calcPanelScreenshotImage();
        });
        window.addEventListener("resize", function() {
            calcPanelScreenshotImage();
        });
        calcPanelScreenshotImage();
    </script>
    <div class="text-only-block fade-in">
        <div class="text-only-block-title">
            <?php pb("products.nmbot_telegram.panel.simplified_title"); ?>
        </div>
        <div class="text-only-block-content">
            <p><?php pb("products.nmbot_telegram.panel.simplified_content_1"); ?></p>
            <p><?php pb("products.nmbot_telegram.panel.simplified_content_2"); ?></p>
        </div>
    </div>
    <div class="feature-detail-block">
        <div class="feature-detail-block-item fade-in">
            <div class="text">
                <div class="text-title">
                    <?php pb("products.nmbot_telegram.panel.feature_1.title"); ?>
                </div>
                <div class="text-content">
                    <?php pb("products.nmbot_telegram.panel.feature_1.content"); ?>
                </div>
            </div>
            <div class="image" style="background-image: url('<?php echo file_url; ?>website intro open in telegram.png');"></div>
        </div>
        <div class="feature-detail-block-item fade-in">
            <div class="text">
                <div class="text-title">
                    <?php pb("products.nmbot_telegram.panel.feature_2.title"); ?>
                </div>
                <div class="text-content">
                    <?php pb("products.nmbot_telegram.panel.feature_2.content"); ?>
                </div>
            </div>
            <div class="image" style="background-image: url('<?php echo file_url; ?>website intro open in website.png');"></div>
        </div>
        <div class="feature-detail-block-item fade-in">
            <div class="text">
                <div class="text-title">
                    <?php pb("products.nmbot_telegram.panel.feature_3.title"); ?>
                </div>
                <div class="text-content">
                    <?php pb("products.nmbot_telegram.panel.feature_3.content"); ?>
                </div>
            </div>
            <div class="image" style="background-image: url('<?php echo file_url; ?>website intro detail.png');"></div>
        </div>
    </div>
    <div class="empty-space"></div>
    <div class="text-only-block fade-in">
        <div class="text-only-block-title">
            <?php pb("products.nmbot_telegram.features.title"); ?>
        </div>
        <div class="text-only-block-content">
            <p><?php pb("products.nmbot_telegram.features.content_1"); ?></p>
        </div>
    </div>
    <style>
        .nmbot-features-list {
            width: 90vw;
            max-width: 1200rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .nmbot-features-list .chat-type {
            width: calc(100% - 20rem);
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
        }

        .nmbot-features-list .chat-type-button {
            width: calc(100% / 3);
            padding: 14rem 20rem;
            background: none;
            color: #ffffff;
            font-size: 18rem;
            font-weight: 300;
            cursor: pointer;
            border: none;
            border-radius: 11px 11px 0 0;
        }

        .nmbot-features-list .chat-type-button.active {
            font-weight: 500;
            background-color: #0e0e0e;
        }

        .nmbot-features-list .features-lists {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: center;
            border-radius: 9rem 9rem 15rem 15rem;
            background-color: #0e0e0e;
        }

        .nmbot-features-list .features-list {
            width: 100%;
            padding: 10rem 0;
            display: none;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
        }

        .nmbot-features-list .features-list.active {
            display: flex;
        }

        .nmbot-features-list .feature {
            display: flex;
            width: calc(100% - 40rem);
            padding: 6rem 20rem;
            font-size: 18rem;
            line-height: 1.5;
            text-align: start;
            font-weight: 400;
        }

        .nmbot-features-list .feature::before {
            content: "• ";
            font-weight: 600;
        }

        .nmbot-features-list .its-only-part {
            width: calc(100% - 50rem);
            padding: 6rem 20rem;
            font-size: 15rem;
            line-height: 1.5;
            text-align: start;
            font-weight: 300;
            color: #999999;
        }

        @media (min-width: 1020px) {
            .nmbot-features-list .chat-type {
                width: 100%;
                background-color: #0e0e0e;
                border-radius: 15rem 15rem 0 0;
            }

            .nmbot-features-list .chat-type-button {
                display: flex;
                cursor: auto;
                text-align: left;
                font-size: 23rem;
                font-weight: 500;
            }

            .nmbot-features-list .chat-type-button::before {
                content: "• ";
                color: #00000000;
                font-size: 18rem;
            }

            .nmbot-features-list .features-lists {
                width: 100%;
                border-radius: 0 0 15rem 15rem;
                display: flex;
            }

            .nmbot-features-list .features-list {
                display: flex;
                padding: 4rem 0 10rem 0;
            }
        }
    </style>
    <div class="nmbot-features-list fade-in">
        <div class="chat-type">
            <button class="chat-type-button active" data-chat-type="group"><?php pb("products.nmbot_telegram.features.group"); ?></button>
            <button class="chat-type-button" data-chat-type="channel"><?php pb("products.nmbot_telegram.features.channel"); ?></button>
            <button class="chat-type-button" data-chat-type="private"><?php pb("products.nmbot_telegram.features.private"); ?></button>
        </div>
        <div class="features-lists">
            <?php
            $chat_types = array("group", "channel", "private");
            foreach ($chat_types as $chat_type) { ?>
                <div class="features-list <?php if ($chat_type === "group") echo "active"; ?>" data-chat-type="<?php echo $chat_type; ?>">
                    <?php
                    $features_i18n = t("products.nmbot_telegram.features." . $chat_type . "_features"); // returns a object
                    $features = array_values((array)$features_i18n);
                    foreach ($features as $feature) { ?>
                        <div class="feature"><?php echo $feature; ?></div>
                    <?php }

                    ?>
                </div>
            <?php } ?>
        </div>
        <div class="its-only-part"><?php pb("products.nmbot_telegram.features.its_only_part"); ?></div>
    </div>
    <script>
        function initFeaturesList() {
            let chatTypeButtons = document.querySelectorAll(".nmbot-features-list .chat-type-button");
            let featuresLists = document.querySelectorAll(".nmbot-features-list .features-list");

            chatTypeButtons.forEach((button) => {
                button.addEventListener("click", function() {
                    chatTypeButtons.forEach((b) => {
                        b.classList.remove("active");
                    });
                    button.classList.add("active");

                    featuresLists.forEach((list) => {
                        list.classList.remove("active");
                        if (list.getAttribute("data-chat-type") === button.getAttribute("data-chat-type")) {
                            list.classList.add("active");
                        }
                    });

                    try {
                        updateAllFadeIn();
                    } catch (err) {};
                });
            });
        }
        initFeaturesList();
    </script>
    <div class="text-only-block fade-in">
        <div class="text-only-block-title">
            <?php pb("products.nmbot_telegram.features.special.title"); ?>
        </div>
        <div class="text-only-block-content">
            <p><?php pb("products.nmbot_telegram.features.special.content_0"); ?></p>
        </div>
    </div>
    <div class="feature-detail-block">
        <?php
        for ($i = 1; $i <= 5; $i++) { ?>
            <div class="feature-detail-block-item fade-in">
                <div class="text">
                    <div class="text-title">
                        <?php pb("products.nmbot_telegram.features.special.feature_" . $i . ".title"); ?>
                    </div>
                    <div class="text-content">
                        <?php pb("products.nmbot_telegram.features.special.feature_" . $i . ".content"); ?>
                    </div>
                </div>
                <div class="image" style="background-image: url('<?php
                                                                    echo file_url;
                                                                    p("products.nmbot_telegram.features.special.feature_" . $i . ".image")
                                                                    ?>');"></div>
            </div>
        <?php } ?>
    </div>
    <div class="text-only-block fade-in">
        <div class="text-only-block-content">
            <p><?php pb("products.nmbot_telegram.features.special.content_1"); ?></p>
        </div>
    </div>
    <div class="empty-space"></div>
    <div class="text-only-block fade-in">
        <div class="text-only-block-title">
            <?php pb("products.nmbot_telegram.usage.title"); ?>
        </div>
        <div class="text-only-block-content">
            <p><?php pb("products.nmbot_telegram.usage.content_0"); ?></p>
        </div>
    </div>
    <style>
        .nmbot-telegram .usage-data-block {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: stretch;
            width: 100%;
            max-width: 1090rem;
            margin: auto;
            text-align: center;
        }

        .nmbot-telegram .usage-data-block-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            width: calc(50% - 40rem);
            padding: 20rem;
            text-align: center;
            transition: transform 0.4s, opacity 0.4s;
        }

        @media (max-width: 800px) {
            .nmbot-telegram .usage-data-block-item {
                width: calc(100% - 40rem);
            }
        }

        .nmbot-telegram .usage-data-block-item .data {
            /* overrides default */
            background: none;
            position: relative;
            margin: 0;
            padding: 0;
            color: inherit;
            overflow: initial;
            font-size: 80rem;
            font-weight: 500;
            margin-bottom: 13rem;
        }

        .nmbot-telegram .usage-data-block-item .text-title {
            font-size: 18rem;
            font-weight: 400;
            line-height: 1.5;
            margin-bottom: 10rem;
        }
    </style>
    <div class="usage-data-block">
        <div class="usage-data-block-item">
            <div class="text">
                <div class="data" data-data="14650">0</div>
                <div class="text-title">
                    <?php pb("products.nmbot_telegram.usage.data.total_group_count"); ?>
                </div>
            </div>
        </div>
        <div class="usage-data-block-item">
            <div class="text">
                <div class="data" data-data="239917">0</div>
                <div class="text-title">
                    <?php pb("products.nmbot_telegram.usage.data.mau"); ?>
                </div>
            </div>
        </div>
        <div class="usage-data-block-item">
            <div class="text">
                <div class="data" data-data="1088123">0</div>
                <div class="text-title">
                    <?php pb("products.nmbot_telegram.usage.data.daily_message_count"); ?>
                </div>
            </div>
        </div>
        <div class="usage-data-block-item">
            <div class="text">
                <div class="data" data-data="32723">0</div>
                <div class="text-title">
                    <?php pb("products.nmbot_telegram.usage.data.chat_admin_count"); ?>
                </div>
            </div>
        </div>
    </div>
    <script>
        let usageAnimationStatus = [];
        let dataBlocks = document.querySelectorAll(".nmbot-telegram .usage-data-block-item");
        dataBlocks.forEach((block) => {
            usageAnimationStatus.push(false);
        });

        function calcDataBlock() {
            let dataBlocks = document.querySelectorAll(".nmbot-telegram .usage-data-block-item");
            dataBlocks.forEach((block, i) => {
                let data = block.querySelector(".data").getAttribute("data-data");
                // when top is 60% of window height, start to show
                let rect = block.getBoundingClientRect();
                let windowHeight = window.innerHeight;
                const scrollPercent = (windowHeight - rect.top) / windowHeight;
                if (scrollPercent > 0.4) {
                    // if is already animated, skip
                    if (!!usageAnimationStatus[i]) {
                        return;
                    }

                    block.querySelector(".data").innerText = '0';

                    block.style.opacity = 1;
                    block.style.transform = "translateY(0)";

                    let start = performance.now();
                    let duration = 1500;
                    usageAnimationStatus[i] = true;
                    let interval = setInterval(() => {
                        let now = performance.now();
                        let percent = (now - start) / duration;
                        if (percent >= 1) {
                            percent = 1;
                            clearInterval(interval);
                            usageAnimationStatus[i] = 'ended';
                        }
                        block.querySelector(".data").innerText = Math.floor(data * percent);
                    }, 10);
                } else {
                    block.style.opacity = 0;
                    block.style.transform = "translateY(1rem)";

                    // reset animation status
                    usageAnimationStatus[i] = false;
                }
            });
        }
        window.addEventListener("scroll", function() {
            calcDataBlock();
        });
        window.addEventListener("resize", function() {
            calcDataBlock();
        });
        calcDataBlock();
    </script>
    <div class="empty-space"></div>
    <div class="text-only-block fade-in">
        <div class="text-only-block-title">
            <?php pb("products.nmbot_telegram.resources.title"); ?>
        </div>
        <div class="text-only-block-content">
            <p><?php pb("products.nmbot_telegram.resources.content_0"); ?></p>
        </div>
    </div>
    <div class="resources">
        <div class="resource-item fade-in">
            <div class="image" style="background-image: url('<?php echo file_url; ?>website intro channel.png');"></div>
            <div class="title"><?php pb("products.nmbot_telegram.resources.channel_title"); ?></div>
            <div class="content"><?php pb("products.nmbot_telegram.resources.channel_content"); ?></div>
            <div class="link">
                <a href="https://t.me/nmbotchannel" target="_blank" rel="noopener noreferrer" class="link-a"><?php pb("products.nmbot_telegram.resources.channel_link"); ?></a>
            </div>
        </div>
        <div class="resource-item fade-in">
            <div class="image" style="background-image: url('<?php echo file_url; ?>website intro doc.png');"></div>
            <div class="title"><?php pb("products.nmbot_telegram.resources.documention_title"); ?></div>
            <div class="content"><?php pb("products.nmbot_telegram.resources.documention_content"); ?></div>
            <div class="link">
                <a href="https://support.nmteam.xyz/nmbot-telegram?ref=nmBotIntro" target="_blank" rel="noopener noreferrer" class="link-a"><?php pb("products.nmbot_telegram.resources.documention_link"); ?></a>
            </div>
        </div>
        <div class="resource-item fade-in">
            <div class="image" style="background-image: url('<?php echo file_url; ?>website intro news.png');"></div>
            <div class="title"><?php pb("products.nmbot_telegram.resources.newsroom_title"); ?></div>
            <div class="content"><?php pb("products.nmbot_telegram.resources.newsroom_content"); ?></div>
            <div class="link">
                <a href="https://newsroom.nmteam.xyz/category/nmBot/?ref=nmBotIntro" target="_blank" rel="noopener noreferrer" class="link-a"><?php pb("products.nmbot_telegram.resources.newsroom_link"); ?></a>
            </div>
        </div>
        <div class="resource-item fade-in">
            <div class="image" style="background-image: url('<?php echo file_url; ?>website intro community.png');"></div>
            <div class="title"><?php pb("products.nmbot_telegram.resources.community_title"); ?></div>
            <div class="content"><?php pb("products.nmbot_telegram.resources.community_content"); ?></div>
            <div class="link">
                <a href="https://t.me/nmteamchat/20055" target="_blank" rel="noopener noreferrer" class="link-a"><?php pb("products.nmbot_telegram.resources.community_link"); ?></a>
            </div>
        </div>
    </div>
    <div class="empty-space"></div>
    <div class="footer-notes">
        <!-- Global notes -->
        <div class="footer-note"><?php pb("products.nmbot_telegram.footer_notes.0"); ?></div>
        <?php
        $footer_note_count = 0;
        foreach ($footer_notes as $note) {
            $footer_note_count++;
            echo "<div class='footer-note' id='footer-note-$footer_note_count'><a href='#footer-note-sup-$footer_note_count'>$footer_note_count.</a> $note</div>";
        }
        ?>
    </div>
</div>

<script>
    // fade in
    function calcFadeIn(element) {
        let rect = element.getBoundingClientRect();
        let windowHeight = window.innerHeight;
        let top = rect.top;
        let scrollPercent = (windowHeight - top) / windowHeight;
        let maxTranslateY = 24;
        if (scrollPercent > 0.06 && scrollPercent < 0.36) {
            let animationPercent = (scrollPercent - 0.06) / 0.30;
            element.style.opacity = animationPercent;
            element.style.transform = "translateY(" + ((1 - animationPercent) * maxTranslateY) + "rem)";
        } else if (scrollPercent >= 0.36) {
            element.style.opacity = 1;
            element.style.transform = "translateY(0em)";
        } else {
            element.style.opacity = 0;
            element.style.transform = `translateY(${maxTranslateY}rem)`;
        }
    }

    let fadeIns = document.querySelectorAll(".fade-in");
    fadeIns.forEach((fadein) => {
        // add scroll event listener
        window.addEventListener("scroll", function() {
            calcFadeIn(fadein);
        });
        window.addEventListener("resize", function() {
            calcFadeIn(fadein);
        });
        // initial calc
        calcFadeIn(fadein);
    });

    function updateAllFadeIn() {
        fadeIns.forEach((fadein) => {
            calcFadeIn(fadein);
        });
    }
</script>

<?php setFooter();
?>

<style>
    .product-header {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, 120%);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: calc(80vw);
        height: 100%;
        max-width: 990rem;
        margin: auto;
        transition: all 0.4s;
    }

    .product-header .product-name {
        font-size: 20rem;
        font-weight: 500;
        color: var(--header-name);
    }

    .product-header .action-buttons {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
    }

    .product-header .action-button {
        padding: 5rem 10rem !important;
        margin-left: 5rem !important;
        font-size: 14rem !important;
        font-weight: 400 !important;
        color: var(--header-a) !important;
        border: none !important;
        border-radius: 500rem !important;
        cursor: pointer !important;
        text-decoration: none !important;
    }

    .product-header .action-button.primary {
        background-color: #ead050 !important;
        color: #000000 !important;
    }

    #hcont #pageHeader {
        overflow: hidden;
    }

    #hcont .header:not([open]) * {
        transition: color 0.1s, visibility 0.1s 0.5s, opacity 0.1s, transform 0.4s !important;
    }

    #pageHeader .left[data-hide=true],
    #pageHeader .right[data-hide=true] {
        transform: translate(0, -120%);
    }

    .product-header[data-hide=false] {
        transform: translate(-50%, 0%);
    }
</style>

<script>
    // inject header, add ourselfs nmBot header
    let nmBotHeaderHTML = /*html*/ `

    <div class="product-name"><?php pb("products.nmbot_telegram.header_name"); ?></div>
    <div class="action-buttons">
        <a href="https://nmbot.nmnm.fun?ref=nmBotHeader" target="_blank" rel="noopener noreferrer" class="action-button"><?php pb("products.nmbot_telegram.go_to_panel"); ?></a>
        <a href="https://t.me/nmnmfunbot" target="_blank" rel="noopener noreferrer" class="action-button primary"><?php pb("products.nmbot_telegram.start_use"); ?></a>
    </div>

`;

    // inject, append to #pageHeader
    let header = document.createElement("div");
    header.className = "product-header";
    header.innerHTML = nmBotHeaderHTML;
    document.querySelector("#pageHeader").appendChild(header);

    // control original header and injected header to show
    let lastScrollTop = undefined;

    function calcPageHeader() {
        let pageHeaders = document.querySelectorAll("#pageHeader .left, #pageHeader .right");
        let nmBotHeader = document.querySelector(".product-header");
        let windowHeight = window.innerHeight;
        let scrollTop = document.documentElement.scrollTop;
        let scrollPercent = scrollTop / windowHeight;
        if (scrollPercent > 1 && (!lastScrollTop || scrollTop - lastScrollTop > 1)) {
            pageHeaders.forEach((header) => {
                header.setAttribute("data-hide", "true");
            });
            nmBotHeader.setAttribute("data-hide", "false");
        } else if (scrollPercent < 1 || (lastScrollTop && scrollTop - lastScrollTop < -1)) {
            pageHeaders.forEach((header) => {
                header.setAttribute("data-hide", "false");
            });
            nmBotHeader.setAttribute("data-hide", "true");
        }
        lastScrollTop = scrollTop;
    }
    window.addEventListener("scroll", function() {
        calcPageHeader();
    });
    window.addEventListener("resize", function() {
        calcPageHeader();
    });
    calcPageHeader();
</script>