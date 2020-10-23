import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/compat';
import { i18n } from 'webextension-polyfill';

import './style.scss';
import { defaultSettings } from '../../../config';
import storage from '../../../storage';

function Menu() {

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {

    (async () => {

      const _settings = await storage.get();

      setSettings(_settings);
    })();
  }, []);

  const content = [];
  const helpLink = 'https://github.com/shhlkien/fb-utils/issues/8';
  const subMenus = [{
    label: i18n.getMessage('menuLabelActivity'),
    items: [
      {
        label: i18n.getMessage('blockSeen'),
        value: 'block_seen',
        checked: settings.block_seen,
      },
      {
        label: i18n.getMessage('blockDeliveryReceipts'),
        value: 'block_delivery_receipts',
        checked: settings.block_delivery_receipts,
      },
      {
        label: i18n.getMessage('blockTypingIndicator'),
        value: 'block_typing_indicator',
        checked: settings.block_typing_indicator,
      },
      {
        label: i18n.getMessage('blockSeenStory'),
        value: 'block_seen_story',
        checked: settings.block_seen_story,
      },
    ],
  }, {
    label: i18n.getMessage('menuLabelPrivacy'),
    items: [
      {
        label: i18n.getMessage('blockFbPixel'),
        value: 'block_fb_pixel',
        checked: settings.block_fb_pixel,
      },
      {
        label: i18n.getMessage('removeTrackingParams'),
        value: 'remove_tracking_params',
        checked: settings.remove_tracking_params,
      },
    ],
  }, {
    label: i18n.getMessage('menuLabelOther'),
    items: [
      {
        label: i18n.getMessage('fixFont'),
        value: 'fix_font',
        checked: settings.fix_font,
      },
      {
        label: i18n.getMessage('stopUpNextVideo'),
        value: 'stop_up_next_video',
        checked: settings.stop_up_next_video,
      },
      {
        label: i18n.getMessage('removeSponsoredAd'),
        value: 'remove_sponsored_ad',
        checked: settings.remove_sponsored_ad,
        helpLink,
      },
      // {
      //   label: i18n.getMessage('removeSuggestedPosts'),
      //   value: 'remove_suggested_for_u',
      //   checked: settings.remove_suggested_for_u,
      //   helpLink,
      // },
      // {
      //   label: i18n.getMessage('removePeopleUMayKnow'),
      //   value: 'remove_people_u_may_know',
      //   checked: settings.remove_people_u_may_know,
      //   helpLink,
      // },
    ],
  }];

  for (let i = 0; i < subMenus.length; i++) {

    const { label, items } = subMenus[i];
    const menuItems = [];

    for (let j = 0; j < items.length; j++) {

      menuItems.push(<Checkbox {...items[j]} key={items[j].value} />);
    }

    content.push(<SubMenu label={label} key={label}>{menuItems}</SubMenu>);
  }

  return (
    <div className="menu has-scrollbar">
      {content}
      <p className="is-size-7 has-text-danger mt-4">{i18n.getMessage('caution')}</p>
    </div>
  );
}

function SubMenu({ label, children }) {

  return (
    <Fragment>
      <p className="menu-label">{label}</p>
      <ul className="menu-list m-0">{children}</ul>
    </Fragment>
  );
}

function Checkbox({ label, value, checked, helpLink }) {

  return (
    <li>
      <label className="checkbox">
        <input type="checkbox" className="option" value={value} checked={checked} onChange={onChange} />
        <span className="checkbox-pseudo"></span>
        <span>
          {label}
          {helpLink && <a href={helpLink} className="p-0 pl-2 has-text-link" target="_blank" rel="noopener noreferrer">{i18n.getMessage('helpLink')}</a>}
        </span>
      </label>
    </li>
  );

  function onChange(e) {

    const { checked: _checked, value: _value } = e.target;

    e.target.parentNode.classList.toggle('is-checked');
    storage.save({ [_value]: _checked });
  }
}

export default Menu;