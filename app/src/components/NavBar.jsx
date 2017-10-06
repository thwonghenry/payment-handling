import React, { PureComponent } from 'react';

class NavBar extends PureComponent {
    render() {
        const { currentRoute } = this.props;
        return (
            <nav className="navbar navbar-default">
                <div className="container">
                    <ul className="nav navbar-nav">
                        <li className={ currentRoute === '/' ? 'active' : '' }>
                            <a href="/">Payment Form</a>
                        </li>
                        <li className={ currentRoute === '/payment-check' ? 'active' : '' }>
                            <a href="/payment-check">Payment Check</a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

export default NavBar;