import type {
  ProductBlockAttr,
  ProductButton,
  ProductDetailBlock,
  ProductDetailData,
  ProductDetailFooterItem,
  ProductDetailSection,
  ProductOverviewItem,
} from './schema';

export interface RenderedProductDetail {
  headerHtml: string;
  mainHtml: string;
  childHtml: string;
  footnotesHtml: string;
  scriptsHtml: string;
}

type HrefTransformer = (href: string) => string;

const identityHref: HrefTransformer = (href) => href;

const svgList = {
  in: '<svg class="svg" aria-label="target in" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M761.056 532.128c0.512-0.992 1.344-1.824 1.792-2.848 8.8-18.304 5.92-40.704-9.664-55.424L399.936 139.744c-19.264-18.208-49.632-17.344-67.872 1.888-18.208 19.264-17.376 49.632 1.888 67.872l316.96 299.84-315.712 304.288c-19.072 18.4-19.648 48.768-1.248 67.872 9.408 9.792 21.984 14.688 34.56 14.688 12 0 24-4.48 33.312-13.44l350.048-337.376c0.672-0.672 0.928-1.6 1.6-2.304 0.512-0.48 1.056-0.832 1.568-1.344C757.76 538.88 759.2 535.392 761.056 532.128z" p-id="2301"></path></svg>',
  out: '<svg class="svg" aria-label="target out" style="transform:scale(0.81)" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M924.402464 1023.068211H0.679665V99.345412h461.861399v98.909208H99.596867v725.896389h725.896389V561.206811h98.909208z" p-id="3093"></path><path d="M930.805104 22.977336l69.965436 69.965436-453.492405 453.492404-69.965435-69.901489z" p-id="3094"></path><path d="M1022.464381 304.030081h-98.917201V99.345412H709.230573V0.428211h313.233808z"></path></svg>',
  no: '',
  plus: '<svg class="svg" aria-label="target detail" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M474 152m8 0l60 0q8 0 8 8l0 704q0 8-8 8l-60 0q-8 0-8-8l0-704q0-8 8-8Z" p-id="1258"></path><path d="M168 474m8 0l672 0q8 0 8 8l0 60q0 8-8 8l-672 0q-8 0-8-8l0-60q0-8 8-8Z"></path></svg>',
} as const;

const chinesePunctuation = '，。；：？';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

function reviewLegacyHtml(value: string, context: string): string {
  const lower = value.toLowerCase();
  const forbiddenPatterns = [
    /<\s*script\b/,
    /<\s*iframe\b/,
    /<\s*object\b/,
    /<\s*embed\b/,
    /\son[a-z]+\s*=/,
    /javascript\s*:/,
  ];
  const blocked = forbiddenPatterns.find((pattern) => pattern.test(lower));
  if (blocked) {
    throw new Error(`Legacy HTML review rejected ${context}: matched ${blocked.toString()}.`);
  }
  return value;
}

function reviewLegacyScript(value: string, context: string): string {
  if (!value) {
    return '';
  }
  if (/<\/?\s*script\b/i.test(value)) {
    throw new Error(`Legacy script review rejected ${context}: script tags are not allowed inside JSON script fields.`);
  }
  return value;
}

interface TipState {
  total: number;
  footnotes: string[];
}

function withTips(value: string | undefined, source: { tip?: string[] }, state: TipState, context: string): string {
  if (!value) {
    return '';
  }
  let tipIndex = 0;
  let output = reviewLegacyHtml(value, context).replace(/\[tip\]/g, () => {
    state.total += 1;
    const note = source.tip?.[tipIndex] ?? '';
    tipIndex += 1;
    const footnoteId = `products_footer_explain_${state.total}`;
    state.footnotes.push(`<p id="${footnoteId}"><b>${state.total}. </b>${reviewLegacyHtml(note, `${context}.tip[${tipIndex - 1}]`)}</p>`);
    return `<object><a class="tip" href="#${footnoteId}" target="_self" title="target turn to note">${state.total}</a></object>`;
  });

  const last = output.at(-1);
  if (last && chinesePunctuation.includes(last)) {
    output = `${output.slice(0, -1)}<bs>${last}</bs>`;
  }
  return output;
}

export function renderProductButton(button: ProductButton, state?: TipState, transformHref: HrefTransformer = identityHref): string {
  const target = button.towards === 'out' ? '_blank' : '_self';
  const behavior = button.javascript
    ? `href="javascript:" onclick="${escapeAttribute(button.javascript)}" ondragstart="return false;"`
    : `href="${escapeAttribute(transformHref(button.href))}"`;
  const label = state ? withTips(button.name, button, state, `button.${button.id}.name`) : escapeHtml(button.name);
  return `<a data-button-id="${escapeAttribute(button.id)}" data-button-type="${button.towards}" target="${target}" ${behavior} title="${escapeAttribute(button.name.replace(/\[tip\]/g, ''))}"><span>${label}</span>${svgList[button.towards]}</a>`;
}

