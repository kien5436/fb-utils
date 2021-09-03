import { component } from './dom';

document.addEventListener('click', (e) => {

  const sees = ['See More', 'Xem Thêm'];

  if (!sees.includes(e.target.innerText) || !e.target.closest('[data-ad-preview]')) return;

  /** @type HTMLElement */
  const wrapper = e.target.closest('span');
  const className = e.target.className;

  setTimeout(() => {

    const toggle = component('div', {
      children: 'See less',
      class: className,
      'data-toggle': true,
      onClick() {

        if (3 <= wrapper.childNodes.length) {

          wrapper.childNodes.forEach((node, i) => {

            if (0 < i && !node.dataset.toggle) {
              node.style.setProperty('display', 'none' === node.style.display ? 'unset' : 'none', 'important');
            }
          });
        }
        else {

          wrapper.firstElementChild.childNodes.forEach((node, i) => {

            if (0 < i && !node.dataset.toggle) {
              node.style.setProperty('display', 'none' === node.style.display ? 'unset' : 'none', 'important');
            }
          });
        }

        toggle.innerText = 'See less' !== toggle.innerText ? 'See less' : 'See more';
      },
    });

    wrapper.append(toggle);
  }, 50);
}, false);
