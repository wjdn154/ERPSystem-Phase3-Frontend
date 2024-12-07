import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GoogleLoginButton from './LoginPage.jsx';
import GoogleCallback from './Callback.jsx';
import CompanySelection from './CompanySelection';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<GoogleLoginButton />} />
                <Route path="/callback" element={<GoogleCallback />} />
                <Route path="/company-selection" element={<CompanySelection />} />
            </Routes>
        </Router>
    );
};

export default App;
