import { useEffect, useRef, useState } from 'react';
import { searchAreas } from '../../api/areas';
import { useDebounce } from '../../hooks/useDebounce';
import { MIN_AREA_CHARS } from '../../constants';
import './AreaAutocomplete.css';

/**
 * Address/area input with suggestions from the autocomplete API.
 * - Searches after MIN_AREA_CHARS characters, debounced.
 * - Only a value picked from the list counts as selected (gives us the id).
 *
 * @param {{id: string, name: string} | null} value - currently selected area
 * @param {(area: object | null) => void} onChange - called on select / clear
 * @param {string} [error] - validation error (for aria-invalid)
 * @param {string} [id] - input id, used by the <label htmlFor>
 */
export default function AreaAutocomplete({ value, onChange, error, id = 'area' }) {
  const [inputText, setInputText] = useState(value?.name ?? '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  // Name of the option the user picked; used to avoid searching again for it
  const selectedNameRef = useRef(null);
  const debounced = useDebounce(inputText.trim(), 300);

  useEffect(() => {
    if (debounced.length < MIN_AREA_CHARS || debounced === selectedNameRef.current) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setFetchError('');

    searchAreas(debounced, controller.signal)
      .then((data) => {
        setOptions(data);
        setHighlighted(-1);
        setIsOpen(true);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setOptions([]);
        setFetchError(err.message || 'Could not load areas');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // If the user keeps typing, cancel this request so an old response
    // can't replace newer results.
    return () => controller.abort();
  }, [debounced]);

  function handleInputChange(e) {
    const text = e.target.value;
    setInputText(text);
    selectedNameRef.current = null;
    if (value) onChange(null); // text was edited → previous selection no longer valid
    if (text.trim().length < MIN_AREA_CHARS) setIsOpen(false);
  }

  function selectOption(option) {
    selectedNameRef.current = option.name;
    setInputText(option.name);
    setOptions([]);
    setIsOpen(false);
    onChange(option);
  }

  function handleKeyDown(e) {
    if (!isOpen || options.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault(); // don't submit the form
      selectOption(options[highlighted]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  const listId = `${id}-listbox`;
  const showList = isOpen && inputText.trim().length >= MIN_AREA_CHARS;

  return (
    <div className="autocomplete">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={highlighted >= 0 ? `${id}-option-${highlighted}` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        placeholder={`Type at least ${MIN_AREA_CHARS} characters`}
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => options.length > 0 && setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      />

      {loading && <span className="autocomplete__status">Searching…</span>}
      {fetchError && <p className="field-error" role="alert">{fetchError}</p>}

      {showList && (
        <ul id={listId} role="listbox" className="autocomplete__list">
          {options.length === 0 && !loading ? (
            <li className="autocomplete__empty">No areas found</li>
          ) : (
            options.map((option, i) => (
              <li
                key={option.id}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === highlighted}
                className={`autocomplete__option${i === highlighted ? ' is-highlighted' : ''}`}
                // mousedown fires before the input's blur, so the click isn't lost
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option);
                }}
              >
                <span className="autocomplete__name">{option.name}</span>
                {option.secondaryText && (
                  <span className="autocomplete__secondary">{option.secondaryText}</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
