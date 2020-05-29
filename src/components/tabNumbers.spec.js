import { lookupTabNumByPath } from './utils/tabHelper';

describe('Tab Helper', () => {
  describe('lookupTabNumByPath', () => {
    it('returns 0 for root path', () => {
      const path = '/';
      const expectedReturn = 0;

      // assert
      expect(lookupTabNumByPath(path)).toEqual(expectedReturn);
    });

    it('returns 4 for players path', () => {
      const path = '/players';
      const expectedReturn = 4;

      // assert
      expect(lookupTabNumByPath(path)).toEqual(expectedReturn);
    });

    it('returns 5 for teams path', () => {
      const path = '/teams';
      const expectedReturn = 5;

      // assert
      expect(lookupTabNumByPath(path)).toEqual(expectedReturn);
    });

    it('returns 6 for videos path', () => {
      const path = '/videos';
      const expectedReturn = 6;

      // assert
      expect(lookupTabNumByPath(path)).toEqual(expectedReturn);
    });

    it('returns 0 for invalid path', () => {
      const path = '/foaijw293j98a9f';
      const expectedReturn = 0;

      // assert
      expect(lookupTabNumByPath(path)).toEqual(expectedReturn);
    });

    it('returns 3 for stats path with extra path info', () => {
      const path = '/stats/players/kawa?season=9';
      const expectedReturn = 3;

      // assert
      expect(lookupTabNumByPath(path)).toEqual(expectedReturn);
    });
  });
});
