import type { LegacyLocale } from '@/i18n/locales';

export type ProductButtonDirection = 'in' | 'out' | 'no' | 'plus';
export type ProductMediaType = 'img' | 'video' | '';
export type ProductBlockType = 'subtitle' | 'single' | 'img' | 'buttons' | 'html';

export interface ProductButton {
  id: string;
  name: string;
  javascript: string;
  href: string;
  towards: ProductButtonDirection;
  tip?: string[];
}

export interface ProductOverviewItem {
  name: string;
  icon: string;
  background: string;
  intro: string;
  href: string;
  javascript: string;
  target: '_self' | '_blank' | string;
  theme: string;
  align: string;
  length: string;
  buttons: ProductButton[];
  tip?: string[];
}

export interface ProductOverviewList {
  products: ProductOverviewItem[];
}

export interface ProductBlockAttr {
  h1?: string;
  h2?: string;
  p?: string;
  mediaType?: ProductMediaType;
  media?: string;
  mediaStyle?: string;
  mediaTitle?: string;
  specialAttr?: string;
  align?: string;
  innerHTML?: string;
  script?: string;
  buttons?: ProductButton[];
  tip?: string[];
}

export interface ProductDetailBlock {
  type: ProductBlockType;
  id: string;
  class?: string;
  theme?: string;
  style?: string;
  attr: ProductBlockAttr;
  blockItems?: ProductDetailBlock[];
}

export interface ProductDetailSection {
  id: string;
  class?: string;
  theme?: string;
  style?: string;
  blockItems: ProductDetailBlock[];
}

export interface ProductDetailFooterItem {
  icon: string;
  name: string;
  intro: string;
  button: string;
  href: string;
  javascript: string;
  type: ProductButtonDirection;
  towards: ProductButtonDirection;
}

export interface ProductDetailData {
  page: {
    productName: string;
    theme: string;
  };
  header: {
    name: string;
    slug: string;
    intro: string;
    icon: string;
    background: string;
    backgroundColor: string;
    color: string;
    height: string;
    align: string;
    buttons: ProductButton[];
    custom: string;
  };
  main: ProductDetailSection[];
  footer: ProductDetailFooterItem[];
  child?: Record<
    string,
    {
      theme: string;
      blockItems: ProductDetailBlock[];
    }
  >;
}

function describePath(path: string): string {
  return path || '<root>';
}

function assertObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${describePath(path)} must be an object.`);
  }
}

function readString(source: Record<string, unknown>, key: string, path: string, optional = false): string {
  const value = source[key];
  if (typeof value === 'string') {
    return value;
  }
  if (optional && value === undefined) {
    return '';
  }
  throw new Error(`${describePath(`${path}.${key}`)} must be a string.`);
}

function readStringArray(source: Record<string, unknown>, key: string, path: string): string[] | undefined {
  const value = source[key];
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${describePath(`${path}.${key}`)} must be an array of strings.`);
  }
  return value;
}

function readArray<T>(source: Record<string, unknown>, key: string, path: string, mapper: (value: unknown, itemPath: string) => T): T[] {
  const value = source[key];
  if (!Array.isArray(value)) {
    throw new Error(`${describePath(`${path}.${key}`)} must be an array.`);
  }
  return value.map((item, index) => mapper(item, `${path}.${key}[${index}]`));
}

function normalizeDirection(value: string, path: string): ProductButtonDirection {
  if (value === 'in' || value === 'out' || value === 'no' || value === 'plus') {
    return value;
  }
  throw new Error(`${describePath(path)} has unsupported button direction "${value}".`);
}

function parseButton(value: unknown, path: string): ProductButton {
  assertObject(value, path);
  const towards = normalizeDirection(readString(value, 'towards', path), `${path}.towards`);
  return {
    id: readString(value, 'id', path),
    name: readString(value, 'name', path),
    javascript: readString(value, 'javascript', path, true),
    href: readString(value, 'href', path, true),
    towards,
    tip: readStringArray(value, 'tip', path),
  };
}

export function parseProductOverviewList(value: unknown, context: { locale: LegacyLocale; filePath: string }): ProductOverviewList {
  assertObject(value, context.filePath);
  return {
    products: readArray(value, 'products', context.filePath, (item, path) => {
      assertObject(item, path);
      return {
        name: readString(item, 'name', path),
        icon: readString(item, 'icon', path, true),
        background: readString(item, 'background', path),
        intro: readString(item, 'intro', path),
        href: readString(item, 'href', path, true),
        javascript: readString(item, 'javascript', path, true),
        target: readString(item, 'target', path, true) || '_self',
        theme: readString(item, 'theme', path, true),
        align: readString(item, 'align', path, true),
        length: readString(item, 'length', path, true),
        buttons: readArray(item, 'buttons', path, parseButton),
        tip: readStringArray(item, 'tip', path),
      };
    }),
  };
}

