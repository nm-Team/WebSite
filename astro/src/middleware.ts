import { defineMiddleware } from 'astro:middleware';

function isRetiredQuestionnairePath(pathname: string): boolean {
  return pathname === '/blackboard/questionnaire' || pathname.startsWith('/blackboard/questionnaire/');
}

function isRetiredSupportSearchPath(pathname: string): boolean {
  return pathname === '/blackboard/support_doc_search/search.php';
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (isRetiredQuestionnairePath(pathname) || isRetiredSupportSearchPath(pathname)) {
    return context.redirect('/questionnaire-ended/', 302);
  }

  return next();
});
