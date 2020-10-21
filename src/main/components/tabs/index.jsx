import { Fragment, h } from 'preact';
import { useState } from 'preact/compat';

import './style.scss';

function Tabs({ children }) {

  if (!Array.isArray(children)) return null;

  const [activeTab, setActiveTab] = useState(children[0].props.label);
  const tabs = [];
  const contents = {};

  for (let i = 0; i < children.length; i++) {

    const { props: { label, children: content, icon } } = children[i];
    contents[label] = content;

    tabs.push({
      icon,
      isActive: activeTab === label,
      label,
    });
  }

  return (
    <Fragment>
      <div className="tabs m-0">
        <ul>
          {tabs.map(({ icon, label, isActive }) => (
            <li className={isActive ? 'is-active' : ''} id={label} onClick={changeContent} key={label}>
              <a>
                <span className="icon is-small">
                  <i className={icon}></i>
                </span>
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      {contents[activeTab]}
    </Fragment>
  );

  function changeContent(e) {

    const tab = e.target.closest('li').id;

    setActiveTab(tab);
  }
}

function Tab({ icon, label, children }) { return null; }

export { Tab, Tabs };