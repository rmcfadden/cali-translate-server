"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var dotenv_1 = require("dotenv");
var index_1 = require("./routes/index");
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use('/', index_1.default);
var port = process.env.PORT || 3000;
app.set('port', port);
var server = http_1.default.createServer(app);
server.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
exports.default = app;
