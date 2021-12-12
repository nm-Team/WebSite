try {
    productsJson = JSON.parse(loadc("/src/json/products/" + getUrlParam("product") + "_" + language + ".json"));
    products_detail_inner.innerHTML = "";
    console.log("Get product detail JSON file. ");
    tipsNum = 0;
    // 处理 page
    products_detail_inner.setAttribute("data-product-name", productsJson.page.productName);
    products_detail_inner.setAttribute("data-theme", productsJson.page.theme);
    products_detail_inner.className += " " + productsJson.page.theme + " ";
    // 处理 header 
    pHeader = productsJson.header;
    sTipsNum = 0;
    btshtml = setButton(pHeader.buttons);
    products_detail_inner.innerHTML = `<div class="product-header" data-align="` + pHeader.align + `" style="` + (pHeader.height ? "height:" + pHeader.height + ";" : "") + (pHeader.backgroundColor ? "background-color:" + pHeader.backgroundColor + ";" : "") + (pHeader.color ? "color:" + pHeader.color + "!important;" : "") + `">
    <div class="background" style="background-image:url(`+ pHeader.background + `)"></div>
    <div class="content"><i class="main-icon" style="background-image:url(`+ pHeader.icon + `)"></i>
    <p class="productName" style="`+ (pHeader.color ? "color:" + pHeader.color + "!important;" : "") + `">` + pHeader.name + `</p><p class="productIntro"  style="` + (pHeader.color ? "color:" + pHeader.color + "!important;" : "") + `">` + checkTip(pHeader.intro, pHeader) + `</p>
    <object><div class="opes">`+ btshtml + `</div></object></div>` + pHeader.custom + `</div><div class="products-main" id="products_detail_main"></div>`;
    // 处理主要区块
    pMain = productsJson.main;
    for (bl in pMain) {
        // 生成信息
        console.log("Generating " + bl + " " + JSON.stringify(pMain[bl]));
        products_detail_main.innerHTML += `<div class="detail-block ` + pMain[bl]['class'] + ` " id="detail_block_` + bl + `_` + pMain[bl]['type'] + "_" + pMain[bl]['id'] + `" data-block-num="` + bl + `" data-block-type="` + pMain[bl]['type'] + `" data-block-selfid="` + pMain[bl]['id'] + `" data-theme="` + pMain[bl]['theme'] + `" data-margin="` + pMain[bl]['margin'] + `"></div>`;
        pMBId = `detail_block_` + bl + `_` + pMain[bl]['type'] + "_" + pMain[bl]['id'];
        attrList = pMain[bl]['attr'];
        sTipsNum = 0;
        // 根据类别进一步处理
        switch (pMain[bl]['type']) {
            case "subtitle":
                document.getElementById(pMBId).innerHTML = `<p class="h1">` + checkTip(attrList.h1, attrList) + `</p><p class="h2">` + checkTip(attrList.h2, attrList) + `</p>`;
                break;
            case "single":
                document.getElementById(pMBId).innerHTML = `<p class="word">` + checkTip(attrList.p, attrList) + `</p><img class="img" style="` + (attrList.image ? "" : "display: none;") + attrList.imgStyle + `" src="` + attrList.image + `" ondragstart="return false;" title="` + attrList.imgTitle + `" alt="` + attrList.imgTitle + `" />`;
                break;
        }
    }
}
catch (err) {
    console.error(err);
    products_detail_inner.innerHTML = "<div class='msg' data-i18n='products.noavaliable'></div>";
    changeLanguage();
}