import React, { PureComponent } from 'react';
import Payment from 'payment';
import { processResponse } from '../utils/utils';
import { validateForm, fieldToName, errorMessageBuilder } from '../../share/paymentFormHandler';
import ReactLoading from 'react-loading';
import Modal from 'react-modal';

class PaymentForm extends PureComponent {
    constructor() {
        super();
        this.inputRefs = {};
        this.state = {
            error: {},
            submitting: false,
            openModal: false,
            paymentID: ''
        };
    }

    onSubmit = (event) => {
        event.preventDefault();
        if (this.state.submitting) {
            return;
        }
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

        this.setState({ submitting: true });

        fetch('/payments', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(processResponse)
            .then((data) => {
                this.resetFields();
                this.setState({ paymentID: data.paymentID });
                this.setState({ openModal: true });
                this.setState({ submitting: false });
            })
            .catch((error) => {
                this.setFieldError(error);
                this.setState({ submitting: false });
            });
    }

    resetFields() {
        for (let field in this.inputRefs) {
            this.inputRefs[field].value = '';
        }
    }

    closeModal = () => {
        this.setState({ openModal: false });
        this.setState({ generalError: '' });
    }

    clearError() {
        this.setState({ error: {} });
    }

    setFieldError(error) {
        if (error.field === 'general') {
            this.setState({ openModal: true });
            this.setState({
                generalError: error.reason
            });
            return;
        }
        this.setState({
            error: {
                ...this.state.error,
                [`${error.field}Error`]: errorMessageBuilder(error)
            }
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
            error: {
                ...this.state.error,
                [`${name}Error`]: ''
            }
        });
    }

    componentDidMount() {
        Payment.formatCardNumber(this.inputRefs.cardNumber);
        Payment.formatCardExpiry(this.inputRefs.cardExpiry);
        Payment.formatCardCVC(this.inputRefs.cardCvc);
    }

    renderFormGroup(field, type = 'text') {
        const error = this.state.error[`${field}Error`];
        const name = fieldToName[field];
        return (
            <div className={ `form-group ${error ? 'has-error' : ''}` }>
                <label className="control-label col-xs-12 col-sm-2" htmlFor={ field }>{ name }:</label>
                <div className="col-xs-12 col-sm-10">
                    <input className="form-control" type={ type } name={ field } id={ field } placeholder={ name } ref={ this.getRef } required onChange={ this.onChange }/>
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
                { this.renderFormGroup('orderPhone', 'tel')}
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
                        <button className="btn btn-default" disabled={ this.state.submitting ? true : false } >
                            <span style={{
                                display: 'inline-block',
                                verticalAlign: 'middle'
                            }}>Submit</span>
                            { 
                                this.state.submitting && <span style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    marginLeft: 5
                                }}>
                                    <ReactLoading height={ 12 } width={ 12 } />
                                </span>
                            }
                        </button>
                        <span style={{
                            color: '#e74c3c',
                            marginLeft: 20
                        }}>
                            { this.state.generalError }
                        </span>
                    </div>
                </div>
                <Modal
                    isOpen={ this.state.openModal }
                    onRequestClose={ this.closeModal }
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)'
                        },
                        content: {
                            padding: 40,
                            border: 'none'
                        }
                    }}
                    className={{
                        base: `alert ${this.state.generalError ? 'alert-danger' : 'alert-success'}`
                    }}
                >
                    <div>
                        {
                            this.state.generalError && (<div className="container">
                                <h2>Payment Failure</h2>
                                <p>There is something wrong.</p>
                                <p>{ this.state.generalError }</p>
                                <p>Please try with different card.</p>
                            </div>)
                        }
                        {
                            !this.state.generalError && (<div className="container">
                                <h2>Payment success</h2>
                                <p>The order ID: <strong>{ this.state.paymentID }</strong></p>
                                <p>Please remember the order ID for future reference</p>
                            </div>)
                        }
                    </div>
                </Modal>
            </form>
        );
    }
}

export default PaymentForm;