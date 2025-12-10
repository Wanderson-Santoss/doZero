import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Importa o CSS do Bootstrap - necessário para react-bootstrap funcionar
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './index.css'; 
import './App.css'; // Importa os estilos globais
import 'bootstrap-icons/font/bootstrap-icons.css'; // Ícones


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);