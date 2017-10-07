import React, { PureComponent } from 'react';
import NavBar from './components/NavBar.jsx';
import PaymentFormPage from './pages/PaymentFormPage.jsx';
import PaymentCheckPage from './pages/PaymentCheckPage.jsx';

const currentRoute = window.location.pathname;

const routes = {
    '/': PaymentFormPage,
    '/payment-check': PaymentCheckPage
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