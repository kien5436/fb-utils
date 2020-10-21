import { runtime } from 'webextension-polyfill';

(() => {
  const port = runtime.connect({ name: 'fb-down-story' });

  port.onMessage.addListener((message) => {

    const videos = document.getElementsByTagName('video');

    if (videos.length > 0) {

      try {
        const script = document.createElement('script');
        script.innerText = message.script;

        document.body.append(script);

        setTimeout(() => {

          const videoUrl = localStorage.story_url;
          const author = localStorage.author;

          runtime.sendMessage({
            author,
            videoUrl,
          });
          script.remove();
        }, 300);
      }
      catch (err) { console.error('fb-down-story.js:26:', err); }
    }

    port.disconnect();
  })
})();