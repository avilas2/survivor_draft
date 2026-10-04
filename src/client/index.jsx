import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './Home';
import './app.css'; // Make sure you have basic tailwind/css setup here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
