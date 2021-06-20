window.onloadstart = function () {
    window.location.href = "#";
}

var mySwiper = new Swiper('.swiper-container', {
    direction: 'horizontal',
    loop: true,
    slidesPerView: 'auto',
    loopedSlides: 2,
    centeredSlides: true,
    autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: true,
    },

    // 如果需要分页器
    pagination: {
        el: '.swiper-pagination',
    },

    // 如果需要前进后退按钮
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    // 如果需要滚动条
    scrollbar: {
        el: '.swiper-scrollbar',
    },
})

var language; // 全局语言

// 更改语言函数
function changeLanguage(lang = "zh_CN") {
    language = lang;
    i18n.init(
        {
            lng: language,

            // 所有翻译在 /src/locales/ 目录下
            // 注：该目录下的 dev.json 请勿删除
            resGetPath: '/src/locales/__lng__.json'
        },
        function (t) {
            $('html').i18n();
        }
    );
}
changeLanguage();