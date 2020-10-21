import { runtime } from 'webextension-polyfill';
import debounce from 'lodash/debounce';

(() => {
  const port = runtime.connect({ name: 'fb-stop-next-video' });
  const target = document.body;
  const upNextOverlayClassList = '.ipxafjjy j1l0snac h9pa7xm5 sbevj9st by8nzva6 jk6sbkaj kdgqqoy6 ihh4hy1g qttc61fc cdjodzko swmj3c3o m1bnnib3 soycq5t1 pedkr2u6 pmk7jnqg eezhb0co'.split(' ').join('.');
  const observer = new MutationObserver(debounce(stopNextVideo, 250));

  port.onMessage.addListener((message) => {

    if (message.stop) {
      observer.observe(target, { childList: true, subtree: true });
    }
    else {
      observer.takeRecords();
      observer.disconnect();
    }
  });

  function stopNextVideo(mutations) {

    const videoUrl = /\/.+\/videos\/.+/;

    if (videoUrl.test(window.location.pathname)) {

      const upNextOverlay = document.querySelector(upNextOverlayClassList);

      if (upNextOverlay) {

        const buttons = upNextOverlay.querySelectorAll('[role="button"]');
        const cancelBtn = buttons[buttons.length - 1];

        cancelBtn.click();
      }
    }
  }
})();