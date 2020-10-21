import 'content-scripts-register-polyfill';
import { contentScripts, runtime, tabs as browserTabs } from 'webextension-polyfill';

import { ENV } from '../config';
import storage from '../storage';

let scriptStopNextVideo = null;
let scriptRemoveAnnoyances = null;

async function reloadTabs() {

  const tabs = await browserTabs.query({
    currentWindow: true,
    url: 'https://*.facebook.com/*',
  });

  for (let i = tabs.length; --i >= 0;)
    browserTabs.reload(tabs[i].id);
}

async function stopNextVideo(reload = false) {

  try {
    const { stop_up_next_video } = await storage.get('stop_up_next_video');

    scriptStopNextVideo && scriptStopNextVideo.unregister();

    if (stop_up_next_video) {

      scriptStopNextVideo = await contentScripts.register({
        matches: ['https://*.facebook.com/*'],
        js: [
          { file: '/libs/common.js' },
          { file: '/content-scripts/fb-stop-next-video.js' }
        ],
        runAt: 'document_idle',
      });
    }

    if (reload) {
      reloadTabs();
    }
  }
  catch (err) { console.assert('production' === ENV, err); }
}

async function removeAnnoyances(immediate = false) {

  try {
    const settings = await storage.get(['remove_sponsored_ad', 'remove_suggested_for_u', 'remove_people_u_may_know']);

    // scriptRemoveAnnoyances && scriptRemoveAnnoyances.unregister();

    scriptRemoveAnnoyances = await contentScripts.register({
      matches: ['https://*.facebook.com/*'],
      js: [
        { file: '/libs/common.js' },
        { file: '/content-scripts/fb-remove-annoyances.js' }
      ],
      runAt: 'document_idle',
    });

    runtime.onConnect.addListener((port) => {

      console.info('injector.js:65: ', port.name);
      port.postMessage(settings);
    });

    if (immediate) {

    }
    // if (reload) {
    //   reloadTabs();
    // }
  }
  catch (err) { console.assert('production' === ENV, err); }
}

export {
  removeAnnoyances,
  stopNextVideo
}