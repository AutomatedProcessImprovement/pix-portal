import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';

test('renders navbar title', () => {
    render(<App/>);
    const navbarTitle = screen.getByText(/Kronos/i);
    expect(navbarTitle).toBeInTheDocument();
});