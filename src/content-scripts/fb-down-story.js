import { i18n, runtime } from 'webextension-polyfill';

import { inject } from '../background/injector';
import storage from '../storage';

(() => {
  const port = runtime.connect({ name: 'fb-down-story' });

  port.onMessage.addListener((message) => {

    inject(message.script, () => {

      setTimeout(async () => {

        try {
          const url = localStorage.getItem('story_url');

          if (!url)
            alert(i18n.getMessage('noStory'));
          else {
            const { ctx } = await storage.get('ctx');

            if ('story-downloader' === ctx) {

              await runtime.sendMessage({ url });
            }
            else if ('story-link' === ctx) {

              window.open(url, '_blank', 'noopener,noreferrer');
            }
          }
        }
        catch (err) {
          console.error('fb-down-story.js:', err);
        }
      }, 300);
    });

    port.disconnect();
  });
})();