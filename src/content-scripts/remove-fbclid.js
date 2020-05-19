document.addEventListener('click', function(e) {

  e.preventDefault();

  if ('A' === e.target.tagName) {

    const link = e.target;
    const params = new URLSearchParams(link.search.substring(1));

    if (params.has('fbclid')) {

      params.delete('fbclid');
      link.search = '?' + params.toString();
      window.open(link.href);

      return false;
    }

    return true;
  }
}, false);