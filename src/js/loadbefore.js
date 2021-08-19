// 判断当前访问类型
if (window.location.host.match("localhost") != null)
    nowChannel = "Localhost";
else if (window.location.host.match("canary") != null)
    nowChannel = "Canary";
else if (window.location.host.match("dev") != null)
    nowChannel = "Dev";
else if (window.location.host.match("beta") != null)
    nowChannel = "Beta";
else nowChannel = "main";
if (nowChannel != "main") {
    document.write("<p class='insiderTip' id='insiderTip'>您正在通过 " + nowChannel + " 通道访问 nmTeam 网站。<a href='javascript:document.getElementById(`insiderTip`).style.visibilty=`hidden`;'></a></p>");
    document.title = "[" + nowChannel[0] + "]" + document.title;
}
document.write(
    `
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8202YMVF5B"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-8202YMVF5B');
    </script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5779459433500433"
     crossorigin="anonymous"></script>
    `
);