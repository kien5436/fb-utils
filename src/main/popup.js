import { i18n, tabs, downloads, runtime } from 'webextension-polyfill';

import './popup.scss';
import './popup.pug';
import { createElement } from './dom';
import storage from '../storage';

const options = {
  block_seen: i18n.getMessage('blockSeen'),
  block_delivery_receipts: i18n.getMessage('blockDeliveryReceipts'),
  block_typing_indicator: i18n.getMessage('blockTypingIndicator'),
  block_seen_story: i18n.getMessage('blockSeenStory'),
  hide_active_status: i18n.getMessage('hideActiveStatus'),
  block_fb_pixel: i18n.getMessage('blockFbPixel'),
  stop_up_next_video: i18n.getMessage('stopUpNextVideo'),
};

window.addEventListener('load', () => {

  renderOptions();

  document.querySelectorAll('.option').forEach(async el => {

    const option = el.value;

    el.addEventListener('click', () => {

      checkTheBox(el);

      try {
        storage.save({
          [option]: el.checked
        });
      }
      catch (err) { console.error(err); }
    }, false);

    try {
      const {
        [option]: opt
      } = await storage.get(option);
      el.checked = opt || false;

      checkTheBox(el);
    }
    catch (err) { console.error(err); }
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

  document.querySelectorAll('[data-trans]').forEach(el => {

    el.innerText = i18n.getMessage(el.getAttribute('data-trans'));
  });
}, false);

function checkTheBox(checkbox) {

  if (checkbox.checked)
    checkbox.closest('.checkbox').classList.add('is-checked');
  else
    checkbox.closest('.checkbox').classList.remove('is-checked');
}

function getVideoUrlFb() {

  tabs.query({ currentWindow: true, active: true })
    .then(_tabs => {

      if (!_tabs[0].url.includes('stories')) {

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

      return tabs.executeScript({ file: '/libs.js' });
    })
    .then(() => tabs.executeScript({ file: '/content-scripts/fb-down-story.js' }))
    .catch(console.error);
}

runtime.onMessage.addListener((message, sender) => {

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

  const lvlLeftItem = createElement('div', { class: 'level-item is-size-6' });
  lvlLeftItem.innerText = i18n.getMessage('storyAuthor', author);
  levelLeft.append(lvlLeftItem);

  const lvlRightItem = createElement('div', { class: 'level-item' });
  const field = createElement('div', { class: 'field is-grouped' });
  const control1 = createElement('div', { class: 'control' });
  const control2 = createElement('div', { class: 'control' });

  const btnDown = createElement('button', {
    class: 'button',
    type: 'button',
    title: i18n.getMessage('download'),
  });
  const iconBox1 = createElement('span', { class: 'icon is-small' });
  const iconDown = createElement('i', { class: 'icon-download' });
  iconBox1.append(iconDown);
  btnDown.append(iconBox1);
  btnDown.addEventListener('click', function(e) {

    downloads.download({
        url: videoUrl,
        saveAs: true,
      })
      .catch(console.error);
  }, false);
  control1.append(btnDown);

  const a = createElement('a', {
    class: 'button',
    target: '_blank',
    title: i18n.getMessage('openLink'),
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
  const p = createElement('p', { class: 'empty has-text-centered is-size-6' });

  p.innerHTML = i18n.getMessage('noVideo');
  downloadContent.innerHTML = '';
  downloadContent.append(p);
}

function renderOptions() {

  const menuLists = document.getElementsByClassName('menu-list');
  const fragmentActivity = new DocumentFragment();
  const fragmentPrivacy = new DocumentFragment();
  const fragmentOther = new DocumentFragment();
  const optionKeys = Object.keys(options);

  for (let i = 0; i < 4; i++)
    fragmentActivity.append(renderOption(optionKeys[i]));

  fragmentPrivacy.append(renderOption(optionKeys[5]));

  for (let i = 6; i < 7; i++)
    fragmentOther.append(renderOption(optionKeys[i]));

  menuLists[0].append(fragmentActivity);
  menuLists[1].append(fragmentPrivacy);
  menuLists[2].append(fragmentOther);
}

/**
 * render option \<li>\</li> block
 * @param {string} value options's value
 */
function renderOption(value) {

  const li = createElement('li');
  const label = createElement('label', { class: 'checkbox' });
  const checkbox = createElement('input', {
    class: 'option',
    type: 'checkbox',
    value,
  });
  const span = createElement('span');

  span.innerText = options[value];
  label.append(checkbox, span);
  li.append(label);

  return li;
}