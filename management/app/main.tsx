import React from 'react';
import { createRoot } from 'react-dom/client';
import { ManagementApp } from '../src/ManagementApp';
import '../../frontend/src/index.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><ManagementApp/></React.StrictMode>);
