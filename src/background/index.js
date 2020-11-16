import { runtime } from 'webextension-polyfill';

import { blockRequests, resetBlocker } from './blocker';
import { ENV } from '../config';
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

(async () => {
  try {
    await resetBlocker();
    blockRequests();

    storage.remove('videos');
  }
  catch (err) { console.assert('production' === ENV, 'index.js:27:', err); }
})();