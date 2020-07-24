const commentItems = document.getElementsByClassName('_4299');
let lastIndex = 0;

(() => {
  const userContentWrappers = document.getElementsByClassName('userContentWrapper');
  let target = userContentWrappers[0];
  let wasScrollingDown = true;
  const observer = new IntersectionObserver((entries, _observer) => {

    const entry = entries[0];
    const isScrollingDown = entry.boundingClientRect.y > entry.rootBounds.y;

    if (wasScrollingDown)
      removeComments();

    if (!entry.isIntersecting) {

      observer.unobserve(target);
      target = userContentWrappers[userContentWrappers.length - 1];
      observer.observe(target);
    }

    wasScrollingDown = isScrollingDown;
  }, { threshold: 0.3 });

  observer.observe(target);
})();

function removeComments() {

  for (let i = lastIndex; i < commentItems.length; i++) {

    const commentBlock = commentItems[i];

    if (!commentBlock.classList.contains('no_hide') && commentBlock.getElementsByClassName('FBTR-PROCESSED').length > 1) {

      const commentCounter = commentBlock.querySelector('._3hg-._42ft');
      commentCounter && commentCounter.click();
      commentBlock.classList.add('no_hide');
    }
  }

  lastIndex = commentItems.length;
}