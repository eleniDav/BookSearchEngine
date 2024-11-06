import React from 'react';
import ReactDOM from 'react-dom/client';
import NavBar from './navBar';
import Content from './content';
import Footer from './footer';
import './css/home.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NavBar />
    <Content />
    <Footer />
  </React.StrictMode>
);