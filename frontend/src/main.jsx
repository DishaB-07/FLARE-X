import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tailwind.css';
import './styles/styles.css';
import './styles/readability.css';
import './styles/presentation.css';
import './styles/research-intelligence.css';
import './styles/workflow.css';
import './styles/si-workbench.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
);
