$('.tabs__list button').on('click', function () {
  const tabId = $(this).attr('data-tab');
  if (typeof tabId !== 'string') {
    return;
  }

  focusTab($(this).closest('.tabs'), tabId);
});

function syncTabAccessibility(tabs, tabId) {
  const tabList = tabs.querySelector('.tabs__list');
  const buttons = tabs.querySelectorAll('.tabs__list button[data-tab]');
  const panels = tabs.querySelectorAll('.tabs__panels [data-tab]');
  const tabPrefix = tabs.id || 'tabs';

  if (tabList) tabList.setAttribute('role', 'tablist');

  buttons.forEach((button) => {
    const id = `${tabPrefix}-tab-${button.getAttribute('data-tab')}`;
    const selected = button.getAttribute('data-tab') === tabId;
    button.id = id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${tabPrefix}-panel-${button.getAttribute('data-tab')}`);
    button.setAttribute('aria-selected', selected ? 'true' : 'false');
    button.setAttribute('tabindex', selected ? '0' : '-1');
  });

  panels.forEach((panel) => {
    const panelTabId = panel.getAttribute('data-tab');
    const selected = panelTabId === tabId;
    panel.id = `${tabPrefix}-panel-${panelTabId}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${tabPrefix}-tab-${panelTabId}`);
    panel.toggleAttribute('hidden', !selected);
  });
}

function focusTab($tabs, tabId) {
  $tabs.find('*').attr('data-status', '');
  $tabs.find(`[data-tab="${CSS.escape(tabId)}"]`).attr('data-status', 'focus');
  syncTabAccessibility($tabs[0], tabId);
}

$('.tabs').each(function () {
  const $tabs = $(this);
  const tabId = $tabs.find('.tabs__list button[data-tab][data-status="focus"]').first().attr('data-tab')
    || $tabs.find('.tabs__list button[data-tab]').first().attr('data-tab');
  if (typeof tabId === 'string') syncTabAccessibility(this, tabId);
});
