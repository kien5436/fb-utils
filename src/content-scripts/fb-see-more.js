document.addEventListener('click', (e) => {

  const sees = ['See More', 'Xem thêm'];

  if (!sees.includes(e.target.innerText)) return;

  const wrapper = e.target.closest('span');
  const className = e.target.className;

  setTimeout(() => {

    const toggle = component('div', {
      children: 'See less',
      class: className,
      'data-toggle': true,
      onclick() {

        wrapper.childNodes.forEach((node, i) => {

          if (0 < i && !node.dataset.toggle) {
            node.style.setProperty('display', 'none' === node.style.display ? 'unset' : 'none', 'important');
          }
        });
        toggle.innerText = 'See less' !== toggle.innerText ? 'See less' : 'See more';
      },
    });

    wrapper.append(toggle);
  }, 50);
}, false);

/**
 * @param {string} name HTML tag
 * @param {{ children?: HTMLElement | HTMLElement[] | string | string[] }} attributes
 */
function component(name, attributes = {}) {

  const el = document.createElement(name);

  for (const key in attributes) {

    if (attributes.hasOwnProperty(key) && 'children' !== key) {

      const attr = attributes[key];

      if ('function' === typeof attr && key.startsWith('on')) {
        el.addEventListener(key.substring(2).toLowerCase(), attr, false);
      }
      else if ('boolean' === typeof attr && attr) {
        el.setAttribute(key, key);
      }
      else el.setAttribute(key, attr.toString());
    }
  }

  const children = attributes.children;

  if (children) {

    if (children instanceof HTMLElement) {
      el.append(children);
    }
    else if (Array.isArray(children)) {

      for (const child of children) {

        if (child instanceof HTMLElement) {
          el.append(child);
        }
        else {
          el.append(document.createTextNode(child.toString()));
        }
      }
    }
    else {
      el.append(document.createTextNode(children.toString()));
    }
  }

  return el;
}