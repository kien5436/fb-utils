import observable from './observable';
import { runtime } from 'webextension-polyfill';

import { inject } from '../background/injector';

(() => {
  const port = runtime.connect({ name: 'fb-remove-annoyances' });
  const lang = document.querySelector('html').getAttribute('lang');
  const target = document.body;

  const sponsor = {
    labels: {
      en: 'Sponsored',
      vi: 'Được tài trợ',
    },
    subscriber(mutations) { // eslint-disable-line

      this.removeAdsOnNewsfeed();
    },
    removeAdsOnNewsfeed() { // eslint-disable-line

      const label = this.labels[lang] || this.labels.en;

      document.querySelectorAll('[data-pagelet^="FeedUnit"]:not([data-fbutils-ads])').forEach((feed) => {

        try {
          const sponsorLabel = document.evaluate(`.//b[text()='${label}']|.//a[text()='${label}']`, feed, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

          if (sponsorLabel.singleNodeValue || feed.querySelector(`a[aria-label='${label}']`) || feed.querySelector('a[href*="https://www.facebook.com/business/help"]')) {
            feed.remove();
          }
          else {
            feed.setAttribute('data-fbutils-ads', '0');
          }
        }
        catch (err) {
          console.error(err);
        }
      });

      const rightRail = document.querySelector('div[data-pagelet="RightRail"]');

      if (!rightRail.firstElementChild.dataset.visualcompletion)
        rightRail.firstElementChild.style.setProperty('display', 'none', 'important');
    },
  };
  const suggestion = {
    labels: {
      en: 'Suggested for You',
      vi: 'Gợi ý cho bạn',
    },
    subscriber(mutations) { // eslint-disable-line
      const label = this.labels[lang] || this.labels.en;

      document.querySelectorAll('[data-pagelet^="FeedUnit"]:not([data-fbutils-suggestion])').forEach((feed) => {

        try {
          const suggestionLabel = document.evaluate(`.//span[text()='${label}']`, feed, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

          if (suggestionLabel.singleNodeValue) {
            feed.remove();
          }
          else {
            feed.setAttribute('data-fbutils-suggestion', '0');
          }
        }
        catch (err) {
          console.error(err);
        }
      });
    },
  };
  const people = {
    labels: {
      en: 'People You May Know',
      vi: 'Những người bạn có thể biết',
    },
    subscriber(mutations) { // eslint-disable-line
      const label = this.labels[lang] || this.labels.en;

      document.querySelectorAll('[data-pagelet^="FeedUnit"]:not([data-fbutils-people])').forEach((feed) => {

        try {
          const peopleLabel = document.evaluate(`.//span[text()='${label}']`, feed, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

          if (peopleLabel.singleNodeValue) {
            feed.remove();
          }
          else {
            feed.setAttribute('data-fbutils-people', '0');
          }
        }
        catch (err) {
          console.error(err);
        }
      });

      if (!document.querySelector('[data-pagelet^="FeedUnit"]')) {

        const peopleLabel = document.evaluate(`.//span[text()='${label}']`, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

        if (peopleLabel.singleNodeValue) {

          peopleLabel.singleNodeValue.parentNode.parentNode.parentNode.parentNode.remove();
        }
      }
    },
  };

  const sponsorRemover = observable(target, sponsor.subscriber.bind(sponsor));
  const suggestionRemover = observable(target, suggestion.subscriber.bind(suggestion));
  const peopleRemover = observable(target, people.subscriber.bind(people), 200);

  port.onMessage.addListener((message) => {

    const { remove_sponsored_ad, remove_suggested_for_u, remove_people_u_may_know, remove_post_u_may_like, script } = message;

    sponsorRemover(remove_sponsored_ad);
    suggestionRemover(remove_suggested_for_u);
    peopleRemover(remove_people_u_may_know);

    inject(script);
  });
})();