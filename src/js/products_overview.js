svgList = {
    "in": `<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path></svg>`,
    "out": `<svg class="svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path><path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path><path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path></svg>`,
    "no": ""
}

try {
    productsJson = JSON.parse(loadc("/src/json/products_overview_list_" + language + ".json")).products;
    products_overview_inner.innerHTML = "";
}
catch (err) {
    products_overview_inner.innerHTML = "<div class='msg'>An error occured :(</div>";
}
console.log("Get products JSON file. ");
for (i in productsJson) {
    // 处理按钮
    btshtml = '';
    for (j in productsJson[i]['buttons']) {
        btshtml += `<a data-button-id="` + productsJson[i]['buttons'][j]['id'] + `" data-button-type="` + productsJson[i]['buttons'][j]['cursor'] + `" ` + (productsJson[i]['buttons'][j]['javascript'] ? ` href="javascript:" onclick="` + productsJson[i]['buttons'][j]['javascript'] + `" ondragstart="return false;" ` : `href="` + productsJson[i]['buttons'][j]['href'] + `"`) + ` title="` + productsJson[i]['buttons'][j]['name'] + `"><span>` + productsJson[i]['buttons'][j]['name'] + `</span>` + svgList[productsJson[i]['buttons'][j]['cursor']] + `</a>`;
    }
    products_overview_inner.innerHTML += `<a class="box ` + productsJson[i]['theme'] + ` x` + productsJson[i]['length'] + `" ` + (productsJson[i]['javascript'] ? `onclick="` + productsJson[i]['javascript'] + `"` : `href="` + productsJson[i]['href'] + `"`) + `>
     <div class="background" style="background-image: url('`+ productsJson[i]['background'] + `');"></div>
     <div class="content">
         <h2 class="content-title">`+ (productsJson[i]['icon'] ? `<i style="background-image: url('` + productsJson[i]['icon'] + `')"></i>` : "") + `` + productsJson[i]['name'] + `</h2> <p class="intro">` + productsJson[i]['intro'] + `</p> <object class="opes">` + btshtml + `</object>
     </div></a>
`
}