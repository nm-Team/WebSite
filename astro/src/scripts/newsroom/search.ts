import { newsroomLabels } from '@/lib/newsroom/labels';
import { isNewsroomLocale, newsroomPath } from '@/lib/newsroom/paths';
import { parseSearchPosts, searchNewsPosts, type SearchPost } from '@/lib/newsroom/search';

const root = document.querySelector<HTMLElement>('#newsroom-search');
const locale = root?.dataset.locale;
if (root && isNewsroomLocale(locale)) {
  const labels = newsroomLabels(locale);
  const input = root.querySelector<HTMLInputElement>('input[name="q"]');
  const form = root.querySelector('form');
  const results = root.querySelector<HTMLElement>('#search-results');
  const title = root.querySelector<HTMLElement>('#search-title');
  let posts: SearchPost[] | undefined;
  let requestId = 0;

  const message = (value: string) => {
    const element = document.createElement('p');
    element.className = 'not-found';
    element.textContent = value;
    results?.replaceChildren(element);
  };
  const createCard = (post: SearchPost) => {
    const card = document.createElement('a');
    card.className = 'post item';
    card.href = post.url;
    const image = document.createElement('div');
    image.className = 'image';
    image.style.backgroundImage = `url(${JSON.stringify(post.image)})`;
    const info = document.createElement('div');
    info.className = 'info';
    const category = document.createElement('div');
    category.className = 'category';
    category.textContent = post.category;
    const heading = document.createElement('h2');
    heading.className = 'post-title';
    heading.textContent = post.title;
    const time = document.createElement('time');
    time.dateTime = post.dateTime;
    time.textContent = post.dateText;
    info.append(category, heading, time);
    card.append(image, info);
    return card;
  };

  async function applySearch(query: string) {
    const id = ++requestId;
    if (!results || !title || !isNewsroomLocale(locale)) return;
    title.textContent = query.trim() ? `${labels.search}: ${query}` : labels.search;
    if (!query.trim()) { message(labels.searchPrompt); return; }
    message(labels.searching);
    try {
      if (!posts) {
        const response = await fetch(newsroomPath(locale, 'search-data.json'));
        if (!response.ok) throw new Error(`Newsroom search request failed: HTTP ${response.status}`);
        posts = parseSearchPosts(await response.json(), newsroomPath(locale));
      }
      if (id !== requestId) return;
      const matches = searchNewsPosts(posts, query);
      if (matches.length) results.replaceChildren(...matches.map(createCard));
      else message(labels.noResults);
    } catch (error) {
      console.error('Unable to search Newsroom', error);
      if (id === requestId) message(labels.searchError);
    }
  }

  const initial = new URLSearchParams(window.location.search).get('q') ?? '';
  if (input) input.value = initial;
  void applySearch(initial);
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input?.value ?? '';
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);
    void applySearch(query);
  });
}
