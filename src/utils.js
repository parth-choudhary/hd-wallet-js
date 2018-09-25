import { find } from 'lodash';

import configs from './configs';

export const getConfig = code => find(configs, { code });
