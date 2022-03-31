$(".tabHeader button").on("click", function(){
    focusTab($(this).parent().parent(),$(this).attr("data-tab"));
})

function focusTab(ele, tabid) {
    ele.find("*").attr("data-status", "");
    ele.find("*[data-tab=" + tabid + "]").attr("data-status", "focus");
}