(() => {

  let videos = document.getElementsByTagName('video');
  let videoUrl = null;

  if (videos.length > 0) {

    const script = document.createElement('script');
    script.innerText = `videos = document.getElementsByTagName('video');
    for (let i = videos.length; --i >= 0;) {
      keys = Object.keys(videos[i]);
      for (let j = 0; j < keys.length; j++) {
        if (keys[j].indexOf('__reactFiber') >= 0) {
          const videoData = videos[i][keys[j]].return.stateNode.props.videoData.$1;
          videoUrl = videoData.hd_src || videoData.sd_src;
          break;
        }
      }
    }
    localStorage.setItem('story_url', videoUrl);`;
    document.body.append(script);
    setTimeout(() => {

      videoUrl = localStorage.story_url;

      browser.runtime.sendMessage({
        videoUrl: 'null' === videoUrl ? null : videoUrl,
        author: document.querySelector('a[role=link] img').alt,
      });
      localStorage.removeItem('story_url');
      script.remove();
    }, 300);
  }
})();