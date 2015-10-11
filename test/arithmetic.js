import chai from 'chai';
import Calculator from '../src/index.js';

const expect = chai.expect;

describe('Arithmetic', () => {
  it('has commutative addition', () => {
    const x = 10;
    const y = 20;
    expect(Calculator.add(x, y)).to.equal(Calculator.add(y, x));
  });
});