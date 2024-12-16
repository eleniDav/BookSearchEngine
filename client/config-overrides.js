//here im overriding node_modules/react-scripts/config/webpack.config.js to include polyfills cause webpack doesnt do that by default anymore

const webpack = require("webpack");

module.exports = function override(config){
    //existing fallbacks will be preserved and not overriden
    const fallback = config.resolve.fallback || {};

    //and now im extending fallback with additional modules to be resolved (from error page) - also have to install them
    Object.assign(fallback, {
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        crypto: require.resolve("crypto-browserify"),
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        vm: require.resolve("vm-browserify")
    });

    //assigning the updated fallback object and returning the modified webpack config
    config.resolve.fallback = fallback;
    //adding a new pluggin to the list of pluggins in the webpack config
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: "process/browser"
        }),
    ]);
    return config;
};