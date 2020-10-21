import { h } from 'preact';
import { i18n } from 'webextension-polyfill';

import './style.scss';

function Footer() {

  return (
    <footer className="footer">
      <div className="content has-text-centered is-size-6">
        <a className="has-text-link" href="https://addons.mozilla.org/en-US/firefox/addon/facebook-utils">{i18n.getMessage('rate')}</a>
        <a className="has-text-link" href="https://github.com/shhlkien/fb-utils/issues">{i18n.getMessage('bugReport')}</a>
      </div>
    </footer>
  );
}

export default Footer;