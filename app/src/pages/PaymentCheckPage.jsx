import React, { PureComponent } from 'react';
import CheckForm from '../components/CheckForm.jsx';

class PaymentCheckPage extends PureComponent {
    render() {
        return (
            <div>
                <h1>Payment Check</h1>
                <CheckForm />
            </div>
        );
    }
}

export default PaymentCheckPage;