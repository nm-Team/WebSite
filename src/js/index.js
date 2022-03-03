

var indexMainSwiper = new Swiper('#indexMainBox', {
    direction: 'vertical',
    initialSlide: 0,
    speed: 1000,
    autoplay: false,
    mousewheel: true,
    keyboard: {
        enabled: true,
        onlyInViewport: true,
    }, hashNavigation: true,
    on: {
        slideChangeTransitionStart: function (swiper, event) {
            indexHeader(swiper);
        }
    },
});

indexMainSwiper.init();

var cardSwiper = new Swiper('.cardSwiper',
    {
        direction: 'horizontal',
        loop: false,
        slidesPerView: 'auto',
        centeredSlides: false,
        slidesOffsetAfter: 200,
        pagination: { el: '.swiper-pagination', },
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        navigation:
            { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev', },
    });


indexHeader(indexMainSwiper);

function indexHeader(swiper) {
    // show header background
    if (swiper.realIndex > 0) {
        $("#hcont .header").removeClass("hidden hidetitle");
    }
    else {
        $("#hcont .header").addClass("hidden hidetitle");
    }
    if (swiper.realIndex == (swiper.slides.length - 1)) {
        $("#fcont").addClass("data-index-show");
    }
    else {
        $("#fcont").removeClass("data-index-show");
    }
}