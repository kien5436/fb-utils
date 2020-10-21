import { runtime } from 'webextension-polyfill';

import { ENV } from '../config';
import { blockRequests, resetBlocker } from './blocker';
import storage from '../storage';

let timer = null;
const port = {
  removeAnnoyances: null,
  removeTrackingParams: null,
  stopNextVideo: null,
};

runtime.onInstalled.addListener(({ reason }) => {

  switch (reason) {
    case 'install':
    case 'update':
      storage.init();
      break;
  }
});
runtime.onConnect.addListener(onConnect);
storage.onChanged.addListener(onChanged);

(async () => {
  try {
    await resetBlocker();
    blockRequests();
  }
  catch (err) { console.assert('production' === ENV, 'index.js:31:', err); }
})();

async function onConnect(_port) {

  switch (_port.name) {
    case 'fb-stop-next-video':
      try {
        port.stopNextVideo = _port;
        const { stop_up_next_video } = await storage.get('stop_up_next_video');

        _port.postMessage({ stop: stop_up_next_video });
      }
      catch (err) { console.assert('production' === ENV, err); }
      break;
    case 'fb-remove-annoyances':
      try {
        port.removeAnnoyances = _port;
        const settings = await storage.get(['remove_sponsored_ad', 'remove_suggested_for_u', 'remove_people_u_may_know']);

        _port.postMessage(settings);
      }
      catch (err) { console.assert('production' === ENV, err); }
      break;
    case 'fb-remove-tracking-params':
      try {
        port.removeTrackingParams = _port;
        const settings = await storage.get('remove_tracking_params');

        _port.postMessage(settings);
      }
      catch (err) { console.assert('production' === ENV, err); }
      break;
    case 'fb-down-story':
      try {
        const script = await getScript();

        _port.postMessage({ script });
      }
      catch (err) { console.assert('production' === ENV, err); }
      break;
  }
}

function onChanged(changes, area) {

  resetBlocker();

  if (changes.stop_up_next_video && port.stopNextVideo) {
    port.stopNextVideo.postMessage({ stop: changes.stop_up_next_video.newValue });
  }

  if (changes.remove_sponsored_ad /* || changes.remove_people_u_may_know || changes.remove_suggested_for_u */ && port.removeAnnoyances) {
    port.removeAnnoyances.postMessage({
      // remove_people_u_may_know: changes.remove_people_u_may_know.newValue,
      remove_sponsored_ad: changes.remove_sponsored_ad.newValue,
      // remove_suggested_for_u: changes.remove_suggested_for_u.newValue,
    });
  }

  if (changes.remove_tracking_params && port.removeTrackingParams) {
    port.removeTrackingParams.postMessage({
      remove_tracking_params: changes.remove_tracking_params.newValue
    });
  }

  // remove story list after 1 hour
  if (changes.videos && changes.videos.newValue && !timer) {

    timer = setTimeout(() => {
      timer = null;
      storage.remove('videos');
    }, 36e5);
  }
}

async function getScript() {

  const res = await fetch(runtime.getURL('content-scripts/fb-down-story-2.js'));

  if (res.ok) {

    return await res.text();
  }
  throw new Error(runtime.lastError);
}