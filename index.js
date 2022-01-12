/* global hexo */
'use strict';

hexo.extend.deployer.register('pinata', require('./lib/deployer'));