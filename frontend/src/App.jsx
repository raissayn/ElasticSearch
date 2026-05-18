import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import HomePage from './pages/HomePage';

function App() {
  return (
    <SearchProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </SearchProvider>
  );
}

export default App;
