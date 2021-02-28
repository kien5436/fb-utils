import observable from './observable';
import { runtime } from 'webextension-polyfill';

(() => {
  const port = runtime.connect({ name: 'fb-stop-next-video' });
  const target = document.body;
  const lang = document.querySelector('html').getAttribute('lang');
  const cancel = {
    labels: {
      en: 'Cancel',
      vi: 'Hủy',
    },
    subscriber(mutations) { // eslint-disable-line no-unused-vars
      const videoUrl = /\/.+\/videos\/.+/;
      const label = this.labels[lang] || this.labels.en;

      if (videoUrl.test(window.location.pathname)) {

        const node = document.evaluate(`.//span[text()='${label}']`, target, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

        node.singleNodeValue && node.singleNodeValue.click();
      }
    },
  };
  const canceller = observable(target, cancel.subscriber.bind(cancel), 250);

  port.onMessage.addListener((message) => canceller(message.stop));
})();