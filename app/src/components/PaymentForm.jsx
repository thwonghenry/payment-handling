import React, { PureComponent } from 'react';
import Payment from 'payment';

class PaymentForm extends PureComponent {
    constructor() {
        super();
        this.inputRefs = {};
        this.state = {};
    }

    onSubmit = (event) => {
        event.preventDefault();
        const data = {};
        const errors = {};
        let hasError = false;
        Object.keys(this.inputRefs).forEach((key) => {
            let error = '';
            let value = (this.inputRefs[key].value || '').trim();
            switch (key) {
            case 'cardNumber':
                if (!Payment.fns.validateCardNumber(value)) {
                    error = 'Card Number is invalid!';
                }
                value = value.replace(/ /g, '');
                break;
            case 'cardExpiry':
                if (!Payment.fns.validateCardExpiry(value)) {
                    error = 'Card Expiry is invalid!';
                }
                value = Payment.fns.cardExpiryVal(value);
                break;
            case 'cardCvc':
                if (!Payment.fns.validateCardCVC(value)) {
                    error = 'Card CVC is invalid!';
                }
                break;
            default:
                if (value.trim() === '') {
                    error = 'Cannot be empty!';
                }
            }
            if (error) {
                hasError = true;
                errors[`${key}Error`] = error;
            }
            data[key] = value;
        });

        if (hasError) {
            this.setState(errors);
            return;
        }
        fetch('/payment', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => console.log('done', data));
    }

    getRef = (ref) => {
        const name = ref.getAttribute('name');
        this.inputRefs[name] = ref;
    }

    onChange = (event) => {
        const target = event.target;
        const name = target.getAttribute('name');
        this.setState({
            [`${name}Error`]: ''
        });
    }

    componentDidMount() {
        Payment.formatCardNumber(this.inputRefs.cardNumber);
        Payment.formatCardExpiry(this.inputRefs.cardExpiry);
        Payment.formatCardCVC(this.inputRefs.cardCvc);
    }

    renderFormGroup(name, placeholder) {
        const error = this.state[`${name}Error`];
        return (
            <div className={ `form-group ${error ? 'has-error' : ''}` }>
                <label className="control-label col-xs-12 col-sm-2" htmlFor={ name }>{ placeholder }:</label>
                <div className="col-xs-12 col-sm-10">
                    <input className="form-control" type="text" name={ name } id={ name } placeholder={ placeholder } ref={ this.getRef } required onChange={ this.onChange }/>
                </div>
                {
                    error && <span className="col-xs-12 col-sm-offset-2 help-block">
                        { error }
                    </span>
                }
            </div>
        );
    }
    
    render() {
        return (
            <form onSubmit={ this.onSubmit } autoComplete="on" className="form-horizontal">
                <h2>Order</h2>
                { this.renderFormGroup('orderCustomer', 'Customer Name')}
                { this.renderFormGroup('orderPhone', 'Customer Phone Number')}
                <div className={ `form-group ${ this.state.orderCurrencyError ? 'has-error' : ''}` }>
                    <label className="control-label col-xs-12 col-sm-2" htmlFor="orderPrice">Price:</label>
                    <div className="col-xs-8 col-sm-8">
                        <input className="form-control" type="number" name="orderPrice" id="orderPrice" placeholder="Price" ref={ this.getRef } required onChange={ this.onChange } />
                    </div>
                    <div className="col-xs-4 col-sm-2">
                        <select className="form-control" name="orderCurrency" id="orderCurrency" required ref={ this.getRef } onChange={ this.onChange }>
                            <option value="HKD">HKD</option>
                            <option value="USD">USD</option>
                            <option value="AUD">AUD</option>
                            <option value="EUR">EUR</option>
                            <option value="JPY">JPY</option>
                            <option value="CNY">CNY</option>
                        </select>
                    </div>
                    {
                        this.state.orderCurrencyError && <span className="col-xs-12 col-sm-offset-2 help-block">
                            { this.state.orderCurrencyError }
                        </span>
                    }
                </div>
                
                <h2>Payment</h2>
                { this.renderFormGroup('cardHolder', 'Card Holder Name')}
                { this.renderFormGroup('cardNumber', 'Card Number')}
                { this.renderFormGroup('cardExpiry', 'Card Expiry')}
                { this.renderFormGroup('cardCvc', 'Card CVC')}
                <div className="form-group">
                    <div className="col-xs-12 col-sm-offset-2">
                        <button className="btn btn-default">Submit</button>
                    </div>
                </div>
            </form>
        );
    }
}

export default PaymentForm;