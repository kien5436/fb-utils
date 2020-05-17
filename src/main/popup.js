import './popup.scss';
import './popup.pug';

// browser.tabs.executeScript({
//         allFrames: true,
//         code: `document.addEventListener('click', function(e) {

//     e.preventDefault();

//     if ('A' === e.target.tagName) {

//         const link = e.target;
//         const params = new URLSearchParams(link.search.substring(1));

//         if (params.has('fbclid')) params.delete('fbclid');

//         link.search = '?' + params.toString();

//         window.open(link.href);
//     }
// }, false);`
//     })
//     .then(() => console.info('remove fbclid'))
//     .catch(console.error);

const options = {
  0: 'block_seen',
  1: 'block_delivery_receipts',
  2: 'block_typing_indicator',
  3: 'hide_active_status',
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