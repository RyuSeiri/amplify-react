import React from 'react';
import ReactDOM from 'react-dom';
import Amplify from "aws-amplify";                   
import './index.css';
import './App.css';
import App from './App';
import ErrorBoundary from './page/errorboundary';
import config from "./aws-exports";                  
Amplify.configure(config);                          

ReactDOM.render(<ErrorBoundary><App /></ErrorBoundary>, document.getElementById('root'));
