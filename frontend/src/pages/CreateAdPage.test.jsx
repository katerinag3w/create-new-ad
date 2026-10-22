import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CreateAdPage from './CreateAdPage';
import { createAd } from '../api/ads';
import { searchAreas } from '../api/areas';

vi.mock('../api/ads', () => ({ createAd: vi.fn() }));
vi.mock('../api/areas', () => ({ searchAreas: vi.fn() }));

const AREA = { id: 'p1', name: 'Nafplio', secondaryText: 'Ελλάδα' };

function setup() {
  render(
    <MemoryRouter initialEntries={['/new']}>
      <Routes>
        <Route path="/new" element={<CreateAdPage />} />
        <Route path="/ads" element={<p>Ads page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

/** Fills every required field; picks the area from the suggestions. */
async function fillRequired(user) {
  await user.type(screen.getByLabelText(/title/i), '  Nice house  ');
  await user.selectOptions(screen.getByLabelText(/ad type/i), 'rent');
  await user.selectOptions(screen.getByLabelText(/property type/i), 'house');
  await user.type(screen.getByLabelText(/area/i), 'naf');
  await user.click(await screen.findByRole('option', { name: /Nafplio/ }));
  await user.type(screen.getByLabelText(/price/i), '1500');
}

beforeEach(() => {
  createAd.mockReset();
  searchAreas.mockReset();
  searchAreas.mockResolvedValue([AREA]);
});

describe('CreateAdPage', () => {
  it('shows errors for missing required fields and does not submit', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /create ad/i }));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Choose an ad type')).toBeInTheDocument();
    expect(screen.getByText('Choose a property type')).toBeInTheDocument();
    expect(screen.getByText('Please select an area from the list')).toBeInTheDocument();
    expect(screen.getByText('Enter a price greater than 0')).toBeInTheDocument();
    expect(createAd).not.toHaveBeenCalled();
  });

  it('requires an area picked from the list, not just typed text', async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/area/i), 'Nafplio');
    await user.click(screen.getByRole('button', { name: /create ad/i }));
    expect(screen.getByText('Please select an area from the list')).toBeInTheDocument();
    expect(createAd).not.toHaveBeenCalled();
  });

  it('keeps only digits in the price', async () => {
    const user = setup();
    const price = screen.getByLabelText(/price/i);
    await user.type(price, '1e2-3.4');
    expect(price).toHaveValue('1234');
  });

  it('submits the ad with the placeId and goes to the ads page', async () => {
    createAd.mockResolvedValue({});
    const user = setup();
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /create ad/i }));

    expect(createAd).toHaveBeenCalledWith({
      title: 'Nice house',
      adType: 'rent',
      propertyType: 'house',
      area: { id: 'p1', name: 'Nafplio' },
      price: 1500,
      size: undefined,
      bedrooms: undefined,
      description: '',
    });
    expect(await screen.findByText('Ads page')).toBeInTheDocument();
  });

  it('shows the error and field errors returned by the backend', async () => {
    const err = Object.assign(new Error('Validation failed'), {
      errors: { area: 'Please select an area from the list' },
    });
    createAd.mockRejectedValue(err);
    const user = setup();
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /create ad/i }));

    expect(await screen.findByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('Please select an area from the list')).toBeInTheDocument();
    expect(screen.queryByText('Ads page')).not.toBeInTheDocument();
  });
});
