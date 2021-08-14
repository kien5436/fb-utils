import { storage as browserStorage } from 'webextension-polyfill';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';

import { defaultSettings, ENV } from './config';

const storage = 'production' !== ENV ? browserStorage.local : browserStorage.sync;

/**
 * @param {string|string[]|object|null} keys keys: string|string[]|object|null
 * @returns {object|null} object corresponds to keys, otherwise null
 */
async function get(keys = null) {

  const store = await storage.get(keys);
  return 0 < Object.keys(store).length ? store : null;
}

async function save(store) {

  await storage.set(store);
}

async function remove(keys) {

  await storage.remove(keys);
}

async function init() {

  try {
    const userSettings = await get();

    if (null === userSettings) storage.set(defaultSettings); // 1st install
    else if (!isEqual(userSettings, defaultSettings)) { // update

      const { newSettings, deprecatedSettings } = mergeSettings(userSettings, { ...defaultSettings });

      await storage.remove(deprecatedSettings);
      await storage.set({ ...newSettings });
    }
  }
  catch (err) {
    console.assert('production' === ENV, err);
  }

  function mergeSettings(old, _new) {

    const deprecatedSettings = [];

    for (const key in old)
      if (old.hasOwnProperty(key)) {

        const oldVal = old[key];
        const newVal = _new[key];

        if (!_new.hasOwnProperty(key)) deprecatedSettings.push(key);
        else if (isObjectLiteral(oldVal) && isObjectLiteral(newVal) && !isEqual(oldVal, newVal)) {

          for (const k in oldVal)
            if (oldVal.hasOwnProperty(k))
              if (oldVal[k] !== newVal[k]) _new[key][k] = oldVal[k];
        }
      }

    return { newSettings: _new, deprecatedSettings };
  }

  function isObjectLiteral(value) {
    return isObject(value) && !Array.isArray(value)
  }
}

export default {
  get,
  init,
  onChanged: browserStorage.onChanged,
  remove,
  save,
}