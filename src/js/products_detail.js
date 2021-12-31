try {
    productsJson = JSON.parse(loadc("/src/json/products/" + language + "/" + getUrlParam("product") + ".json"));
    products_detail_inner.innerHTML = "";
    console.log("Get product detail JSON file. ");
    tipsNum = 0;
    totalBlockNum = 0;
    // 处理 page
    products_detail_inner.setAttribute("data-product-name", productsJson.page.productName);
    document.title = productsJson.page.productName + " " + document.title;
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
    // 处理底部信息
    pFoot = productsJson.footer;
    products_detail_main.innerHTML += `<div class="detail-footer" id="detail_footer" data-theme="` + productsJson.footer.theme + `" ></div>`;
    for (fItems in pFoot) {
        detail_footer.innerHTML += `<div class="footer-item" data-itemname="` + pFoot[fItems]['name'] + `" title="` + pFoot[fItems]['name'] + `"><svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="` + pFoot[fItems]['icon'] + `"></path></svg><p class="name">` + pFoot[fItems]['name'] + `</p><p class="intro">` + pFoot[fItems]['intro'] + `</p><a class="but"  target="` + (pFoot[fItems]['towards'] == "out" ? "_blank" : "_self") + `" ` + (pFoot[fItems]['javascript'] ? ` href="javascript:" onclick="` + pFoot[fItems]['javascript'] + `" ondragstart="return false;" ` : `href="` + pFoot[fItems]['href'] + `"`) + `>` + pFoot[fItems]['button'] + svgList[pFoot[fItems]['type']] + `</a></div>`;
    }
}
catch (err) {
    console.error(err);
    products_detail_inner.innerHTML = "<div class='msg' data-i18n='products.noavaliable'></div>";
    document.title = "Product Not Found " + document.title;
    changeLanguage();
}

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

function openChild(childName) {
    new_element = document.createElement("div");
    new_element.setAttribute("id", "detail_child_" + childName);
    new_element.setAttribute("class", "products-page detail-childframe " + productsJson.child[childName]['theme']);
    new_element.setAttribute("data-theme", productsJson.child[childName]['theme']);
    new_element.innerHTML = `<button class="closeButton" title="关闭" onclick="document.getElementById('` + "detail_child_" + childName + `').outerHTML='';document.body.style.overflow='auto';"><svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M544.448 499.2l284.576-284.576a32 32 0 0 0-45.248-45.248L499.2 453.952 214.624 169.376a32 32 0 0 0-45.248 45.248l284.576 284.576-284.576 284.576a32 32 0 0 0 45.248 45.248l284.576-284.576 284.576 284.576a31.904 31.904 0 0 0 45.248 0 32 32 0 0 0 0-45.248L544.448 499.2z"></path></svg></button><div id="` + "detail_child_" + productsJson.child[childName]['id'] + `_childContent"></div>`;
    document.getElementById("products_child_inner").appendChild(new_element);
    document.getElementById("detail_child_" + childName).getElementsByClassName("closeButton")[0].focus();
    document.body.style.overflow = "hidden";
    generateBlock("detail_child_" + childName, productsJson.child[childName]['blockItems']);
}

function generateBlock(pMBId, blockJson) {
    for (bl in blockJson) {
        // 生成信息
        console.log("Generating " + totalBlockNum + " " + JSON.stringify(blockJson[bl]));
        document.getElementById(pMBId).innerHTML += `<div class="detail-block ` + blockJson[bl]['class'] + ` " id="detail_block_` + totalBlockNum + `_` + blockJson[bl]['type'] + "_" + blockJson[bl]['id'] + `" data-block-num="` + totalBlockNum + `" data-block-type="` + blockJson[bl]['type'] + `" data-block-selfid="` + blockJson[bl]['id'] + `" data-theme="` + blockJson[bl]['theme'] + `" style="` + blockJson[bl]['style'] + `"></div>`;
        bLId = `detail_block_` + totalBlockNum + `_` + blockJson[bl]['type'] + "_" + blockJson[bl]['id'];
        attrList = blockJson[bl]['attr'];
        sTipsNum = 0;
        // 根据类别进一步处理
        switch (blockJson[bl]['type']) {
            case "subtitle":
                document.getElementById(bLId).innerHTML = `<p class="h1">` + checkTip(attrList.h1, attrList) + `</p><p class="h2">` + checkTip(attrList.h2, attrList) + `</p>`;
                break;
            case "single":
                document.getElementById(bLId).innerHTML = `<div class="singleMain"><p class="word">` + checkTip(attrList.p, attrList) + `</p>` + (attrList.mediaType == "img" ? `<img class="img" style="` + attrList.mediaStyle + `" ` + attrList.specialAttr + ` src="` + attrList.media + `" ondragstart="return false;" title="` + attrList.mediaTitle + `" alt="` + attrList.mediaTitle + `" />` : (attrList.mediaType == "video" ? `<video class="img" style="` + attrList.mediaStyle + `" ` + attrList.specialAttr + ` src="` + attrList.media + `" ondragstart="return false;" autoplay="autoplay" muted="muted" controls="false" controlslist="nodownload" title="` + attrList.mediaTitle + `" alt="` + attrList.mediaTitle + `" ></video>` : "")) + `</div>`;
                break;
            case "img":
                document.getElementById(bLId).innerHTML = `` + (attrList.mediaType == "img" ? `<img class="img" style="` + attrList.mediaStyle + `" ` + attrList.specialAttr + ` src="` + attrList.media + `" ondragstart="return false;" title="` + attrList.mediaTitle + `" alt="` + attrList.mediaTitle + `" />` : (attrList.mediaType == "video" ? `<video class="img" style="` + attrList.mediaStyle + `" ` + attrList.specialAttr + ` src="` + attrList.media + `" ondragstart="return false;" autoplay="autoplay" muted="muted" controls="false" controlslist="nodownload" title="` + attrList.mediaTitle + `" alt="` + attrList.mediaTitle + `" ></video>` : "")) + `<p>` + checkTip(attrList.p, attrList) + `</p>`;
                break;
            case "buttons":
                document.getElementById(bLId).innerHTML = `<object class="opes">` + setButton(attrList.buttons) + `</object>`;
                break;
            default:
                cacheHTML = document.createElement("div");
                cacheHTML.innerHTML = attrList.innerHTML;
                document.getElementById(bLId).appendChild(cacheHTML);
        }
        if (attrList.script) {
            scriptBox = document.createElement("script");
            scriptBox.innerHTML = attrList.script;
            document.body.appendChild(scriptBox);
        }
        totalBlockNum++;
        if (blockJson[bl]['blockItems']) generateBlock(bLId, blockJson[bl]['blockItems']);
    }
}
