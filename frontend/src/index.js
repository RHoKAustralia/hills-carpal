import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createRoutes } from './routes';

const routes = createRoutes();

ReactDOM.render(routes, document.getElementById('root'));
registerServiceWorker();
