import React, { PureComponent } from 'react';
import NavBar from './components/NavBar.jsx';
import PaymentFormPage from './pages/PaymentFormPage.jsx';
import PaymentCheckPage from './pages/PaymentCheckPage.jsx';
import PaymentAuthorizedPage from './pages/PaymentAuthorizedPage.jsx';

const currentRoute = window.location.pathname;

const routes = {
    '/': PaymentFormPage,
    '/payment-check': PaymentCheckPage,
    '/payment-authorized': PaymentAuthorizedPage
};

class App extends PureComponent {
    render() {
        const Page = routes[currentRoute];
        return <div className="container">
            <NavBar currentRoute={ currentRoute } />
            <Page />
        </div>;
    }
}

export default App;