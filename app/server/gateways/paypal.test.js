import { paymentFormToRequestData, responseToRecordData } from './paypal';
import { transformedValidForm } from '../../share/validTestForm';

jest.mock('paypal-rest-sdk');

const mockResponse = {
    'id':'PAY-2MP15959W3386433DLHPDMBQ',
    'create_time':'2017-10-11T15:17:26Z',
    'update_time':'2017-10-11T15:17:31Z',
    'state':'approved',
    'intent':'sale',
    'payer':{
        'payment_method':'credit_card',
        'funding_instruments':[
            {
                'credit_card':{
                    'type':'visa',
                    'number':'xxxxxxxxxxxx9879',
                    'expire_month':'11',
                    'expire_year':'2022'
                }
            }
        ]
    },
    'transactions':[
        {
            'amount':{
                'total':'3.99',
                'currency':'USD',
                'details':{
                    'subtotal':'3.99'
                }
            },
            'description':'Payment description',
            'related_resources':[
                {
                    'sale':{
                        'id':'6HG74857YE6707140',
                        'create_time':'2017-10-11T15:17:26Z',
                        'update_time':'2017-10-11T15:17:31Z',
                        'amount':{
                            'total':'3.99',
                            'currency':'USD'
                        },
                        'state':'completed',
                        'parent_payment':'PAY-2MP15959W3386433DLHPDMBQ',
                        'links':[
                            {
                                'href':'https://api.sandbox.paypal.com/v1/payments/sale/6HG74857YE6707140',
                                'rel':'self',
                                'method':'GET'
                            },
                            {
                                'href':'https://api.sandbox.paypal.com/v1/payments/sale/6HG74857YE6707140/refund',
                                'rel':'refund',
                                'method':'POST'
                            },
                            {
                                'href':'https://api.sandbox.paypal.com/v1/payments/payment/PAY-2MP15959W3386433DLHPDMBQ',
                                'rel':'parent_payment',
                                'method':'GET'
                            }
                        ],
                        'fmf_details':{

                        },
                        'processor_response':{
                            'avs_code':'X',
                            'cvv_code':'M'
                        }
                    }
                }
            ]
        }
    ],
    'links':[
        {
            'href':'https://api.sandbox.paypal.com/v1/payments/payment/PAY-2MP15959W3386433DLHPDMBQ',
            'rel':'self',
            'method':'GET'
        }
    ]
};

test('payment formorm to request data mapping is correct', () => {
    expect(paymentFormToRequestData(transformedValidForm)).toEqual({
        intent: 'sale',
        payer: {
            payment_method: 'credit_card',
            funding_instruments: [{
                credit_card: {
                    number: transformedValidForm.cardNumber.replace(/ /g, ''),
                    type: transformedValidForm.cardType,
                    expire_month: transformedValidForm.cardExpiry.month,
                    expire_year: transformedValidForm.cardExpiry.year
                }
            }]
        },
        transactions: [{
            amount: {
                total: transformedValidForm.orderPrice,
                currency: transformedValidForm.orderCurrency
            },
            description: 'Payment description'
        }]
    });
});

test('response data to payment record mapping is correct', () => {
    expect(responseToRecordData(mockResponse)).toEqual({
        paymentID: 'PAY-2MP15959W3386433DLHPDMBQ',
        gateway: 'paypal',
        response: mockResponse
    });
});