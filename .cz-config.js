'use strict';

module.exports = {

  types: [
    {value: ':sparkles: feat',            name: 'feat:     A new feature'},
    {value: ':bug: fix',                  name: 'fix:      A bug fix'},
    {value: ':books: docs',               name: 'docs:     Documentation only changes'},
    {value: ':lipstick: style',           name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)'},
    {value: ':wrench: refactor',          name: 'refactor: A code change that neither fixes a bug nor adds a feature'},
    {value: ':racehorse: perf',           name: 'perf:     A code change that improves performance'},
    {value: ':white_check_mark: test',    name: 'test:     Adding missing tests'},
    {value: ':cow2: chore',               name: 'chore:    Changes to the build process or auxiliary tools\n            and libraries such as documentation generation'},
    {value: ':bomb: revert',              name: 'revert:   Revert to a commit'},
    {value: ':construction: WIP',         name: 'WIP:      Work in progress'},
    {value: ':art: design',               name: 'design:   Updates to UI or UX'}
  ],

  allowBreakingChanges: [':sparkles: feat', ':bug: fix', ':racehorse: perf']

};
