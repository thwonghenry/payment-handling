import { paymentFormToRequestData, responseToRecordData } from './braintree';
import { transformedValidForm } from '../../share/validTestForm';

jest.mock('braintree');

const mockResponse = {
    'transaction':{
        'id':'n8yxfkzm',
        'status':'submitted_for_settlement',
        'type':'sale',
        'currencyIsoCode':'HKD',
        'amount':'3.99',
        'merchantAccountId':'HKD',
        'subMerchantAccountId':null,
        'masterMerchantAccountId':null,
        'orderId':null,
        'createdAt':'2017-10-11T15:04:50Z',
        'updatedAt':'2017-10-11T15:04:50Z',
        'customer':{
            'id':null,
            'firstName':null,
            'lastName':null,
            'company':null,
            'email':null,
            'website':null,
            'phone':null,
            'fax':null
        },
        'billing':{
            'id':null,
            'firstName':null,
            'lastName':null,
            'company':null,
            'streetAddress':null,
            'extendedAddress':null,
            'locality':null,
            'region':null,
            'postalCode':null,
            'countryName':null,
            'countryCodeAlpha2':null,
            'countryCodeAlpha3':null,
            'countryCodeNumeric':null
        },
        'refundId':null,
        'refundIds':[

        ],
        'refundedTransactionId':null,
        'partialSettlementTransactionIds':[

        ],
        'authorizedTransactionId':null,
        'settlementBatchId':null,
        'shipping':{
            'id':null,
            'firstName':null,
            'lastName':null,
            'company':null,
            'streetAddress':null,
            'extendedAddress':null,
            'locality':null,
            'region':null,
            'postalCode':null,
            'countryName':null,
            'countryCodeAlpha2':null,
            'countryCodeAlpha3':null,
            'countryCodeNumeric':null
        },
        'customFields':'',
        'avsErrorResponseCode':null,
        'avsPostalCodeResponseCode':'I',
        'avsStreetAddressResponseCode':'I',
        'cvvResponseCode':'M',
        'gatewayRejectionReason':null,
        'processorAuthorizationCode':'V4N30D',
        'processorResponseCode':'1000',
        'processorResponseText':'Approved',
        'additionalProcessorResponse':null,
        'voiceReferralNumber':null,
        'purchaseOrderNumber':null,
        'taxAmount':null,
        'taxExempt':false,
        'creditCard':{
            'token':null,
            'bin':'444433',
            'last4':'1111',
            'cardType':'Visa',
            'expirationMonth':'12',
            'expirationYear':'2099',
            'customerLocation':'US',
            'cardholderName':'Test Holder',
            'imageUrl':'https://assets.braintreegateway.com/payment_method_logo/visa.png?environment=sandbox',
            'prepaid':'Unknown',
            'healthcare':'Unknown',
            'debit':'Unknown',
            'durbinRegulated':'Unknown',
            'commercial':'Unknown',
            'payroll':'Unknown',
            'issuingBank':'Unknown',
            'countryOfIssuance':'Unknown',
            'productId':'Unknown',
            'uniqueNumberIdentifier':null,
            'venmoSdk':false,
            'maskedNumber':'444433******1111',
            'expirationDate':'12/2099'
        },
        'statusHistory':[
            {
                'timestamp':'2017-10-11T15:04:50Z',
                'status':'authorized',
                'amount':'3.99',
                'user':'xxx@xxx.com',
                'transactionSource':'api'
            },
            {
                'timestamp':'2017-10-11T15:04:50Z',
                'status':'submitted_for_settlement',
                'amount':'3.99',
                'user':'xxx@xxx.com',
                'transactionSource':'api'
            }
        ],
        'planId':null,
        'subscriptionId':null,
        'subscription':{
            'billingPeriodEndDate':null,
            'billingPeriodStartDate':null
        },
        'addOns':[

        ],
        'discounts':[

        ],
        'descriptor':{
            'name':null,
            'phone':null,
            'url':null
        },
        'recurring':false,
        'channel':null,
        'serviceFeeAmount':null,
        'escrowStatus':null,
        'disbursementDetails':{
            'disbursementDate':null,
            'settlementAmount':null,
            'settlementCurrencyIsoCode':null,
            'settlementCurrencyExchangeRate':null,
            'fundsHeld':null,
            'success':null
        },
        'disputes':[

        ],
        'authorizationAdjustments':[

        ],
        'paymentInstrumentType':'credit_card',
        'processorSettlementResponseCode':'',
        'processorSettlementResponseText':'',
        'threeDSecureInfo':null,
        'hasLineItems':null,
        'paypalAccount':{

        },
        'coinbaseAccount':{

        },
        'applePayCard':{

        },
        'androidPayCard':{

        },
        'visaCheckoutCard':{

        },
        'masterpassCard':{

        }
    },
    'success':true
};

test('payment formorm to request data mapping is correct', () => {
    expect(paymentFormToRequestData(transformedValidForm)).toEqual({
        amount: transformedValidForm.orderPrice,
        merchantAccountId: transformedValidForm.orderCurrency,
        creditCard: {
            cardholderName: transformedValidForm.cardHolder,
            cvv: transformedValidForm.cardCvc,
            expirationMonth: transformedValidForm.cardExpiry.month,
            expirationYear: transformedValidForm.cardExpiry.year,
            number: transformedValidForm.cardNumber,
        },
        options: {
            submitForSettlement: true
        }
    });
});

test('response data to payment record mapping is correct', () => {
    expect(responseToRecordData(mockResponse)).toEqual({
        paymentID: 'n8yxfkzm',
        gateway: 'braintree',
        response: mockResponse
    });
});