import observable from './observable';
import { runtime } from 'webextension-polyfill';

(() => {
  const port = runtime.connect({ name: 'fb-remove-tracking-params' });
  const trackingParams = ['eid', '__tn__', 'source', 'ref', 'fref', 'epa', 'ifg', 'comment_tracking', 'av', 'acontext', 'session_id', 'hc_location'];
  const target = document.body;
  const tracker = observable(target, removeTrackingParams, 500);

  port.onMessage.addListener((message) => tracker(message.remove_tracking_params));

  // eslint-disable-next-line no-unused-vars
  function removeTrackingParams(mutations) {

    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not(.nospy)');

    for (let i = links.length; 0 <= --i;) {

      const link = links[i];
      const url = new URL(decodeURIComponent(link.href));

      url.searchParams.forEach((value, key) => {

        if (trackingParams.includes(key) || key.includes('__xts__') || key.includes('__cft')) {

          url.searchParams.delete(key);
        }
      });

      link.href = url.href;
      link.classList.add('nospy');
    }
  }
})();