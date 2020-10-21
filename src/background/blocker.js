import { webRequest } from 'webextension-polyfill';

import storage from '../storage';

const filter = Object.freeze({
  seen: {
    urls: [
      '*://*.facebook.com/*change_read_status*',
      '*://*.messenger.com/*change_read_status*',
    ]
  },
  typingIndicator: {
    urls: [
      '*://*.facebook.com/*typ.php*',
      '*://*.messenger.com/*typ.php*',
    ]
  },
  deliveryReceipts: {
    urls: [
      '*://*.facebook.com/*delivery_receipts*',
      '*://*.messenger.com/*delivery_receipts*',
      '*://*.facebook.com/*unread_threads*',
      '*://*.messenger.com/*unread_threads*',
    ]
  },
  lastActive: {
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
  },
  linkClickAnalysis: { urls: ['https://*.facebook.com/si/linkclick/ajax_callback/'] },
  trackingParams: {
    urls: ['https://*/*', 'http://*/*'],
    types: ['main_frame']
  },
  fbPixel: { urls: ['https://connect.facebook.net/*'] },
  seenStory: { urls: ['https://*.facebook.com/api/graphql/*'] },
});
let blockSetting = {};

async function blockRequest(cb, filter, extraInfo = []) {

  webRequest.onBeforeRequest.addListener(cb, filter, ['blocking', ...extraInfo]);
}

function blockRequests() {

  blockRequest((details) => ({ cancel: blockSetting.block_seen }), filter.seen);
  blockRequest((details) => ({ cancel: blockSetting.block_typing_indicator }), filter.typingIndicator);
  blockRequest((details) => ({ cancel: blockSetting.block_delivery_receipts }), filter.deliveryReceipts);
  // waiting for browser supporting to block wss
  //  blockRequest(details => ({ cancel: settings.hide_active_status }), filter.lastActive);
  blockRequest((details) => ({ cancel: blockSetting.block_fb_pixel }), filter.fbPixel);
  blockRequest((details) => ({ cancel: true }), filter.linkClickAnalysis);
  blockRequest(({ method, url }) => {

    url = new URL(url);

    if (blockSetting.remove_tracking_params && 'GET' === method) {

      let redirect = false;

      url.searchParams.forEach((value, key) => {

        if ('fbclid' === key || key.includes('utm')) {

          redirect = true;
          url.searchParams.delete(key);
        }
      });

      if (redirect) {
        return { redirectUrl: url.href };
      }
    }
  }, filter.trackingParams);
  blockRequest(({ requestBody: { formData } }) => {

    const seenParams = ['MessengerMarkReadMutation', 'storiesUpdateSeenStateMutation'];

    if (formData && formData.fb_api_req_friendly_name && seenParams.includes(formData.fb_api_req_friendly_name[0])) {

      return { cancel: blockSetting.block_seen_story };
    }
  }, filter.seenStory, ['requestBody']);
}

async function resetBlocker() {

  blockSetting = await storage.get([
    'block_delivery_receipts',
    'block_fb_pixel',
    'block_seen_story',
    'block_seen',
    'block_typing_indicator',
    'remove_tracking_params',
  ]);
}

export { blockRequests, resetBlocker };