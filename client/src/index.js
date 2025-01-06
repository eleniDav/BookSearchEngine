import React from 'react';
import ReactDOM from 'react-dom/client';
import NavBar from './navBar';
import Content from './content';
import Footer from './footer';
import './css/home.css';
import About from './aboutPage';
import API from './apiPage';
import ErrorPage from './errorPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename='/~iee2019034/Bookie'>
      <NavBar />
    
      <Routes>
          <Route path='/about' element={<About />} />
          <Route path='/api' element={<API />} />
          <Route path='/*' element={<ErrorPage />} />
          <Route path='/' element={<Content />} />
      </Routes>
      
      <Footer />
    </BrowserRouter>
  </React.StrictMode>
);