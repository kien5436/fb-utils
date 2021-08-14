const videos = document.getElementsByTagName('video');
const realVideoSrcClass = '.k4urcfbm l9j0dhe7 datstx6m a8c37x1j du4w35lb'.split(' ').join('.');
let videoUrl = '';

for (let i = videos.length; 0 <= --i;) {

  let realVideoSrc = videos[i].closest(realVideoSrcClass);
  let hasReactProps = false;

  for (const key in realVideoSrc) {

    if (realVideoSrc.hasOwnProperty(key) && key.includes('__reactProps')) {

      realVideoSrc = realVideoSrc[key];
      hasReactProps = true;
      break;
    }
  }

  if (!hasReactProps) continue;

  realVideoSrc = realVideoSrc.children[0] || realVideoSrc.children;
  videoUrl = realVideoSrc.props.children.props.implementations[1].data.hdSrc || realVideoSrc.props.children.props.implementations[1].data.sdSrc;

  if ('' !== videoUrl) {

    localStorage.setItem('story_url', videoUrl);
    break;
  }
}