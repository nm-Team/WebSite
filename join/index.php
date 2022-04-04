<?php
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
define("page_title", "join.join_requirement_page.title");
define("page_keywords", "欢迎你,加入nmTeam,招人,招贤纳财");
define("page_description", "join.join_requirement_page.description");
define("page_head_css", array("/src/css/jobpage.css"));
define("page_head_js", array());
define("page_body_js", array("/src/js/tab.js"));
define("page_image", "");
define("page_update", "20220331");
setHeader();
?>
<div class="title center">
    <h1><?php p("join.join_requirement_page.title"); ?></h1>
</div>
<div class="main">
    <div class="mainBlock">
        <p><?php p("join.join_requirement_page.intro.0"); ?></p>
        <p><?php p("join.join_requirement_page.intro.1"); ?></p>
        <!-- <p><?php p("join.join_requirement_page.intro.2"); ?></p> -->
        <p style="color: #FF0000;"><?php p("join.join_requirement_page.publicity"); ?></p>
    </div>
    <div class="mainBlock">
        <div class="tabView joinTab" id="joinTab">
            <div class="tabHeader">
                <button data-tab="developer"><?php p("join.join_requirement_page.jobs.developer.title"); ?></button>
                <button data-tab="support"><?php p("join.join_requirement_page.jobs.support.title"); ?></button>
                <button data-tab="writer"><?php p("join.join_requirement_page.jobs.writer.title"); ?></button>
            </div>
            <div class="tabContents">
                <div class="content" data-tab="developer">
                    <h2><?php p("join.join_requirement_page.jobs.developer.title"); ?></h2>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.nm_heart"); ?>
                    </p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.common.nm_heart_intro"); ?></div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.basic_morality"); ?>
                    </p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.common.basic_morality_intro"); ?>
                    </div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.friendly_wish"); ?>
                    </p>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.developer.knowledge"); ?></p>
                    <!-- <div class="detail"><?php p("join.join_requirement_page.jobs.developer.knowledge_intro"); ?> -->
                    <!-- </div> -->
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.developer.experience"); ?></p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.developer.experience_intro"); ?>
                    </div>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.developer.additional"); ?>
                    </div>
                    <div class="indexMoreLinks">
                        <a target="_self" href="/join/forum?jobType=developer">
                            <span><?php p("join.join_requirement_page.register"); ?></span>
                            <svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
                            </svg>
                        </a>
                    </div>
                    <div class="detail"><?php p("join.join_requirement_page.language_request"); ?>
                    </div>
                </div>
                <div class="content" data-tab="support">
                    <h2><?php p("join.join_requirement_page.jobs.support.title"); ?></h2>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.nm_heart"); ?>
                    </p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.common.nm_heart_intro"); ?></div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.basic_morality"); ?>
                    </p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.common.basic_morality_intro"); ?>
                    </div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.friendly_wish"); ?>
                    </p>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.support.part_time"); ?></p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.support.part_time_intro"); ?>
                    </div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.support.attitude"); ?></p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.support.attitude_intro"); ?>
                    </div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.support.bill"); ?></p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.support.bill_intro"); ?>
                    </div>
                    <div class="indexMoreLinks">
                        <a target="_self" href="/join/forum?jobType=support">
                            <span><?php p("join.join_requirement_page.register"); ?></span>
                            <svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
                            </svg>
                        </a>
                    </div>
                    <div class="detail"><?php p("join.join_requirement_page.language_request"); ?></div>
                </div>
                <div class="content" data-tab="writer">
                    <h2><?php p("join.join_requirement_page.jobs.writer.title"); ?></h2>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.nm_heart"); ?>
                    </p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.common.nm_heart_intro"); ?></div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.basic_morality"); ?>
                    </p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.common.basic_morality_intro"); ?>
                    </div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.common.friendly_wish"); ?>
                    </p>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.writer.lan_level"); ?></p>
                    <div class="detail"><?php p("join.join_requirement_page.jobs.writer.lan_level_intro"); ?>
                    </div>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.writer.knowledge"); ?></p>
                    <p class="requirementName"><?php p("join.join_requirement_page.jobs.writer.english"); ?></p>
                    <div class="indexMoreLinks">
                        <a target="_self" href="/join/forum?jobType=writer">
                            <span><?php p("join.join_requirement_page.register"); ?></span>
                            <svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path>
                            </svg>
                        </a>
                    </div>
                    <div class="detail"><?php p("join.join_requirement_page.language_request"); ?></div>
                </div>
            </div>
        </div>
    </div>
    <div class="mainBlock">
        <div class="tabView joinTab" id="moreTab">
            <div class="tabHeader">
                <button data-tab="resources"><?php p("join.join_requirement_page.more.resources.title"); ?></button>
                <button data-tab="already_been_member"><?php p("join.join_requirement_page.more.already_been_member.title"); ?></button>
            </div>
            <div class="tabContents">
                <div class="content" data-tab="resources">
                    <h2><?php p("join.join_requirement_page.more.resources.title"); ?></h2>
                    <div class="detail"><?php p("join.join_requirement_page.more.resources.nmteam_member_rules"); ?>
                    </div>
                </div>
                <div class="content" data-tab="already_been_member">
                    <h2><?php p("join.join_requirement_page.more.already_been_member.title"); ?></h2>
                    <div class="detail"><?php p("join.join_requirement_page.more.already_been_member.panel"); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php setFooter(); ?>
<script>
    focusTab($("#joinTab"), "developer");
    focusTab($("#moreTab"), "resources");
</script>