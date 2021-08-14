import { runtime } from 'webextension-polyfill';

import { blockRequests, resetBlocker } from './blocker';
import { ENV } from '../config';
import { initContextMenus } from './context-menus';
import { listenContentScripts } from './injector';
import storage from '../storage';

runtime.onInstalled.addListener(({ reason }) => {

  switch (reason) {
    case 'install':
    case 'update':
      storage.init();
      break;
  }
});
listenContentScripts();
storage.onChanged.addListener(resetBlocker);
initContextMenus();

(async () => {
  try {
    await resetBlocker();
    blockRequests();
  }
  catch (err) {
    console.assert('production' === ENV, 'index.js:', err);
  }
})();