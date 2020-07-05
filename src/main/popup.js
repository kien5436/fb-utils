import './popup.scss';
import './popup.pug';
import { createElement } from './dom';

const options = {
  0: 'block_seen',
  1: 'block_delivery_receipts',
  2: 'block_typing_indicator',
  3: 'block_seen_story',
  4: 'hide_active_status',
  5: 'block_fb_pixel',
  6: 'stop_up_next_video',
  7: 'collapse_comments',
};

window.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.option').forEach(el => {

    const checkStatus = 'true' === localStorage.getItem(options[el.value]);
    el.checked = checkStatus || false;

    checkTheBox(el);

    el.addEventListener('click', () => {

      checkTheBox(el);
      localStorage.setItem(options[el.value], el.checked);

      if ('collapse_comments' === options[el.value] && el.checked) {

        browser.tabs.query({
            currentWindow: true,
            url: 'https://*.facebook.com/*',
          })
          .then(tabs => {

            const tabIds = tabs.map(tab => tab.id);

            browser.runtime.sendMessage({
              changeSettings: true,
              tabIds
            });
          })
          .catch(console.error);
      }
      else
        browser.runtime.sendMessage({
          changeSettings: true,
        });
    }, false);
  });

  document.querySelectorAll('.tabs a').forEach(el => {

    el.addEventListener('click', function(e) {

      document.querySelectorAll('.tabs li').forEach(li => {

        if (li === this.parentNode) li.classList.add('is-active');
        else li.classList.remove('is-active');
      });

      const contentId = this.getAttribute('data-content');

      document.querySelectorAll('.content-block').forEach(block => {

        if (contentId === block.id) block.classList.remove('is-hidden');
        else block.classList.add('is-hidden');
      });

      if (contentId === 'download-videos-fb-content') getVideoUrlFb();
    }, false);
  });
}, false);

function checkTheBox(checkbox) {

  if (checkbox.checked)
    checkbox.closest('.checkbox').classList.add('is-checked');
  else
    checkbox.closest('.checkbox').classList.remove('is-checked');
}

function getVideoUrlFb() {

  browser.tabs.query({ currentWindow: true, active: true })
    .then(tabs => {

      if (!tabs[0].url.includes('stories')) {

        notifNoVideo();
        return;
      }

      const downloadContent = document.getElementById('download-videos-fb-content');

      if (0 === downloadContent.getElementsByClassName('level').length) {

        let videos = localStorage.getItem('videos');
        videos = null !== videos ? JSON.parse(videos) : {};

        for (const videoName in videos) {

          const { videoUrl, author } = videos[videoName];
          createVideoItem(videoUrl, author);
        }
      }

      return browser.tabs.executeScript({ file: '/content-scripts/fb.js' });
    })
    .catch(console.error);
}

browser.runtime.onMessage.addListener((message, sender) => {

  if (message.videoUrl) {

    let videos = localStorage.getItem('videos');
    const videoName = message.videoUrl.match(/\/([\d\w-_]+)\.mp4/)[1];

    videos = null !== videos ? JSON.parse(videos) : {};

    if (!videos[videoName]) {

      createVideoItem(message.videoUrl, message.author);

      videos[videoName] = {
        author: message.author,
        videoUrl: message.videoUrl
      };
      localStorage.setItem('videos', JSON.stringify(videos));
    }
  }
  else notifNoVideo();
});

function createVideoItem(videoUrl, author) {

  const level = createElement('li', { class: 'level is-mobile' });
  const levelLeft = createElement('div', { class: 'level-left' });
  const levelRight = createElement('div', { class: 'level-right' });

  const lvlLeftItem = createElement('div', { class: 'level-item' });
  lvlLeftItem.innerText = `${author}'s story`;
  levelLeft.append(lvlLeftItem);

  const lvlRightItem = createElement('div', { class: 'level-item' });
  const field = createElement('div', { class: 'field is-grouped' });
  const control1 = createElement('div', { class: 'control' });
  const control2 = createElement('div', { class: 'control' });

  const btnDown = createElement('button', {
    class: 'button',
    type: 'button',
    title: 'Download',
  });
  const iconBox1 = createElement('span', { class: 'icon is-small' });
  const iconDown = createElement('i', { class: 'icon-download' });
  iconBox1.append(iconDown);
  btnDown.append(iconBox1);
  btnDown.addEventListener('click', function(e) {

    browser.downloads.download({
        url: videoUrl,
        saveAs: true,
      })
      .catch(console.error);
  }, false);
  control1.append(btnDown);

  const a = createElement('a', {
    class: 'button',
    target: '_blank',
    title: 'Open in new tab',
    rel: 'noopener noreferrer',
    href: videoUrl,
  });
  const iconBox2 = createElement('span', { class: 'icon is-small' });
  const iconExternal = createElement('i', { class: 'icon-external-link' });
  iconBox2.append(iconExternal);
  a.append(iconBox2);
  control2.append(a);

  field.append(control1, control2);
  lvlRightItem.append(field);
  levelRight.append(lvlRightItem);

  level.append(levelLeft, levelRight);

  const downloadContent = document.getElementById('download-videos-fb-content');

  if (downloadContent.getElementsByClassName('empty').length > 0) downloadContent.innerHTML = '';
  downloadContent.append(level);
}

function notifNoVideo() {

  const downloadContent = document.getElementById('download-videos-fb-content');
  const p = createElement('p', { class: 'empty has-text-centered' });

  p.innerText = 'No stories are available';
  downloadContent.innerHTML = '';
  downloadContent.append(p);
}