import { tabs as browserTabs, runtime } from 'webextension-polyfill';
import debounce from 'lodash/debounce';

import { ENV } from '../config';
import storage from '../storage';

let timer = null;
const port = {
  removeAnnoyances: null,
  removeTrackingParams: null,
  stopNextVideo: null,
};
const insertedCss = new Map();

function listenContentScripts() {

  runtime.onConnect.addListener(onConnect);
  storage.onChanged.addListener(onChanged);
  browserTabs.onUpdated.addListener(debounce(onTabsUpdated, 300));
}

async function onConnect(_port) {

  switch (_port.name) {
    case 'fb-stop-next-video':
      try {
        port.stopNextVideo = _port;
        const { stop_up_next_video } = await storage.get('stop_up_next_video');

        _port.postMessage({ stop: stop_up_next_video });
      }
      catch (err) {
        console.assert('production' === ENV, err);
      }
      break;
    case 'fb-remove-annoyances':
      try {
        port.removeAnnoyances = _port;
        const settings = await storage.get([
          'remove_sponsored_ad',
          'remove_suggested_for_u',
          'remove_people_u_may_know',
          'remove_post_u_may_like',
        ]);

        _port.postMessage(settings);
      }
      catch (err) {
        console.assert('production' === ENV, err);
      }
      break;
    case 'fb-remove-tracking-params':
      try {
        port.removeTrackingParams = _port;
        const settings = await storage.get('remove_tracking_params');

        _port.postMessage(settings);
      }
      catch (err) {
        console.assert('production' === ENV, err);
      }
      break;
    case 'fb-down-story':
      try {
        const script = await getScript();

        _port.postMessage({ script });
      }
      catch (err) {
        console.assert('production' === ENV, err);
      }
      break;
  }
}

// eslint-disable-next-line no-unused-vars
function onChanged(changes, area) {

  if (changes.stop_up_next_video && port.stopNextVideo) {
    port.stopNextVideo.postMessage({ stop: changes.stop_up_next_video.newValue });
  }

  if ((changes.remove_sponsored_ad || changes.remove_people_u_may_know || changes.remove_suggested_for_u) && port.removeAnnoyances) {
    port.removeAnnoyances.postMessage({
      remove_people_u_may_know: changes.remove_people_u_may_know.newValue,
      remove_sponsored_ad: changes.remove_sponsored_ad.newValue,
      remove_suggested_for_u: changes.remove_suggested_for_u.newValue,
    });
  }

  if (changes.remove_tracking_params && port.removeTrackingParams) {
    port.removeTrackingParams.postMessage({ remove_tracking_params: changes.remove_tracking_params.newValue });
  }

  // remove story list after 1 hour
  if (changes.videos && changes.videos.newValue && !timer) {

    timer = setTimeout(() => {
      timer = null;
      storage.remove('videos');
    }, 36e5);
  }

  if (changes.fix_font) {
    fixFont();
  }
}

async function getScript() {

  const res = await fetch(runtime.getURL('content-scripts/fb-down-story-2.js'));

  if (res.ok) return await res.text();
  throw new Error(runtime.lastError);
}

async function fixFont() {

  try {
    const css = 'html, body, div, span,a,h1,h2,h3,h4,h5,h6 { font-family: \'Nunito\', sans-serif !important }';
    const { fix_font } = await storage.get('fix_font');
    const tabs = await browserTabs.query({
      currentWindow: true,
      url: 'https://*.facebook.com/*',
    });

    for (let i = tabs.length; 0 <= --i;) {

      const tab = tabs[i];

      if (fix_font && (!insertedCss.has(tab.id) || tab.url !== insertedCss.get(tab.id))) {

        browserTabs.executeScript(tab.id, {
          allFrames: true,
          code: `
          var fbUtilsCss = document.getElementById('fb-utils-css');
          fbUtilsCss && fbUtilsCss.remove();
          var link = document.createElement('link');
          link.id = 'fb-utils-css';
          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400&display=swap');
          document.querySelector('head').append(link);`,
          runAt: 'document_end',
        });
        browserTabs.insertCSS(tab.id, {
          allFrames: true,
          code: css,
          runAt: 'document_end',
        });
        insertedCss.set(tab.id, tab.url);
      }
      else if (!fix_font && insertedCss.has(tab.id)) {

        browserTabs.removeCSS(tab.id, { allFrames: true, code: css });
        insertedCss.delete(tab.id);
      }
    }
  }
  catch (err) {
    console.assert('production' === ENV, 'injector.js:81:', err);
  }
}

function onTabsUpdated(tabId, { status: changedStatus }, { status }) {

  if ('complete' === status || 'complete' === changedStatus) {

    fixFont();
  }
}

export { listenContentScripts };