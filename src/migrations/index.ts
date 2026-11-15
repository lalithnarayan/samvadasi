import * as migration_20261115_142701_initial from './20261115_142701_initial';
import * as migration_20261115_143536_examples_review from './20261115_143536_examples_review';
import * as migration_20261115_143947_example_token from './20261115_143947_example_token';

export const migrations = [
  {
    up: migration_20261115_142701_initial.up,
    down: migration_20261115_142701_initial.down,
    name: '20261115_142701_initial',
  },
  {
    up: migration_20261115_143536_examples_review.up,
    down: migration_20261115_143536_examples_review.down,
    name: '20261115_143536_examples_review',
  },
  {
    up: migration_20261115_143947_example_token.up,
    down: migration_20261115_143947_example_token.down,
    name: '20261115_143947_example_token'
  },
];
