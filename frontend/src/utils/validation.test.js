import { validateAd } from './validation';
import { TITLE_MAX_LENGTH } from '../constants';

const VALID = {
  title: 'Nice house',
  adType: 'rent',
  propertyType: 'house',
  area: { id: 'p1', name: 'Nafplio' },
  price: '1500',
  size: '',
  bedrooms: '',
  description: '',
};

describe('validateAd', () => {
  it('returns no errors for a valid ad', () => {
    expect(validateAd(VALID)).toEqual({});
  });

  it('requires title, ad type, property type, area and price', () => {
    const errors = validateAd({ ...VALID, title: '  ', adType: '', propertyType: '', area: null, price: '' });
    expect(Object.keys(errors).sort()).toEqual(['adType', 'area', 'price', 'propertyType', 'title']);
  });

  it('rejects an area without an id', () => {
    expect(validateAd({ ...VALID, area: { name: 'Nafplio' } }).area).toBeDefined();
  });

  it('rejects a title that is too long', () => {
    expect(validateAd({ ...VALID, title: 'a'.repeat(TITLE_MAX_LENGTH + 1) }).title).toMatch(/up to/);
  });

  it('rejects a price of 0 and negative size or bedrooms', () => {
    const errors = validateAd({ ...VALID, price: '0', size: '-1', bedrooms: '-2' });
    expect(errors).toEqual({
      price: 'Enter a price greater than 0',
      size: 'Must be 0 or more',
      bedrooms: 'Must be 0 or more',
    });
  });
});
