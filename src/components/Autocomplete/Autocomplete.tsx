import React, { useEffect, useRef, useState } from 'react';
import { Person } from '../../types/Person';

interface Props {
  people: Person[];
  onSelect: (person: Person | null) => void;
  delay?: number;
}

export const Autocomplete: React.FC<Props> = ({
  people,
  onSelect,
  delay = 300,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [prevSearch, setPrevSearch] = useState('');
  const debounceRef = useRef<number>();

  useEffect(() => {
    if (inputValue.trim() === prevSearch.trim()) {
      return;
    }

    window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      setPrevSearch(inputValue);

      if (!inputValue.trim()) {
        setSuggestions(people);
      } else {
        const lower = inputValue.toLowerCase();
        const filtered = people.filter(p =>
          p.name.toLowerCase().includes(lower),
        );

        setSuggestions(filtered);
      }

      setIsOpen(true);
    }, delay);

    return () => {
      window.clearTimeout(debounceRef.current);
    };
  }, [inputValue, people, delay, prevSearch]);

  const handleSelect = (person: Person) => {
    setInputValue(person.name);
    onSelect(person);
    setIsOpen(false);
  };

  const handleChange = (value: string) => {
    setInputValue(value);
    onSelect(null);
  };

  return (
    <div className={`dropdown ${isOpen ? 'is-active' : ''}`}>
      <div className="dropdown-trigger">
        <input
          type="text"
          placeholder="Enter a part of the name"
          className="input"
          value={inputValue}
          onFocus={() => {
            if (!inputValue.trim()) {
              setSuggestions(people);
              setIsOpen(true);
            }
          }}
          onChange={e => handleChange(e.target.value)}
          data-cy="search-input"
        />
      </div>

      {isOpen && (
        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {suggestions.length > 0 ? (
              suggestions.map(person => (
                <div
                  key={person.slug}
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onClick={() => handleSelect(person)}
                >
                  <p className="has-text-link">{person.name}</p>
                </div>
              ))
            ) : (
              <div
                className="notification is-danger is-light mt-3"
                role="alert"
                data-cy="no-suggestions-message"
              >
                <p className="has-text-danger">No matching suggestions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
