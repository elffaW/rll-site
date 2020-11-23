/* eslint-disable import/prefer-default-export */

/**
 * lookupTabNumByPath takes a string relative path and returns the tab number (or 0)
 * @param {string} path should come from the pathname property of react-router's useLocation hook
 *   it should start with a / and then optionally have a string after the / to denote the desired path
 */
const lookupTabNumByPath = (path) => {
  const pathLoc = `/${path.split('?')[0].split('/')[1]}`;
  switch (pathLoc) {
    case '/schedule':
      return 1;
    case '/teams':
      return 2;
    case '/players':
      return 3;
    case '/stats':
      return 4;
    case '/fantasy':
      return 5;
    case '/rules':
      return 6;
    case '/videos':
      return 7;
    default:
      return 0;
  }
};

export { lookupTabNumByPath };
