$('.tabs__list button').on('click', function () {
  const tabId = $(this).attr('data-tab');
  if (typeof tabId !== 'string') {
    return;
  }

  focusTab($(this).closest('.tabs'), tabId);
});

function focusTab($tabs, tabId) {
  $tabs.find('*').attr('data-status', '');
  $tabs.find(`[data-tab="${CSS.escape(tabId)}"]`).attr('data-status', 'focus');
}
