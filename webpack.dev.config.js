const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { spawn } = require("child_process");

// Config directories
const SRC_DIR = path.resolve(__dirname, "src");
const OUTPUT_DIR = path.resolve(__dirname, "dist");

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = [SRC_DIR];

module.exports = {
    entry: SRC_DIR + "/index.js",
    output: {
        path: OUTPUT_DIR,
        publicPath: "/",
        filename: "bundle.js"
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                include: [defaultInclude, /node_modules/]
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
                include: defaultInclude
            },
            {
                test: /\.jsx?$/,
                use: ["babel-loader", "shebang-loader"]
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [{
                    loader: "file-loader?name=img/[name]__[hash:base64:5].[ext]",
                    options: {
                        esModule: false,
                    },
                }],
                include: defaultInclude,
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: [{
                    loader: "file-loader?name=font/[name]__[hash:base64:5].[ext]", options: {
                        esModule: false,
                    },
                }],
                include: [/node_modules/, SRC_DIR]
            }
        ]
    },
    target: "electron-renderer",
    plugins: [
        new HtmlWebpackPlugin({
            title: "HARDWARIO Playground v" + process.env.npm_package_version
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("development"),
        })
    ],
    devtool: "cheap-source-map",
    devServer: {
        contentBase: OUTPUT_DIR,
        stats: {
            colors: true,
            chunks: false,
            children: false
        },
        after() {
            spawn(
                "electron",
                ["."],
                { shell: true, env: process.env, stdio: "inherit" }
            )
                .on("close", code => process.exit(0))
                .on("error", spawnError => console.error(spawnError));
        }
    }
};
