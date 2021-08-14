import { tabs as browserTabs, contextMenus, downloads, i18n, runtime } from 'webextension-polyfill';

import storage from '../storage';

export function initContextMenus() {

  contextMenus.create({
    documentUrlPatterns: ['https://*.facebook.com/stories/*'],
    id: 'story-downloader',
    title: i18n.getMessage('downloadStory'),
  });

  contextMenus.create({
    documentUrlPatterns: ['https://*.facebook.com/stories/*'],
    id: 'story-link',
    title: i18n.getMessage('openStory'),
  });

  contextMenus.onClicked.addListener(onClick);

  runtime.onMessage.addListener(async (message) => {

    if (message.url) {

      await downloads.download({
        saveAs: true,
        url: message.url,
      });
    }
  });
}

/**
 * @param {import('webextension-polyfill').Menus.OnClickData} info
 */
// eslint-disable-next-line no-unused-vars
async function onClick(info, tab) {
  // console.info('context-menus.js:21: ', info);

  switch (info.menuItemId) {
    case 'story-downloader':
    case 'story-link':
      await browserTabs.executeScript({ file: '/libs/common.js' });
      await browserTabs.executeScript({ file: '/content-scripts/fb-down-story.js' });
      await storage.save({ ctx: info.menuItemId });
      break;
  }
}