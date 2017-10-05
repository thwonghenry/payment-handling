import React, { PureComponent } from 'react';
import PaymentForm from './components/PaymentForm.jsx';

class App extends PureComponent {
    render() {
        return <div className="container">
            <h1>Payment Service</h1>
            <PaymentForm />
        </div>;
    }
}

export default App;