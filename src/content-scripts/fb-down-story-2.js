var videos = document.getElementsByTagName('video');
var realVideoSrcClass = '.k4urcfbm l9j0dhe7 datstx6m a8c37x1j du4w35lb'.split(' ').join('.');
var author = '',
  videoUrl = '';
for (let i = videos.length; --i >= 0;) {
  author = videos[i].closest('[data-pagelet="Stories"]').querySelector('a[role="link"] img').alt;
  let realVideoSrc = videos[i].closest(realVideoSrcClass);
  for (const key in realVideoSrc) {
    if (realVideoSrc.hasOwnProperty(key) && key.includes('__reactProps')) {
      realVideoSrc = realVideoSrc[key];
      break;
    }
  }
  if (realVideoSrc.children[0]) {
    videoUrl = realVideoSrc.children[0].props.children.props.implementations[1].data.hdSrc || realVideoSrc.children[0].props.children.props.implementations[1].data.sdSrc;
  }
  else if (realVideoSrc.children) {
    videoUrl = realVideoSrc.children.props.children.props.implementations[1].data.hdSrc || realVideoSrc.children.props.children.props.implementations[1].data.sdSrc;
  }
  if ('' !== videoUrl) {
    localStorage.setItem('story_url', videoUrl);
    localStorage.setItem('author', author);
    break;
  }
}