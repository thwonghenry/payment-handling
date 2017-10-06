import React, { PureComponent } from 'react';
import Payment from 'payment';
import { processResponse } from '../utils/utils';
import { validateForm, fieldToName, errorMessageBuilder } from '../../share/paymentFormHandler';

class PaymentForm extends PureComponent {
    constructor() {
        super();
        this.inputRefs = {};
        this.state = {
            error: {}
        };
    }

    onSubmit = (event) => {
        event.preventDefault();
        const data = {};

        this.clearError();

        // extract the data
        for (let field in this.inputRefs) {
            let value = (this.inputRefs[field].value || '').trim();
            if (field === 'cardExpiry') {
                value = Payment.fns.cardExpiryVal(value);
            }
            data[field] = value;
        }

        const error = validateForm(data);
        if (error !== true) {
            this.setFieldError(error);
            return;
        }

        fetch('/payments', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(processResponse)
            .then((data) => console.log('done', data))
            .catch((error) => this.setFieldError(error));
    }

    clearError() {
        this.setState({ error: {} });
    }

    setFieldError(error) {
        this.setState({
            error: Object.assign({}, this.state.error, {
                [`${error.field}Error`]: `${errorMessageBuilder(error)}`
            })
        });
    }

    // save the input fields refs
    getRef = (ref) => {
        const name = ref.getAttribute('name');
        this.inputRefs[name] = ref;
    }

    // reset the associated input field error
    onChange = (event) => {
        const target = event.target;
        const name = target.getAttribute('name');
        this.setState({
            error: Object.assign({}, this.state.error, {
                [`${name}Error`]: ''
            })
        });
    }

    componentDidMount() {
        Payment.formatCardNumber(this.inputRefs.cardNumber);
        Payment.formatCardExpiry(this.inputRefs.cardExpiry);
        Payment.formatCardCVC(this.inputRefs.cardCvc);
    }

    renderFormGroup(field) {
        const error = this.state.error[`${field}Error`];
        const name = fieldToName[field];
        return (
            <div className={ `form-group ${error ? 'has-error' : ''}` }>
                <label className="control-label col-xs-12 col-sm-2" htmlFor={ field }>{ name }:</label>
                <div className="col-xs-12 col-sm-10">
                    <input className="form-control" type="text" name={ field } id={ field } placeholder={ name } ref={ this.getRef } required onChange={ this.onChange }/>
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
                { this.renderFormGroup('orderCustomer')}
                { this.renderFormGroup('orderPhone')}
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
                { this.renderFormGroup('cardHolder')}
                { this.renderFormGroup('cardNumber')}
                { this.renderFormGroup('cardExpiry')}
                { this.renderFormGroup('cardCvc')}
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