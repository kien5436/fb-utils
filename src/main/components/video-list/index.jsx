import { downloads, i18n, runtime, tabs as browserTabs } from 'webextension-polyfill';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import './style.scss';
import { ENV } from '../../../config';
import storage from '../../../storage';

function VideoList() {

  const [videos, setVideos] = useState(null);

  useEffect(() => {

    getVideoList();
    listenMessage();
  }, []);

  return (
    <ul className="has-scrollbar m-0">
      {videos}
    </ul>
  );

  async function getVideoList() {

    try {
      const tabs = await browserTabs.query({ currentWindow: true, active: true });
      const settings = await storage.get('videos');
      const isStoryOpened = tabs[0].url.includes('stories');

      if (isStoryOpened) {

        await browserTabs.executeScript({ file: '/libs/common.js' });
        await browserTabs.executeScript({ file: '/content-scripts/fb-down-story.js' });
      }

      if (null !== settings) {

        const _videos = [];
        const videoList = settings.videos;

        for (const videoName in videoList) {

          const { author, videoUrl } = videoList[videoName];

          _videos.unshift(<VideoItem author={author} url={videoUrl} key={videoName} />);
        }

        _videos.unshift(<HelpText />);
        setVideos(_videos);
      }
      else {
        setVideos(<NoVideo isStoryOpened={isStoryOpened} />);
      }
    }
    catch (err) { console.assert('production' === ENV, err); }
  }

  function listenMessage() {

    runtime.onMessage.addListener(async (message) => {

      if (message.videoUrl) {

        try {
          const { author, videoUrl } = message;
          const videoName = videoUrl.match(/\/([\d\w-_]+)\.mp4/)[1];
          const settings = await storage.get('videos');
          const videoList = null !== settings ? settings.videos : {};

          if (!videoList[videoName]) {

            videoList[videoName] = { author, videoUrl };
            const videoItem = <VideoItem author={author} url={videoUrl} />;

            storage.save({ videos: videoList });
            setVideos(Array.isArray(videos) ? [<HelpText />, videoItem, ...videos] : [<HelpText />, videoItem]);
          }
        }
        catch (err) { console.assert('production' === ENV, err); }
      }
    });
  }
}

function VideoItem({ url, author }) {

  return (
    <li className="level is-mobile">
      <div className="level-left">
        <div className="level-item is-size-6">{i18n.getMessage('storyAuthor', author)}</div>
      </div>
      <div className="level-right">
        <div className="level-item">
          <div className="buttons">
            <button type="button" className="button" title={i18n.getMessage('download')} onClick={download}>
              <span className="icon is-small">
                <i className="icon-download"></i>
              </span>
            </button>
            <a href={url} className="button" title={i18n.getMessage('openLink')} rel="noopener noreferrer" target="_blank">
              <span className="icon is-small">
                <i className="icon-external-link"></i>
              </span>
            </a>
          </div>
        </div>
      </div>
    </li>
  );

  async function download() {

    try {
      await downloads.download({
        url,
        saveAs: true,
      });
    }
    catch (err) { console.assert('production' === ENV, err); }
  }
}

function NoVideo({ isStoryOpened }) { return <p className="has-text-centered is-size-6" dangerouslySetInnerHTML={{ __html: i18n.getMessage(isStoryOpened ? 'retrievingVideo' : 'noVideo') }} />; }

function HelpText() {
  return <p className="has-text-info-dark is-size-6 mb-3">{i18n.getMessage('notifVideoList')}</p>;
}

export default VideoList;