function parseBlockAttr(value: unknown, path: string): ProductBlockAttr {
  assertObject(value, path);
  const mediaType = readString(value, 'mediaType', path, true);
  if (mediaType !== '' && mediaType !== 'img' && mediaType !== 'video') {
    throw new Error(`${describePath(`${path}.mediaType`)} has unsupported media type "${mediaType}".`);
  }

  return {
    h1: readString(value, 'h1', path, true),
    h2: readString(value, 'h2', path, true),
    p: readString(value, 'p', path, true),
    mediaType,
    media: readString(value, 'media', path, true),
    mediaStyle: readString(value, 'mediaStyle', path, true),
    mediaTitle: readString(value, 'mediaTitle', path, true),
    specialAttr: readString(value, 'specialAttr', path, true),
    align: readString(value, 'align', path, true),
    innerHTML: readString(value, 'innerHTML', path, true),
    script: readString(value, 'script', path, true),
    buttons: value.buttons === undefined ? undefined : readArray(value, 'buttons', path, parseButton),
    tip: readStringArray(value, 'tip', path),
  };
}

function parseBlock(value: unknown, path: string): ProductDetailBlock {
  assertObject(value, path);
  const type = readString(value, 'type', path);
  if (type !== 'subtitle' && type !== 'single' && type !== 'img' && type !== 'buttons' && type !== 'html') {
    throw new Error(`${describePath(`${path}.type`)} has unsupported block type "${type}".`);
  }

  return {
    type,
    id: readString(value, 'id', path),
    class: readString(value, 'class', path, true),
    theme: readString(value, 'theme', path, true),
    style: readString(value, 'style', path, true),
    attr: parseBlockAttr(value.attr, `${path}.attr`),
    blockItems: value.blockItems === undefined ? undefined : readArray(value, 'blockItems', path, parseBlock),
  };
}

export function parseProductDetail(value: unknown, context: { locale: LegacyLocale; slug: string; filePath: string }): ProductDetailData {
  assertObject(value, context.filePath);
  assertObject(value.page, `${context.filePath}.page`);
  assertObject(value.header, `${context.filePath}.header`);

  const childValue = value.child;
  let child: ProductDetailData['child'];
  if (childValue !== undefined) {
    assertObject(childValue, `${context.filePath}.child`);
    child = Object.fromEntries(
      Object.entries(childValue).map(([key, entry]) => {
        assertObject(entry, `${context.filePath}.child.${key}`);
        return [
          key,
          {
            theme: readString(entry, 'theme', `${context.filePath}.child.${key}`, true),
            blockItems: readArray(entry, 'blockItems', `${context.filePath}.child.${key}`, parseBlock),
          },
        ];
      }),
    );
  }

  return {
    page: {
      productName: readString(value.page, 'productName', `${context.filePath}.page`),
      theme: readString(value.page, 'theme', `${context.filePath}.page`, true),
    },
    header: {
      name: readString(value.header, 'name', `${context.filePath}.header`, true),
      slug: readString(value.header, 'slug', `${context.filePath}.header`, true),
      intro: readString(value.header, 'intro', `${context.filePath}.header`, true),
      icon: readString(value.header, 'icon', `${context.filePath}.header`, true),
      background: readString(value.header, 'background', `${context.filePath}.header`, true),
      backgroundColor: readString(value.header, 'backgroundColor', `${context.filePath}.header`, true),
      color: readString(value.header, 'color', `${context.filePath}.header`, true),
      height: readString(value.header, 'height', `${context.filePath}.header`, true),
      align: readString(value.header, 'align', `${context.filePath}.header`, true),
      buttons: readArray(value.header, 'buttons', `${context.filePath}.header`, parseButton),
      custom: readString(value.header, 'custom', `${context.filePath}.header`, true),
    },
    main: readArray(value, 'main', context.filePath, (section, path) => {
      assertObject(section, path);
      return {
        id: readString(section, 'id', path),
        class: readString(section, 'class', path, true),
        theme: readString(section, 'theme', path, true),
        style: readString(section, 'style', path, true),
        blockItems: readArray(section, 'blockItems', path, parseBlock),
      };
    }),
    footer: readArray(value, 'footer', context.filePath, (item, path) => {
      assertObject(item, path);
      const type = normalizeDirection(readString(item, 'type', path), `${path}.type`);
      const towards = normalizeDirection(readString(item, 'towards', path), `${path}.towards`);
      return {
        icon: readString(item, 'icon', path),
        name: readString(item, 'name', path),
        intro: readString(item, 'intro', path),
        button: readString(item, 'button', path),
        href: readString(item, 'href', path, true),
        javascript: readString(item, 'javascript', path, true),
        type,
        towards,
      };
    }),
    child,
  };
}
