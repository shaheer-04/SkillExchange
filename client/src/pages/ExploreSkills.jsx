import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getListings } from '../services/api';
import SkillCard from '../components/SkillCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const DEFAULTS = { search: '', category: 'All', type: 'All', mode: 'All' };

export default function ExploreSkills() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    type: searchParams.get('type') || 'All',
    mode: searchParams.get('mode') || 'All',
  });
  const [searchText, setSearchText] = useState(filters.search);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (active) => {
    setLoading(true);
    setError('');
    try {
      const data = await getListings(active);
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);

    // keep the URL shareable
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== 'All') params[k] = v;
    });
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, load]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'All' ||
    filters.type !== 'All' ||
    filters.mode !== 'All';

  const clearAll = () => {
    setSearchText('');
    setFilters(DEFAULTS);
  };

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Explore Skills</h1>
        <p className="muted">
          Browse what other students in Peshawar can teach and what they want to learn.
        </p>
      </header>

      <SearchBar
        value={searchText}
        onChange={setSearchText}
        onSubmit={() => setFilters({ ...filters, search: searchText.trim() })}
      />

      <FilterBar
        filters={filters}
        onChange={(next) => setFilters(next)}
        onClear={clearAll}
        hasActiveFilters={hasActiveFilters}
      />

      {loading && <Loading message="Loading listings..." />}

      {!loading && error && <ErrorMessage error={error} onRetry={() => load(filters)} />}

      {!loading && !error && (
        <>
          <p className="result-count">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
          </p>

          {listings.length === 0 ? (
            <div className="empty">
              <h3>No skill listings found.</h3>
              <p className="muted">
                Try a different search word, or clear the filters to see everything.
              </p>
              {hasActiveFilters && (
                <button type="button" className="btn btn-outline" onClick={clearAll}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-3">
              {listings.map((listing) => (
                <SkillCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
