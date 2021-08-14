(() => {

  new MutationObserver(() => {

    removeAdsOnWatch();
    removeAdsOnNewsfeed();
  })
    .observe(document.body, {
      childList: true,
      subtree: true,
    });
})();

function removeAdsOnWatch() {

  if (!window.location.pathname.includes('/watch')) return;

  document.querySelectorAll('#watch_feed div[data-pagelet="MainFeed"] div:not([class]):not([id]) > div[class*=" "] div[class^="_"] > div[class*=" "]:not([data-fbutils-ads])').forEach((feed) => {

    const keys = Object.keys(feed);

    for (let i = 0; i < keys.length; i++) {

      if (keys[i].includes('__reactFiber')) {

        const props = feed[keys[i]];

        if (props && props.return && props.return.memoizedProps && props.return.memoizedProps.story && props.return.memoizedProps.story.sponsored_data) {

          feed.remove();
        }
        else {
          feed.setAttribute('data-fbutils-ads', '0');
        }

        break;
      }
    }
  });
}

function removeAdsOnNewsfeed() {

  document.querySelectorAll('[data-pagelet^="FeedUnit"]:not([data-fbutils-ads-2])').forEach((feed) => {

    const keys = Object.keys(feed);

    for (let i = 0; i < keys.length; i++) {

      if (keys[i].includes('__reactProps')) {

        const props = feed[keys[i]];

        if (props && props.children.props.children.props.edge.category.includes('SPONSORED')) {

          feed.remove();
        }
        else {
          feed.setAttribute('data-fbutils-ads-2', '0');
        }

        break;
      }
    }
  });
}