// 强制作答
$("[data-must-answer=true] input[data-type=text], [data-must-answer=true] textarea").on("input", function (e) {
    var $this = $(this);
    if ($this.val() == "" && $this.html() == "") {
        $this.parents(".question").find(".dTip").html(questionnaireI18n.must_input);
        quesAnswerList[$this.parents(".question").attr("data-qid")] = false;
    }
    else {
        $this.parents(".question").find(".dTip").html("");
        quesAnswerList[$this.parents(".question").attr("data-qid")] = true;
    }
})

$("[data-must-answer=true] .input input").on("change", function (e) {
    var $this = $(this);
    if ($this.parents(".questionAnswers").find("input:checked").length == 0) {
        $this.parents(".question").find(".dTip").html(questionnaireI18n.must_input);
        quesAnswerList[$this.parents(".question").attr("data-qid")] = false;
    }
    else if ($this.parents(".question").attr("data-num-limit") && $this.parents(".questionAnswers").find("input:checked").length < Number($this.parents(".question").attr("data-num-limit").split(",")[0])) {
        $this.parents(".question").find(".dTip").html(questionnaireI18n.select_min_limit.replace(/{n}/g, $this.parents(".question").attr("data-num-limit").split(",")[0]));
        quesAnswerList[$this.parents(".question").attr("data-qid")] = false;
    }
    else if ($this.parents(".question").attr("data-num-limit") && $this.parents(".questionAnswers").find("input:checked").length > Number($this.parents(".question").attr("data-num-limit").split(",")[1])) {
        $this.parents(".question").find(".dTip").html(questionnaireI18n.select_max_limit.replace(/{n}/g, $this.parents(".question").attr("data-num-limit").split(",")[1]));
        quesAnswerList[$this.parents(".question").attr("data-qid")] = false;
    }
    else {
        $this.parents(".question").find(".dTip").html("");
        quesAnswerList[$this.parents(".question").attr("data-qid")] = true;
    }
})

$("[data-filter-id] .input input").on("change", function (e) {
    var $this = $(this);
    $("[data-filter-bind=" + $this.parents(".question").attr("data-filter-id") + "]").each(function (i, e) {
        $(e).css("display", "none");
    });
    $this.parents(".questionAnswers").find("input:checked").each(function (i, e) {
        $("[data-filter-bind=" + $this.parents(".question").attr("data-filter-id") + "]").each(function (i2, e2) {
            if (e2.getAttribute("data-filter-value").split(",").indexOf(e.value) > -1) {
                $(e2).css("display", "block");
            }
        });
    });
})

function submitQue() {
    $(".question").each(function (i, e) {
        if ($(e).attr("data-filter-bind") != "" && $(e).css("display") == "none") {
            $(e).find("input").prop("checked", false);
            quesAnswerList[i] = true;
        }
    });
    if (quesAnswerList.indexOf(false) != -1) {
        window.location.href = "#q_" + quesAnswerList.indexOf(false);
        $(`#q_${quesAnswerList.indexOf(false)}`).find(".dTip:empty").html(questionnaireI18n.must_input);
        $(`#q_${quesAnswerList.indexOf(false)}`).attr("data-mention", "true");
        setTimeout(() => {
            $(`#q_${quesAnswerList.indexOf(false)}`).attr("data-mention", "false");
        }, 1000);
        $('html, body').scrollTop($('html, body').scrollTop() - 100);
    }
    else {
        mainForm.setAttribute("onsubmit", "return true;");
        mainForm.submit();
    }
}

$(document).ready(function () {
    if (requireLog) {
        returnWord = "";
        try {
            getInfo(function () {
                accountInfo = returnWord;
                if (accountInfo == -1 || accountInfo == -2) {
                    $("#mainForm").html("");
                    $("#logRequireDiv").css("display", "block");
                }
                else {
                    $("#sessionDiv").css("display", "block");
                    $("#sessionNameP").html($("#sessionNameP").html().replace(/{name}/g, accountInfo.nick));
                    $("#sessionid").val(getCookie("sessionid"));
                }
            });
        } catch (e) {
            console.error(e);
            $("#mainForm").html("");
            $("#logErrDiv").css("display", "block");
        }
    }
});