const storage = browser.storage.local;

/**
 * @param {string|string[]|object|null} keys keys: string|string[]|object|null
 * @returns {object|null} object corresponds to keys, otherwise null
 */
async function get(keys = null) {

  let store;

  try {
    store = await storage.get(keys);
    if (0 === Object.keys(store).length) store = null;
  }
  catch (err) { console.error(err); }
  finally { return store; }
}

async function save(store) {

  try { await storage.set(store); }
  catch (err) { console.error(err); }
}

export default {
  get,
  save,
  onChanged: browser.storage.onChanged,
}