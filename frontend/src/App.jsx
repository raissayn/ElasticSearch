import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import { SearchProvider } from './contexts/SearchContext';

function App() {
  return (
    <SearchProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </SearchProvider>
  );
}

export default App;
