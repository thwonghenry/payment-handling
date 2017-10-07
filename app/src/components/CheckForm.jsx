import React, { PureComponent } from 'react';
import { processResponse } from '../utils/utils';
import { fieldToName } from '../../share/paymentFormHandler';
import ReactLoading from 'react-loading';
import Modal from 'react-modal';

class CheckForm extends PureComponent {
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

    onSubmit = async (event) => {
        event.preventDefault();
        if (this.state.submitting) {
            return;
        }
        const data = {};

        this.clearError();

        // extract the data
        for (let field in this.inputRefs) {
            let value = (this.inputRefs[field].value || '').trim();
            data[field] = value;
            if (!value) {
                this.setFieldError({
                    field,
                    reason: 'Cannot be empty'
                });
            }
        }

        this.setState({ submitting: true });

        try {
            const response = await fetch(`/payments/${data.paymentID}?orderCustomer=${encodeURI(data.orderCustomer)}`);
            const responseData = await processResponse(response);
            this.setState({ record: responseData });
            this.setState({ openModal: true });
            this.setState({ submitting: false });
        } catch (error) {
            this.setFieldError(error);
            this.setState({ submitting: false });
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
                [`${error.field}Error`]: error.reason
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

    renderFormGroup(field) {
        const error = this.state.error[`${field}Error`];
        const name = fieldToName[field] || 'Payment ID';
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
                { this.renderFormGroup('orderCustomer')}
                { this.renderFormGroup('paymentID')}
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
                                <h2>Check Failure</h2>
                                <p>There is something wrong.</p>
                                <p>{ this.state.generalError }</p>
                                <p>Please check the customer name or payment ID is correct and match</p>
                            </div>)
                        }
                        {
                            !this.state.generalError && this.state.record && (<div className="container">
                                <h2>Payment Record</h2>
                                <p>
                                    <strong>Customer Name: </strong>
                                    { this.state.record.orderCustomer }
                                </p>
                                <p>
                                    <strong>Customer Phone Number: </strong>
                                    { this.state.record.orderPhone }
                                </p>
                                <p>
                                    <strong>Price: </strong>
                                    { this.state.record.orderPrice }
                                </p>
                                <p>
                                    <strong>Currency: </strong>
                                    { this.state.record.orderCurrency }
                                </p>
                            </div>)
                        }
                    </div>
                </Modal>
            </form>
        );
    }
}

export default CheckForm;