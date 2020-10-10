import { storage as browserStorage } from 'webextension-polyfill';
import { ENV } from './config';

const storage = 'production' !== ENV ? browserStorage.local : browserStorage.sync;

/**
 * @param {string|string[]|object|null} keys keys: string|string[]|object|null
 * @returns {object|null} object corresponds to keys, otherwise null
 */
async function get(keys = null) {

  let store;

  try {
    store = await storage.get(keys);

    if (0 === Object.keys(store).length)
      store = {
        block_seen: false,
        block_typing_indicator: false,
        block_delivery_receipts: false,
        hide_active_status: false,
        block_fb_pixel: false,
        block_seen_story: false,
        stop_up_next_video: false,
      };
  }
  catch (err) { console.error(err); }
  finally { return store; }
}

async function save(store) {

  try {
    await storage.set(store);
  }
  catch (err) { console.error(err); }
}

export default {
  get,
  save,
  onChanged: browserStorage.onChanged,
}