import React, { PureComponent } from 'react';
import ReactLoading from 'react-loading';

class SubmitButton extends PureComponent {
    render() {
        const { loading } = this.props;
        return (
            <button className="btn btn-default" disabled={ loading ? true : false } >
                <span style={{
                    display: 'inline-block',
                    verticalAlign: 'middle'
                }}>Submit</span>
                { 
                    loading && <span style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        marginLeft: 5
                    }}>
                        <ReactLoading height={ 12 } width={ 12 } />
                    </span>
                }
            </button>
        );
    }
}

export default SubmitButton;