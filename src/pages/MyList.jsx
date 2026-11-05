import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePageMeta } from "../hooks/usePageMeta";

export default function MyList() {
  const navigate = useNavigate();
  const [saved, setSaved] = useLocalStorage("streamix:my-list", []);
  const [continueItems, setContinue] = useLocalStorage("streamix:continue", []);
  usePageMeta({ title: "My List", description: "Your saved movies and recently explored titles on Streamix." });

  const renderItems = (items, removable = false) => items.length ? <div className="saved-grid">{items.map((item) => <div className="saved-item" key={`${item.type}-${item.id}`}><MovieCard item={item} onClick={() => navigate(`/watch?type=${item.type}&id=${item.id}`)} />{removable && <button className="saved-remove" type="button" onClick={() => setSaved((current) => current.filter((entry) => !(entry.id === item.id && entry.type === item.type)))} aria-label={`Remove ${item.title || item.name} from My List`}>Remove from list</button>}</div>)}</div> : <p className="muted-copy">Nothing here yet. Open a title and add it to your list.</p>;

  return <div className="my-list-page"><p className="eyebrow">Your Streamix</p><h1>My List</h1><section className="details-section"><h2>Saved titles</h2>{renderItems(saved, true)}</section><section className="details-section"><h2>Continue exploring</h2>{continueItems.length ? <div className="saved-grid">{continueItems.map((item) => <MovieCard key={`${item.type}-${item.id}`} item={item} onClick={() => navigate(`/watch?type=${item.type}&id=${item.id}`)} />)}</div> : <p className="muted-copy">Titles you open will appear here for quick access.</p>}</section>{continueItems.length > 0 && <button className="clear-history" type="button" onClick={() => setContinue([])}>Clear recent titles</button>}</div>;
}
