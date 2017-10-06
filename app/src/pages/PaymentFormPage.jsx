import React, { PureComponent } from 'react';
import PaymentForm from '../components/PaymentForm.jsx';

class PaymentFormPage extends PureComponent {
    render() {
        return (
            <div>
                <h1>Payment Form</h1>
                <PaymentForm />
            </div>
        );
    }
}

export default PaymentFormPage;