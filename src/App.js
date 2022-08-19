import { withAuthenticator } from 'aws-amplify-react';
import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Index from './page/Index';
import Page1 from './page/Page1';
import Page2 from './page/Page2';
import NotFound from './page/NotFound';


class App extends Component {

    render() {
        return (
            <BrowserRouter>
                <Route exact path='/' component={Index} />
                <Route exact path='/page1' component={Page1} />
                <Route exact path='/page1' component={Page2} />
                <Route component={NotFound} />
            </BrowserRouter>
        );
    }
}

export default withAuthenticator(App);
