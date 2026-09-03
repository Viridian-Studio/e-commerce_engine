import { generateOrderNumber, roundMoney, slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Ultras Skull Hoodie')).toBe('ultras-skull-hoodie');
  });

  it('strips accents and punctuation', () => {
    expect(slugify("Café Olé! 100% Cotton")).toBe('cafe-ole-100-cotton');
  });

  it('collapses repeated whitespace and trims dashes', () => {
    expect(slugify('  multiple   spaces  ')).toBe('multiple-spaces');
  });
});

describe('roundMoney', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundMoney(19.005)).toBe(19.01);
    expect(roundMoney(9.999)).toBe(10);
  });

  it('avoids classic floating point drift', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});

describe('generateOrderNumber', () => {
  it('uses the given prefix', () => {
    expect(generateOrderNumber('RET')).toMatch(/^RET-/);
  });

  it('defaults to ORD and is unique across calls', () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).toMatch(/^ORD-/);
    expect(a).not.toBe(b);
  });
});
