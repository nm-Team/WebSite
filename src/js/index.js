// 这是只在首页执行的 js

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