export function renderProductOverviewCard(product: ProductOverviewItem, transformHref: HrefTransformer = identityHref): string {
  const behavior = product.javascript ? `onclick="${escapeAttribute(product.javascript)}"` : `href="${escapeAttribute(transformHref(product.href))}"`;
  const icon = product.icon ? `<i style="background-image: url('${escapeAttribute(product.icon)}')"></i>` : '';
  const buttons = product.buttons.map((button) => renderProductButton(button, undefined, transformHref)).join('');
  return `<a target="${escapeAttribute(product.target)}" class="box ${escapeAttribute(product.theme)} ${escapeAttribute(product.align)} x${escapeAttribute(product.length)}" ${behavior}>
     <div class="background" style="background-image: url('${escapeAttribute(product.background)}');"></div>
     <div class="content">
         <h2 class="content-title">${icon}${escapeHtml(product.name)}</h2> <p class="intro">${escapeHtml(product.intro)}</p> <object class="opes">${buttons}</object>
     </div></a>`;
}

function renderMedia(attr: ProductBlockAttr): string {
  const specialAttr = attr.specialAttr ? ` ${attr.specialAttr}` : '';
  if (attr.mediaType === 'img') {
    return `<img class="img" style="${escapeAttribute(attr.mediaStyle ?? '')}"${specialAttr} src="${escapeAttribute(attr.media ?? '')}" ondragstart="return false;" title="${escapeAttribute(attr.mediaTitle ?? '')}" alt="${escapeAttribute(attr.mediaTitle ?? '')}" aria-label="${escapeAttribute(attr.mediaTitle ?? '')}" />`;
  }
  if (attr.mediaType === 'video') {
    return `<video class="img" style="${escapeAttribute(attr.mediaStyle ?? '')}"${specialAttr} src="${escapeAttribute(attr.media ?? '')}" ondragstart="return false;" autoplay="autoplay" muted="muted" controls="false" controlslist="nodownload" title="${escapeAttribute(attr.mediaTitle ?? '')}" alt="${escapeAttribute(attr.mediaTitle ?? '')}" aria-label="${escapeAttribute(attr.mediaTitle ?? '')}"></video>`;
  }
  return '';
}

function renderBlock(block: ProductDetailBlock, state: TipState, scripts: string[], index: { value: number }, transformHref: HrefTransformer): string {
  const blockNumber = index.value;
  const blockId = `detail_block_${blockNumber}_${block.type}_${block.id}`;
  index.value += 1;

  let innerHtml = '';
  switch (block.type) {
  case 'subtitle':
    innerHtml = `<p class="h1">${withTips(block.attr.h1, block.attr, state, `${block.id}.h1`)}</p><p class="h2">${withTips(block.attr.h2, block.attr, state, `${block.id}.h2`)}</p>`;
    break;
  case 'single':
    innerHtml = `<div class="singleMain ${block.attr.mediaType ? '' : 'nomedia'}"><p class="word">${withTips(block.attr.p, block.attr, state, `${block.id}.p`)}</p>${renderMedia(block.attr)}</div>`;
    break;
  case 'img':
    innerHtml = `${renderMedia(block.attr)}<p>${withTips(block.attr.p, block.attr, state, `${block.id}.p`)}</p>`;
    break;
  case 'buttons':
    innerHtml = `<object class="opes">${(block.attr.buttons ?? []).map((button) => renderProductButton(button, state, transformHref)).join('')}</object>`;
    break;
  case 'html':
    innerHtml = `<div>${reviewLegacyHtml(block.attr.innerHTML ?? '', `${block.id}.innerHTML`)}</div>`;
    break;
  }

  if (block.attr.script) {
    scripts.push(reviewLegacyScript(block.attr.script, `${block.id}.script`));
  }

  const children = block.blockItems?.map((child) => renderBlock(child, state, scripts, index, transformHref)).join('') ?? '';
  return `<div class="detail-block ${escapeAttribute(block.class ?? '')} " id="${escapeAttribute(blockId)}" data-block-num="${blockNumber}" data-block-type="${block.type}" data-block-selfid="${escapeAttribute(block.id)}" data-theme="${escapeAttribute(block.theme ?? '')}" style="${escapeAttribute(block.style ?? '')}">${innerHtml}${children}</div>`;
}

function renderSection(section: ProductDetailSection, sectionIndex: number, state: TipState, scripts: string[], blockIndex: { value: number }, transformHref: HrefTransformer): string {
  const blocks = section.blockItems.map((block) => renderBlock(block, state, scripts, blockIndex, transformHref)).join('');
  return `<div class="detail-blocks ${escapeAttribute(section.class ?? '')}" style="${escapeAttribute(section.style ?? '')}" id="detail_blocks_${sectionIndex}" data-blocks-num="${sectionIndex}" data-blocks-selfid="${escapeAttribute(section.id)}" data-theme="${escapeAttribute(section.theme ?? '')}">${blocks}</div>`;
}

