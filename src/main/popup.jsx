import { Fragment, h, render } from 'preact';
import { i18n } from 'webextension-polyfill';

import './popup.scss';
import { Tab, Tabs } from './components/tabs';
import Footer from './components/footer';
import Menu from './components/menu';
import VideoList from './components/video-list';

function App() {

  return (
    <Fragment>
      <Tabs>
        <Tab label={i18n.getMessage('tabOptions')} icon="icon-tasks">
          <Menu />
        </Tab>
        <Tab label={i18n.getMessage('tabDownload')} icon="icon-download">
          <VideoList />
        </Tab>
      </Tabs>
      <Footer />
    </Fragment >
  );
}

render(<App />, document.body);