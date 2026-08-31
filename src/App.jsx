import { useState, useRef, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Popular from "./pages/Popular";
import Watch from "./pages/Watch";
import About from "./pages/About";
import Disclaimer from "./pages/Disclaimer";
import SearchModal from "./components/SearchModal";
import { useTMDB } from "./hooks/useTMDB";
import Footer from "./components/Footer";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const requestCounterRef = useRef(0);
  const { searchTMDB } = useTMDB();
  const navigate = useNavigate();

  const handleSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const currentRequest = ++requestCounterRef.current;
      setIsSearching(true);
      try {
        const results = await searchTMDB(query);
        if (currentRequest === requestCounterRef.current) {
          setSearchResults(results);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (currentRequest === requestCounterRef.current) {
          setSearchResults([]);
        }
      } finally {
        if (currentRequest === requestCounterRef.current) {
          setIsSearching(false);
        }
      }
    },
    [searchTMDB]
  );

  const handleItemClick = (item) => {
    if (item && item.id && (item.media_type || item.type)) {
      const type = item.media_type || item.type;
      navigate(`/watch?type=${type}&id=${item.id}`);
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const openSearch = (query = "") => {
    setInitialSearchQuery(query);
    setIsSearchOpen(true);
  };
  const closeSearch = () => {
    setIsSearchOpen(false);
    setInitialSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="App">
      <Navbar onOpenSearch={openSearch} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-shows" element={<TVShows />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/about" element={<About />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <Footer />

      {isSearchOpen && (
        <SearchModal
          searchResults={searchResults}
          onSearch={handleSearch}
          onClose={closeSearch}
          onItemClick={handleItemClick}
          isSearching={isSearching}
          initialQuery={initialSearchQuery}
        />
      )}
    </div>
  );
}

export default App;
