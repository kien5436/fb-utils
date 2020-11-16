import { runtime } from 'webextension-polyfill';
import debounce from 'lodash/debounce';

(() => {
  const port = runtime.connect({ name: 'fb-remove-annoyances' });
  const sponsoredLabels = {
    vi: 'Được tài trợ',
    en: 'Sponsored',
  };
  // const suggestedLabels = [];
  // const peopleLabels = [];
  const target = document.body;
  const lang = document.getElementsByTagName('html')[0].getAttribute('lang');

  const observer = new MutationObserver(debounce(removeSponsored, 150));

  port.onMessage.addListener((message) => {

    const { remove_sponsored_ad, remove_suggested_for_u, remove_people_u_may_know } = message;

    if (remove_sponsored_ad) {
      observer.observe(target, { childList: true, subtree: true });
    }
    else {
      observer.takeRecords();
      observer.disconnect();
    }
  });

  function removeSponsored(mutations) {

    const selector = `[aria-label="${sponsoredLabels[lang] || sponsoredLabels.en}"]`;
    const sponsorsAside = document.querySelector('[data-pagelet="RightRail"] .sponsored_ad');

    if (document.querySelector(selector)) {

      const labelElements = document.querySelectorAll(selector);

      for (let j = labelElements.length; --j >= 0;) {

        labelElements[j].closest('[data-pagelet^="FeedUnit"]').remove();
      }
    }

    if (sponsorsAside) {

      sponsorsAside.parentElement.parentElement.remove();
    }
  }
})();