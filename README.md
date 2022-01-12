# hexo-deployer-pinata
IPFS and Pinata deployer plugin for Hexo

## Installation

``` bash
$ npm install hexo-deployer-pinata --save
```

## Options
You can configure this plugin in `_config.yml`. The first 5 arguments are optional and they are for deploying files to your local IPFS daemon that is already running in the background. How to run IPFS daemon can be found in the IPFS official [Documentation](https://docs.ipfs.io/how-to/command-line-quick-start/)

``` yaml
deploy:
  type: pinata
  enableLocalIPFS: <boolean> # Set it to true in order to deploy to local IPFS.
  host: <host url> # Default IPFS url is localhost or 127.0.0.1
  port: <port number> # Default port is 5001
  protocol: <protocol> # Default protocol is http
  path: <folder path> # Default path of your public folder is `public`
  apiKey: <api key> # Find it on pinata settings
  apiSecret: <api secret> # Find it on pinata settings
```

## License
MIT