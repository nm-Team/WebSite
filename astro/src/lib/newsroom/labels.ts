import type { NewsroomLocale } from './paths';

const labels = {
  'zh-CN': {
    title: 'nmTeam Newsroom',
    description: '在 nmTeam Newsroom 了解 nmTeam 及其产品与服务的最新新闻和资讯。',
    search: '搜索', searchPlaceholder: '输入关键字搜索', searchLabel: '搜索关键字',
    searching: '搜索中', noResults: '没有找到内容', searchError: '搜索内容加载失败，请重试。',
    searchNeedsJavaScript: '搜索需要启用 JavaScript。您也可以使用下方的分类、标签和日期浏览文章。', dates: '日期',
    menu: 'Newsroom 菜单', categories: '分类', archives: '归档',
    latest: '最新文章', tags: '标签', next: '后一页', pagination: '新闻分页',
  },
  en: {
    title: 'nmTeam Newsroom',
    description: 'Discover the latest news about nmTeam and its products and services in nmTeam Newsroom.',
    search: 'Search', searchPlaceholder: 'Search Newsroom', searchLabel: 'Search keywords',
    searching: 'Searching', noResults: 'No articles found', searchError: 'Could not load search results. Please try again.',
    searchNeedsJavaScript: 'Enable JavaScript to search. You can also browse the categories, tags and dates below.', dates: 'Dates',
    menu: 'Newsroom menu', categories: 'Categories', archives: 'Archives',
    latest: 'Latest articles', tags: 'Tags', next: 'Next', pagination: 'News pages',
  },
};

export const newsroomLabels = (locale: NewsroomLocale) => labels[locale];
