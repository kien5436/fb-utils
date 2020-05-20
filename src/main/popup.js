import './popup.scss';
import './popup.pug';

const options = {
  0: 'block_seen',
  1: 'block_delivery_receipts',
  2: 'block_typing_indicator',
  3: 'block_seen_story',
  4: 'hide_active_status',
  5: 'block_fb_pixel',
  6: 'stop_up_next_video',
};

window.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.option').forEach(el => {

    const checkStatus = 'true' === localStorage.getItem(options[el.value]);
    el.checked = checkStatus || false;

    checkTheBox(el);

    el.addEventListener('click', () => {

      checkTheBox(el);
      localStorage.setItem(options[el.value], el.checked);
      browser.runtime.sendMessage('change settings');
    }, false);
  });
}, false);

function checkTheBox(checkbox) {

  if (checkbox.checked)
    checkbox.closest('.checkbox').classList.add('is-checked');
  else
    checkbox.closest('.checkbox').classList.remove('is-checked');
}