function renderFooterItem(item: ProductDetailFooterItem, transformHref: HrefTransformer): string {
  const target = item.towards === 'out' ? '_blank' : '_self';
  const behavior = item.javascript
    ? `href="javascript:" onclick="${escapeAttribute(item.javascript)}" ondragstart="return false;"`
    : `href="${escapeAttribute(transformHref(item.href))}"`;
  return `<div class="footer-item" data-itemname="${escapeAttribute(item.name)}" title="${escapeAttribute(item.name)}" aria-label="${escapeAttribute(item.name)}"><svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="${escapeAttribute(item.icon)}"></path></svg><p class="name">${escapeHtml(item.name)}</p><p class="intro">${escapeHtml(item.intro)}</p><a class="but" target="${target}" ${behavior}>${escapeHtml(item.button)}${svgList[item.type]}</a></div>`;
}

export function renderProductDetail(data: ProductDetailData, transformHref: HrefTransformer = identityHref): RenderedProductDetail {
  const state: TipState = { total: 0, footnotes: [] };
  const scripts: string[] = [];
  const blockIndex = { value: 0 };
  const header = data.header;
  const headerButtons = header.buttons.map((button) => renderProductButton(button, state, transformHref)).join('');
  const headerStyle = `${header.height ? `height:${header.height};` : ''}${header.backgroundColor ? `background-color:${header.backgroundColor};` : ''}${header.color ? `color:${header.color}!important;` : ''}`;
  const headerColorStyle = header.color ? `color:${header.color}!important;` : '';
  const headerHtml = `<div class="product-header" data-align="${escapeAttribute(header.align)}" style="${escapeAttribute(headerStyle)}">
    <div class="background" style="background-image:url(${escapeAttribute(header.background)})"></div>
    <div class="content"><i class="main-icon" style="background-image:url(${escapeAttribute(header.icon)})"></i>
    <p class="productName" style="${escapeAttribute(headerColorStyle)}">${withTips(header.name, {}, state, 'header.name')}</p><p class="productSlug" style="${escapeAttribute(headerColorStyle)}">${withTips(header.slug, {}, state, 'header.slug')}</p><p class="productIntro" style="${escapeAttribute(headerColorStyle)}">${withTips(header.intro, {}, state, 'header.intro')}</p>
    <object><div class="opes">${headerButtons}</div></object></div>${reviewLegacyHtml(header.custom, 'header.custom')}</div><div class="products-main" id="products_detail_main">`;

  const mainSections = data.main.map((section, index) => renderSection(section, index, state, scripts, blockIndex, transformHref)).join('');
  const footerHtml = `<div class="detail-footer" id="detail_footer" data-theme="${escapeAttribute((data.footer as unknown as { theme?: string }).theme ?? '')}">${data.footer.map((item) => renderFooterItem(item, transformHref)).join('')}</div></div>`;
  const childEntries = Object.entries(data.child ?? {}).map(([childName, child]) => {
    const childIndex = { value: blockIndex.value };
    const childHtml = child.blockItems.map((block) => renderBlock(block, state, scripts, childIndex, transformHref)).join('');
    blockIndex.value = childIndex.value;
    return [childName, { theme: child.theme, staticHtml: childHtml }];
  });
  const childHtml = `<script type="application/json" id="products_child_data">${escapeHtml(JSON.stringify(Object.fromEntries(childEntries)))}</script>`;
  const scriptsHtml = [
    ...scripts,
    `function openChild(childName) {
      const childData = JSON.parse(document.getElementById('products_child_data').textContent || '{}');
      const child = childData[childName];
      if (!child) return;
      const newElement = document.createElement('div');
      newElement.setAttribute('id', 'detail_child_' + childName);
      newElement.setAttribute('class', 'products-page detail-childframe ' + (child.theme || ''));
      newElement.setAttribute('data-theme', child.theme || '');
      newElement.innerHTML = '<button class="closeButton" title="关闭" onclick="document.getElementById(\\'detail_child_' + childName + '\\').outerHTML=\\'\\';document.body.style.overflow=\\'auto\\';"><svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M544.448 499.2l284.576-284.576a32 32 0 0 0-45.248-45.248L499.2 453.952 214.624 169.376a32 32 0 0 0-45.248 45.248l284.576 284.576-284.576 284.576a32 32 0 0 0 45.248 45.248l284.576-284.576 284.576 284.576a31.904 31.904 0 0 0 45.248 0 32 32 0 0 0 0-45.248L544.448 499.2z"></path></svg></button><div class="detail-child-static">' + (child.staticHtml || '') + '</div>';
      document.getElementById('products_child_inner').appendChild(newElement);
      newElement.getElementsByClassName('closeButton')[0].focus();
      document.body.style.overflow = 'hidden';
    }`,
  ].join('\n');

  return {
    headerHtml,
    mainHtml: mainSections + footerHtml,
    childHtml,
    footnotesHtml: state.footnotes.join(''),
    scriptsHtml,
  };
}
