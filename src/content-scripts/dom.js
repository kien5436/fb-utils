/**
 * @param {string} name HTML tag
 * @param {{ children?: HTMLElement | HTMLElement[] | string | string[] }} attributes
 */
export function component(name, attributes = {}) {

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