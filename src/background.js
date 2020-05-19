let settings = loadSettings();

// block chat seen
browser.webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.block_seen }), {
  urls: [
    '*://*.facebook.com/*change_read_status*',
    '*://*.messenger.com/*change_read_status*',
  ]
}, ['blocking']);

// block typing indicator
browser.webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.block_typing_indicator }), {
  urls: [
    '*://*.facebook.com/*typ.php*',
    '*://*.messenger.com/*typ.php*',
  ]
}, ['blocking']);

// block delivery receipts
browser.webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.block_delivery_receipts }), {
  urls: [
    '*://*.facebook.com/*delivery_receipts*',
    '*://*.messenger.com/*delivery_receipts*',
    '*://*.facebook.com/*unread_threads*',
    '*://*.messenger.com/*unread_threads*',
  ]
}, ['blocking']);

// block last active time
browser.webRequest.onBeforeRequest.addListener(details => ({ cancel: settings.hide_active_status }), {
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
browser.webRequest.onBeforeRequest.addListener(details => ({ cancel: true }), { urls: ['https://*.facebook.com/si/linkclick/ajax_callback/'] }, ['blocking']);

// block story seen on FB
browser.webRequest.onBeforeRequest.addListener(details => {

  const seenRequests = ['MessengerMarkReadMutation', 'storiesUpdateSeenStateMutation'];

  if (details.requestBody.formData && details.requestBody.formData.fb_api_req_friendly_name && seenRequests.includes(details.requestBody.formData.fb_api_req_friendly_name[0]))
    return { cancel: settings.block_seen_story };
}, {
  urls: ['https://*.facebook.com/api/graphql/*']
}, ['blocking', 'requestBody']);

browser.runtime.onMessage.addListener(handleMessage);

function loadSettings() {

  const settings = {};

  for (let i = localStorage.length; --i >= 0;) {

    const key = localStorage.key(i);
    settings[key] = 'true' === localStorage.getItem(key);
  }

  return settings;
}

function handleMessage(message) {

  if ('change settings' === message)
    settings = loadSettings();
}