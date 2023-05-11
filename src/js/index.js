var cardSwiper = new Swiper('.cardSwiper',
    {
        direction: 'horizontal',
        loop: false,
        slidesPerView: 'auto',
        centeredSlides: false,
        slidesOffsetAfter: 0,
        pagination: { el: '.swiper-pagination', },
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        navigation:
            { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev', },
    });


// header icon 

function setHeader() {
    if (window.scrollY < $(".indexHeader")[0].getBoundingClientRect().height - 55) {
        $("#pageHeader")[0].className += " hidden hidetitle ";
    }
    else {
        $("#pageHeader")[0].className = $("#pageHeader")[0].className.replace(/hidden/g, " ").replace(/hidetitle/g, " ");
    }
}

setHeader();

// index Newsroom Article

loadNews();

function loadNews() {
    $("#newsSwiperItems").html(`<center><span data-i18n="index.newslist_loading"><span></center>`);

    $.ajax("https://newsroom.nmteam.xyz/api/posts?showContent=false&pageSize=5&page=1", {
        type: "GET",
        async: true,
        data: {},
        crossDomain: true,
        datatype: "jsonp",
        success: function (data) {
            newsHTML = ``;
            if (data['status'] == 200) {
                data['data'].forEach(function (value) {
                    newsHTML += `<a class="swiper-slide" href="${value['permalink']}" target="_blank" title="${value['title']}">
                        <h3>${value['title']}</h3>
                        <div class="time" aria-label="${newsRoomTimeI18n}: ${value['year']}-${value['month']}-${value['day']}"><svg aria-label="${newsRoomTimeI18n}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 1024C229.229714 1024 0 794.770286 0 512S229.229714 0 512 0s512 229.229714 512 512-229.229714 512-512 512z m0-73.142857c242.358857 0 438.857143-196.498286 438.857143-438.857143S754.358857 73.142857 512 73.142857 73.142857 269.641143 73.142857 512s196.498286 438.857143 438.857143 438.857143z m36.571429-694.857143v256.365714l255.963428-0.365714 0.073143 73.142857-329.179429 0.475429V256h73.142858z" p-id="3478"></path></svg>${value['year']}-${value['month']}-${value['day']}</div>
                        <p>${value['text'].split("<!--more-->")[0].replace(/\n/g, "<br />").replace(/#/g, "").replace(/![img](S*)/g, "")}</p>
                        <div class="cover"></div>
                    </a>`;
                });
            }
            $("#newsSwiperItems").html(newsHTML);
            cardSwiper[1].updateSlides();
        },
        error: function () {
            $("#newsSwiperItems").html(`<center><span data-i18n="index.newslist_error"></span><div class="indexMoreLinks"><a href="javascript:" onclick="loadNews();" data-button-type="no"><span data-i18n="index.retry"></span></a></div></center>`);

        }
    });
}