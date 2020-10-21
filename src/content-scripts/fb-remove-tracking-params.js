import { runtime } from 'webextension-polyfill';
import debounce from 'lodash/debounce';

(() => {
  const port = runtime.connect({ name: 'fb-remove-tracking-params' });
  const trackingParams = ['eid', '__tn__', 'source', 'ref', 'epa', 'ifg', 'comment_tracking', 'av', 'acontext', 'session_id', 'hc_location'];
  const target = document.body;
  const observer = new MutationObserver(debounce((mutations) => {

    removeTrackingParams();
  }, 500));

  port.onMessage.addListener((message) => {

    const { remove_tracking_params } = message;

    if (remove_tracking_params) {
      observer.observe(target, { childList: true, subtree: true });
    }
    else {
      observer.takeRecords();
      observer.disconnect();
    }
  });

  function removeTrackingParams() {

    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not(.nospy)');

    for (let i = links.length; --i >= 0;) {

      const link = links[i];
      const url = new URL(decodeURIComponent(link.href));

      for (let j = 0; j < 2; j++) {

        url.searchParams.forEach((value, key) => {

          if (trackingParams.includes(key) || key.includes('__xts__') || key.includes('__cft__')) {

            url.searchParams.delete(key);
          }
        });
      }

      link.href = url.href;
      link.classList.add('nospy');
    }
  }
})();