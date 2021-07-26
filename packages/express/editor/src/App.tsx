import { Editor } from '@quantform/editor-react-component';
import { ExpressMeasureProvider } from './measure-provider';

const App = () => {
  const url = decodeURIComponent(window.location.pathname).split('/');
  const session = Number(url[url.length - 1]);
  const descriptor = url[url.length - 2];

  const provider = new ExpressMeasureProvider(
    window.location.origin,
    session,
    descriptor
  );

  return <Editor provider={provider} />;
};

export default App;
