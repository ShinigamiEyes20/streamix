import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTMDB } from "./hooks/useTMDB";

const Home = lazy(() => import("./pages/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const Popular = lazy(() => import("./pages/Popular"));
const Watch = lazy(() => import("./pages/Watch"));
const About = lazy(() => import("./pages/About"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const MyList = lazy(() => import("./pages/MyList"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return <div className="route-skeleton" aria-label="Loading page"><span /><span /><span /></div>;
}

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const searchController = useRef(null);
  const { searchTMDB } = useTMDB();
  const navigate = useNavigate();

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return undefined;
    const updateConnection = () => setIsSlowNetwork(connection.saveData || ["slow-2g", "2g"].includes(connection.effectiveType));
    updateConnection();
    connection.addEventListener?.("change", updateConnection);
    return () => connection.removeEventListener?.("change", updateConnection);
  }, []);

  const handleSearch = useCallback(async (query) => {
    searchController.current?.abort();
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const controller = new AbortController();
    searchController.current = controller;
    setIsSearching(true);
    try {
      const results = await searchTMDB(query, { signal: controller.signal });
      if (!controller.signal.aborted) setSearchResults(results);
    } catch (error) {
      if (error.name !== "AbortError" && !controller.signal.aborted) setSearchResults([]);
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }, [searchTMDB]);

  const handleItemClick = (item) => {
    const type = item?.media_type || item?.type;
    if (item?.id && ["movie", "tv"].includes(type)) {
      navigate(`/watch?type=${type}&id=${item.id}`);
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };
  const openSearch = (query = "") => { setInitialSearchQuery(query); setIsSearchOpen(true); };
  const closeSearch = () => {
    searchController.current?.abort();
    setIsSearchOpen(false);
    setInitialSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <div className="App">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar onOpenSearch={openSearch} />
      {!isOnline && <p className="network-notice" role="status">You’re offline. Previously loaded titles may still be available.</p>}
      {isOnline && isSlowNetwork && <p className="network-notice" role="status">Slow connection detected. Images and results may take longer to load.</p>}
      <main id="main-content" className="app-main" tabIndex="-1">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/tv-shows" element={<TVShows />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/my-list" element={<MyList />} />
              <Route path="/about" element={<About />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      {isSearchOpen && <SearchModal searchResults={searchResults} onSearch={handleSearch} onClose={closeSearch} onItemClick={handleItemClick} isSearching={isSearching} initialQuery={initialSearchQuery} />}
    </div>
  );
}

export default App;
