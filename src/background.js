import 'content-scripts-register-polyfill';
import { webRequest, webNavigation, tabs as browserTabs, contentScripts } from 'webextension-polyfill';

import { ENV, isChrome } from './config';
import storage from './storage';

(async () => {
  let settings = await storage.get();
  let scriptStopNextVideo = null;

  // block chat seen
  webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.block_seen }), {
    urls: [
      '*://*.facebook.com/*change_read_status*',
      '*://*.messenger.com/*change_read_status*',
    ]
  }, ['blocking']);

  // block typing indicator
  webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.block_typing_indicator }), {
    urls: [
      '*://*.facebook.com/*typ.php*',
      '*://*.messenger.com/*typ.php*',
    ]
  }, ['blocking']);

  // block delivery receipts
  webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.block_delivery_receipts }), {
    urls: [
      '*://*.facebook.com/*delivery_receipts*',
      '*://*.messenger.com/*delivery_receipts*',
      '*://*.facebook.com/*unread_threads*',
      '*://*.messenger.com/*unread_threads*',
    ]
  }, ['blocking']);

  // block last active time
  webRequest.onBeforeRequest.addListener(details => {
    // console.assert(`background.js:31: hide_active_status`, details)

    return ({ cancel: settings.hide_active_status })
  }, {
    urls: [
      '*://edge-chat.facebook.com/*',
      '*://0-edge-chat.facebook.com/*',
      '*://1-edge-chat.facebook.com/*',
      '*://2-edge-chat.facebook.com/*',
      '*://3-edge-chat.facebook.com/*',
      '*://4-edge-chat.facebook.com/*',
      '*://5-edge-chat.facebook.com/*',
      '*://6-edge-chat.facebook.com/*',
      '*://7-edge-chat.facebook.com/*',
      '*://8-edge-chat.facebook.com/*',
      '*://9-edge-chat.facebook.com/*',
      '*://www.facebook.com/ajax/chat/*',
      '*://www.facebook.com/chat/*',
      '*://www.facebook.com/ajax/presence/*',
      '*://edge-chat.messenger.com/*',
      '*://0-edge-chat.messenger.com/*',
      '*://1-edge-chat.messenger.com/*',
      '*://2-edge-chat.messenger.com/*',
      '*://3-edge-chat.messenger.com/*',
      '*://4-edge-chat.messenger.com/*',
      '*://5-edge-chat.messenger.com/*',
      '*://6-edge-chat.messenger.com/*',
      '*://7-edge-chat.messenger.com/*',
      '*://8-edge-chat.messenger.com/*',
      '*://9-edge-chat.messenger.com/*',
      '*://www.messenger.com/ajax/chat/*',
      '*://www.messenger.com/chat/*',
      '*://www.messenger.com/ajax/presence/*',
    ]
  }, ['blocking']);

  // block linkclick analysis
  webRequest.onBeforeRequest.addListener(details => ({ cancel: true }), { urls: ['https://*.facebook.com/si/linkclick/ajax_callback/'] }, ['blocking']);

  // remove fbclid
  webRequest.onBeforeRequest.addListener(details => {

    const url = new URL(details.url);

    if ('GET' === details.method && url.searchParams.has('fbclid')) {

      url.searchParams.delete('fbclid');

      return { redirectUrl: url.href };
    }

  }, {
    urls: ['*://*/*'],
    types: ['main_frame']
  }, ['blocking']);

  // block FB pixel
  webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.block_fb_pixel }), { urls: ['https://connect.facebook.net/*'] }, ['blocking']);

  // block story seen on FB
  webRequest.onBeforeRequest.addListener(details => {

    const seenRequests = ['MessengerMarkReadMutation', 'storiesUpdateSeenStateMutation'];

    if (details.requestBody.formData && details.requestBody.formData.fb_api_req_friendly_name && seenRequests.includes(details.requestBody.formData.fb_api_req_friendly_name[0]))
      return { cancel: settings.block_seen_story };
  }, {
    urls: ['https://*.facebook.com/api/graphql/*']
  }, ['blocking', 'requestBody']);

  execStopNextVideo(settings.stop_up_next_video);

  webNavigation.onHistoryStateUpdated.addListener(details => {

    if (!details.url.includes('stories'))
      localStorage.removeItem('videos');
  }, { url: [{ urlMatches: 'https://www.facebook.com/*' }] });

  storage.onChanged.addListener(onChanged);

  async function onChanged(changes, area) {

    try {
      settings = await storage.get();

      if (changes.stop_up_next_video) {

        execStopNextVideo(changes.stop_up_next_video.newValue, true);
      }
    }
    catch (err) { console.error(err); }
  }

  async function execStopNextVideo(stop, reload = false) {

    try {
      if (stop) {

        scriptStopNextVideo && scriptStopNextVideo.unregister();
        scriptStopNextVideo = await contentScripts.register({
          matches: ['https://*.facebook.com/*'],
          js: [
            { file: '/libs.js' },
            { file: '/content-scripts/fb-stop-next-video.js' }
          ],
          runAt: 'document_idle',
        });
      }

      if (reload) {

        const tabs = await browserTabs.query({
          currentWindow: true,
          url: 'https://*.facebook.com/*',
        });
        const tabIds = tabs.map(tab => tab.id);

        for (let i = tabIds.length; --i >= 0;)
          browserTabs.reload(tabIds[i]);
      }
    }
    catch (err) { console.error(err); }
  }
})();