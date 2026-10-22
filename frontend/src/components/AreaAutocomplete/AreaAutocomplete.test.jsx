import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AreaAutocomplete from './AreaAutocomplete';
import { searchAreas } from '../../api/areas';

vi.mock('../../api/areas', () => ({ searchAreas: vi.fn() }));

const AREAS = [
  { id: 'p1', name: 'Nafplio', secondaryText: 'Ελλάδα' },
  { id: 'p2', name: 'Nafpliou', secondaryText: 'Αθήνα, Ελλάδα' },
];

/** Renders the component with real state, like the form does. */
function setup() {
  const onChange = vi.fn();
  function Wrapper() {
    const [value, setValue] = useState(null);
    return (
      <AreaAutocomplete
        value={value}
        onChange={(area) => {
          setValue(area);
          onChange(area);
        }}
      />
    );
  }
  render(<Wrapper />);
  return { onChange, user: userEvent.setup(), input: screen.getByRole('combobox') };
}

beforeEach(() => {
  searchAreas.mockReset();
  searchAreas.mockResolvedValue(AREAS);
});

describe('AreaAutocomplete', () => {
  it('does not search before 3 characters', async () => {
    const { user, input } = setup();
    await user.type(input, 'na');
    await new Promise((r) => setTimeout(r, 400)); // longer than the debounce
    expect(searchAreas).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows suggestions after 3 characters, with one debounced request', async () => {
    const { user, input } = setup();
    await user.type(input, 'nafp');
    expect(await screen.findByRole('option', { name: /^Nafplio\s*Ελλάδα$/ })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(searchAreas).toHaveBeenCalledTimes(1);
    expect(searchAreas).toHaveBeenCalledWith('nafp', expect.any(AbortSignal));
  });

  it('selects an option with the mouse and passes its id (placeId)', async () => {
    const { user, input, onChange } = setup();
    await user.type(input, 'naf');
    await user.click(await screen.findByRole('option', { name: /Nafpliou/ }));
    expect(onChange).toHaveBeenLastCalledWith(AREAS[1]);
    expect(input).toHaveValue('Nafpliou');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('selects an option with the keyboard', async () => {
    const { user, input, onChange } = setup();
    await user.type(input, 'naf');
    await screen.findAllByRole('option');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(AREAS[0]);
  });

  it('clears the selection when the text is edited', async () => {
    const { user, input, onChange } = setup();
    await user.type(input, 'naf');
    await user.click(await screen.findByRole('option', { name: /^Nafplio\s*Ελλάδα$/ }));
    await user.type(input, 'x');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('shows "No areas found" for an empty result', async () => {
    searchAreas.mockResolvedValue([]);
    const { user, input } = setup();
    await user.type(input, 'zzzz');
    expect(await screen.findByText('No areas found')).toBeInTheDocument();
  });

  it('shows the error message when the API fails', async () => {
    searchAreas.mockRejectedValue(new Error('Autocomplete service timed out'));
    const { user, input } = setup();
    await user.type(input, 'naf');
    expect(await screen.findByRole('alert')).toHaveTextContent('Autocomplete service timed out');
  });
});
