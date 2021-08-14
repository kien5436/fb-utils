import { Fragment, h, render } from 'preact';

import './popup.scss';
import Footer from './components/footer';
import Menu from './components/menu';

function App() {

  return (
    <Fragment>
      <Menu />
      <Footer />
    </Fragment >
  );
}

render(<App />, document.body);