// try {
productsJson = JSON.parse(loadc("/src/json/products/" + getUrlParam("product") + "_" + language + ".json"));
products_detail_inner.innerHTML = "";
console.log("Get product detail JSON file. ");
tipsNum = 0;
totalBlockNum = 0;
// 处理 page
products_detail_inner.setAttribute("data-product-name", productsJson.page.productName);
document.title = productsJson.page.productName +" "+ document.title;
products_detail_inner.setAttribute("data-theme", productsJson.page.theme);
products_detail_inner.className += " " + productsJson.page.theme + " ";
// 处理 header 
pHeader = productsJson.header;
sTipsNum = 0;
btshtml = setButton(pHeader.buttons);
products_detail_inner.innerHTML = `<div class="product-header" data-align="` + pHeader.align + `" style="` + (pHeader.height ? "height:" + pHeader.height + ";" : "") + (pHeader.backgroundColor ? "background-color:" + pHeader.backgroundColor + ";" : "") + (pHeader.color ? "color:" + pHeader.color + "!important;" : "") + `">
    <div class="background" style="background-image:url(`+ pHeader.background + `)"></div>
    <div class="content"><i class="main-icon" style="background-image:url(`+ pHeader.icon + `)"></i>
    <p class="productName" style="`+ (pHeader.color ? "color:" + pHeader.color + "!important;" : "") + `">` + pHeader.name + `</p><p class="productSlug"  style="` + (pHeader.color ? "color:" + pHeader.color + "!important;" : "") + `">` + checkTip(pHeader.slug, pHeader) + `</p><p class="productIntro"  style="` + (pHeader.color ? "color:" + pHeader.color + "!important;" : "") + `">` + checkTip(pHeader.intro, pHeader) + `</p>
    <object><div class="opes">`+ btshtml + `</div></object></div>` + pHeader.custom + `</div><div class="products-main" id="products_detail_main"></div>`;
// 处理主要区块
pBSMain = productsJson.main;
for (bls in pBSMain) {
    products_detail_main.innerHTML += `<div class="detail-blocks" id="detail_blocks_` + bls + `" data-blocks-num="` + bls + `" data-blocks-selfid="` + pBSMain[bls]['id'] + `" data-theme="` + pBSMain[bls]['theme'] + `" ></div>`;
    pMBSId = `detail_blocks_` + bls;
    pMain = pBSMain[bls].blockItems;
    generateBlock(pMBSId, pMain);
}
// }
// catch (err) {
// console.error(err);
// products_detail_inner.innerHTML = "<div class='msg' data-i18n='products.noavaliable'></div>";
// changeLanguage();
// }

// 定时操作
setInterval(() => {
    // 标题下的图片block在电脑上向上移动
    for (imgAfterTitle in $('.detail-block[data-block-type="subtitle"]')) {
        try {
            if ($('.detail-block[data-block-type="subtitle"]')[imgAfterTitle].nextElementSibling.getAttribute("data-block-type") == "single")
                $('.detail-block[data-block-type="subtitle"]')[imgAfterTitle].nextElementSibling.getElementsByClassName("img")[0].style.marginTop = "-" + window.getComputedStyle($('.detail-block[data-block-type="subtitle"]')[imgAfterTitle]).height;
        } catch (err) { }
    }
}, 10);

function generateBlock(pMBId, blockJson) {
    for (bl in blockJson) {
        // 生成信息
        console.log("Generating " + totalBlockNum + " " + JSON.stringify(blockJson[bl]));
        document.getElementById(pMBId).innerHTML += `<div class="detail-block ` + blockJson[bl]['class'] + ` " id="detail_block_` + totalBlockNum + `_` + blockJson[bl]['type'] + "_" + blockJson[bl]['id'] + `" data-block-num="` + totalBlockNum + `" data-block-type="` + blockJson[bl]['type'] + `" data-block-selfid="` + blockJson[bl]['id'] + `" data-theme="` + blockJson[bl]['theme'] + `"></div>`;
        bLId = `detail_block_` + totalBlockNum + `_` + blockJson[bl]['type'] + "_" + blockJson[bl]['id'];
        attrList = blockJson[bl]['attr'];
        sTipsNum = 0;
        // 根据类别进一步处理
        switch (blockJson[bl]['type']) {
            case "subtitle":
                document.getElementById(bLId).innerHTML = `<p class="h1">` + checkTip(attrList.h1, attrList) + `</p><p class="h2">` + checkTip(attrList.h2, attrList) + `</p>`;
                break;
            case "single":
                document.getElementById(bLId).innerHTML = `<div class="singleMain"><p class="word">` + checkTip(attrList.p, attrList) + `</p>` + (attrList.mediaType == "img" ? `<img class="img" style="` + attrList.mediaStyle + `" src="` + attrList.media + `" ondragstart="return false;" title="` + attrList.mediaTitle + `" alt="` + attrList.mediaTitle + `" />` : (attrList.mediaType == "video" ? `<video class="img" style=""` + attrList.mediaStyle + `" src="` + attrList.media + `" ondragstart="return false;" autoplay="autoplay" muted="muted" controls="false" controlslist="nodownload" title="` + attrList.mediaTitle + `" alt="` + attrList.mediaTitle + `" ></video>` : ""))+`</div>`;
                break;
            case "buttons":
                document.getElementById(bLId).innerHTML = `<object class="opes">` + setButton(attrList.buttons) + `</object>`;
                break;
            default:
                document.getElementById(bLId).innerHTML = attrList.innerHTML;
        }
        totalBlockNum++;
        if (blockJson[bl]['blockItems']) generateBlock(bLId, blockJson[bl]['blockItems']);
    }
}
