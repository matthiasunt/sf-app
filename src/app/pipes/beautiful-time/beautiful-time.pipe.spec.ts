import { BeautifulTimePipe } from './beautiful-time.pipe';

describe('BeautifulTimePipe', () => {
  it('create an instance', () => {
    const pipe = new BeautifulTimePipe();
    expect(pipe).toBeTruthy();
  });
});
