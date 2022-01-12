'use strict';

const all = require('it-all');
// const Promise = require('bluebird');
const chalk = require('chalk');
const pathFn = require('path');
const fs = require('hexo-fs');
const IPFSClient = require('ipfs-http-client');
const pinataSDK = require('@pinata/sdk');

module.exports = async (args) => {
	const ignoreHidden = args.ignore_hidden;
    const ignorePattern = args.ignore_pattern;

	function collectPaths(dir, files) {
		if (!files) files = [];

		fs.readdirSync(dir).forEach(file => {
			const filepath = pathFn.join(dir, file);
			const stat = fs.statSync(filepath);

			if (stat.isDirectory()) {
				if (ignoreHidden && file[0] === '.') return;
				if (ignorePattern && ignorePattern.test(file)) return;

				collectPaths(filepath, files);
			} else {
				files.push(filepath);
			}
		});

		return files;
	}

    let help = '';
    help += 'You have to configure the deployment settings in _config.yml first!\n\n';
    help += 'Example:\n';
    help += '  deploy:\n';
    help += '    type: pinata\n';
    help += '    host: <IPFS service url>\n';
    help += '    port: <port number>\n';
    help += '    protocol: <protocol>\n';
    help += '    apiKey: <API key>\n';
    help += '    apiSecret: <secret key>\n';
	help += '    enableLocalIPFS: <boolean>';
    help += 'For more help, you can check the docs: ' + chalk.underline('http://hexo.io/docs/deployment.html' + '\n\n');
    console.log(help);

	// Print out pinata deployer plugin configuration
	console.log("Print out `hexo-deployer-pinata` configuration: ");
	console.log(args);

	args.host = args.host || "localhost";
	args.port = args.port || 5001;
	args.protocol = args.protocol || "http";
	args.path = args.path || "public"
  	const publicDir = args.path;

	if(!fs.statSync(args.path).isDirectory()){
		console.error("[ERROR] `path` specified in deployer config is not a valid directory.");
    	return;
  	}
	
		
	if (args.enableLocalIPFS) {
		const client = IPFSClient.create({ host: args.host, port: args.port, protocol: args.protocol });

		const filePaths = collectPaths(publicDir);
		console.log("\n\nThe files to be uploaded to IPFS and pinned to Pinata:");
		console.log(filePaths);

		const fileObjs = filePaths.map(filePath => {
			// Read stream from buffer rather than create objects with huge strings in them.
			const stream = fs.createReadStream(filePath);
			const fileObj = {
				path: filePath,
				content: stream,
			};
			return fileObj;
		});

		const stats = [];
		for await (const stat of client.addAll(fileObjs, {wrapWithDirectory: true})) {
			stats.push(stat);
		}
		// console.log(stats);

		// The last one is always the root directory `./` in which there is one directory `/public`.
		const rootDirectoryCid = stats[stats.length - 1].cid;
		const publicDirCid = stats[stats.length - 2].cid;

		// for await (const file of client.ls(directoryCid)) {
		// 	console.log(file)
		// }
		// await all(client.ls(publicDirCid)).then(console.log);

		console.log("Access IPFS public URL: " + chalk.underline("http://ipfs.io/ipfs/" + publicDirCid));
	}

	if (!args.apiKey || !args.apiSecret) {
		console.log("Please provide your Pinata API key and secret key in the deployer config file.");
		return;
	}

	const options = {
		pinataMetadata: {
			name: 'hexo-blog',
			keyvalues: {
				deployer_name: 'hexo-deployer-pinata',
				deployer_author: 'qishen'
			}
		},
		pinataOptions: {
			cidVersion: 0
		}
	};

	// Pin the root directory to pinata
	const pinata = pinataSDK(args.apiKey, args.apiSecret);
	const auth_status = await pinata.testAuthentication();
	console.log(auth_status);
	const upload_status = await pinata.pinFromFS(publicDir, options);
	console.log(upload_status);
	console.log("Access Pinata public URL: " + chalk.underline("https://gateway.pinata.cloud/ipfs/" + upload_status.IpfsHash));

    return;
};