import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles/index.css';
import { aplicarTema } from './utils/tema';

// Aplica o tema salvo antes de renderizar, para não piscar a tela clara
aplicarTema();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
