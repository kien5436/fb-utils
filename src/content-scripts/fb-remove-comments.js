(() => {
  let target = document.querySelector('.userContentWrapper');
  let wasScrollingDown = false;
  const observer = new IntersectionObserver((entries, _observer) => {

    const entry = entries[0];
    const isScrollingDown = entry.boundingClientRect.y > entry.rootBounds.y;

    if (wasScrollingDown) {

      removeComments();

      if (!entry.isIntersecting) {

        const userContentWrappers = document.getElementsByClassName('userContentWrapper');

        observer.unobserve(target);
        target = userContentWrappers[userContentWrappers.length - 1];
        observer.observe(target);
      }
    }

    wasScrollingDown = isScrollingDown;
  });

  observer.observe(target);
})();

function removeComments() {

  const commentItems = document.getElementsByClassName('_4299');

  for (const commentBlock of commentItems)
    if (commentBlock.getElementsByClassName('FBTR-PROCESSED').length > 1) {

      const commentCounter = commentBlock.querySelector('._3hg-._42ft');
      commentCounter && commentCounter.click();
    }
}