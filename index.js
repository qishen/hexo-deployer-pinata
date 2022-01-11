/* global hexo */
'use strict';

hexo.extend.deployer.register('pinata', require('./lib/deployer'));

// import { deployer } from './lib/deployer'

// const pinata_deployer = import('./lib/deployer').then(deployer => {
// 	console.log(deployer);
// 	hexo.extend.deployer.register('pinata', deployer);
// }).catch(err => {
// 	console.log(err);
// });
