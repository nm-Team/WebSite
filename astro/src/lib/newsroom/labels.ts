import type { NewsroomLocale } from './paths';

const labels = {
  'zh-CN': {
    title: 'nmTeam Newsroom',
    description: '在 nmTeam Newsroom 了解 nmTeam 及其产品与服务的最新新闻和资讯。',
    home: '首页', website: 'nmTeam 官网', about: '关于 nmTeam Newsroom',
    search: '搜索', searchPlaceholder: '输入关键字搜索', searchLabel: '搜索关键字',
    searching: '搜索中', noResults: '没有找到内容', searchError: '搜索内容加载失败，请重试。',
    searchPrompt: '请输入关键字。', searchNeedsJavaScript: '搜索需要启用 JavaScript。您也可以使用页脚的分类和归档浏览文章。',
    menu: 'Newsroom 菜单', skip: '跳到新闻内容', categories: '分类', archives: '归档', more: '更多',
    latest: '最新文章', tags: '标签', next: '后一页', pagination: '新闻分页',
    privacy: '隐私政策', terms: '服务协议', rights: '保留所有权利。', language: '语言',
    aboutText: 'nmTeam 新闻中心将发表关于 nmTeam 及其产品与服务的最新资讯。我们将以简体中文和英语提供这些资讯。',
  },
  en: {
    title: 'nmTeam Newsroom',
    description: 'Discover the latest news about nmTeam and its products and services in nmTeam Newsroom.',
    home: 'Home', website: 'nmTeam Website', about: 'About nmTeam Newsroom',
    search: 'Search', searchPlaceholder: 'Search Newsroom', searchLabel: 'Search keywords',
    searching: 'Searching', noResults: 'No articles found', searchError: 'Could not load search results. Please try again.',
    searchPrompt: 'Enter a search term.', searchNeedsJavaScript: 'Enable JavaScript to search. You can also browse categories and archives in the footer.',
    menu: 'Newsroom menu', skip: 'Skip to news content', categories: 'Categories', archives: 'Archives', more: 'More',
    latest: 'Latest articles', tags: 'Tags', next: 'Next', pagination: 'News pages',
    privacy: 'Privacy Policy', terms: 'Terms of Service', rights: 'All rights reserved.', language: 'Language',
    aboutText: 'nmTeam Newsroom will publish the latest information about nmTeam with its products and services. We will provide this information in English as well as simplified Chinese.',
  },
};

export const newsroomLabels = (locale: NewsroomLocale) => labels[locale];
export const newsroomLanguageName = (locale: NewsroomLocale) => locale === 'zh-CN' ? '简体中文' : 'English';
