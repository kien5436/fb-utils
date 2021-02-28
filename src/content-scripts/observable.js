import debounce from 'lodash/debounce';

/**
 * @param {Node} target
 * @param {Function} cb
 * @param { number } delay The number of milliseconds to delay
 * @return {(shouldObserve: boolean) => void}
 */
export default function observable(target, cb, delay = 150) {

  const observer = new MutationObserver(debounce(cb, delay));

  return (shouldObserve) => {

    if (shouldObserve) {
      observer.observe(target, { childList: true, subtree: true });
    }
    else {
      observer.takeRecords();
      observer.disconnect();
    }
  };
}