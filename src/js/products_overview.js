try {
    productsJson = JSON.parse(loadc("/src/json/products/" + language + "/overview_list.json")).products;
    products_overview_inner.innerHTML = "";
    console.log("Get products JSON file. ");
    tipsNum = 0;
    if (productsJson.length == 0) {
        products_overview_inner.innerHTML = "<div class='msg' data-i18n='products.noresult'>" + "</div>";
        
    }
    for (i in productsJson) {
        sTipsNum = 0;
        // 处理按钮
        btshtml = setButton(productsJson[i]['buttons']);
        products_overview_inner.innerHTML += `<a target="` + productsJson[i]['target'] + `" class="box ` + productsJson[i]['theme'] + ` ` + productsJson[i]['align'] + ` x` + productsJson[i]['length'] + `" ` + (productsJson[i]['javascript'] ? `onclick="` + productsJson[i]['javascript'] + `"` : `href="` + productsJson[i]['href'] + `"`) + `>
     <div class="background" style="background-image: url('`+ productsJson[i]['background'] + `');"></div>
     <div class="content">
         <h2 class="content-title">`+ (productsJson[i]['icon'] ? `<i style="background-image: url('` + productsJson[i]['icon'] + `')"></i>` : "") + `` + checkTip(productsJson[i]['name'], productsJson[i]) + `</h2> <p class="intro">` + checkTip(productsJson[i]['intro'], productsJson[i]) + `</p> <object class="opes">` + btshtml + `</object>
     </div></a>
`;
    }
}
catch (err) {
    products_overview_inner.innerHTML = "<div class='msg'>:(<br><br>" + productI18n.error + "</div>";
}