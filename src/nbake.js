#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AdmZip = require('adm-zip');
const logger = require('tracer').console();
const fs = require('fs');
const path = require('path');
const commandLineArgs = require('command-line-args');
const Base_1 = require("./lib/Base");
const cwd = process.cwd();
function version() {
    let b = new Base_1.NBake();
    console.log();
    console.log(b.ver());
    console.log('node ' + process.version);
    console.log('from ' + __dirname);
    console.log('usage: nbake .');
    console.log(' or: nbake any_dir');
    console.log(' for hello world app: nbake -s');
    console.log(' to process tags on _tag.pug: nbake -t .');
    console.log(' to process items on dat_i to items.json: nbake -i .');
    console.log(' for an example buildPG: nbake -b');
    console.log(' for an example meta admin: nbake -x');
    console.log(' for full docs and more optional arguments check: - http://github.com/topseed ');
    process.exit();
}
const optionDefinitions = [
    { name: 'nbake', defaultOption: true },
    { name: 'metA', alias: 'a', type: Boolean },
    { name: 'buildPG', alias: 'b', type: Boolean },
    { name: 'helloS', alias: 's', type: Boolean },
    { name: 'items', alias: 'i', type: Boolean },
    { name: 'tag', alias: 't', type: Boolean },
    { name: 'upload', alias: 'u', type: Boolean },
    { name: 'download', alias: 'd', type: Boolean }
];
const argsParsed = commandLineArgs(optionDefinitions);
let arg = argsParsed.nbake;
console.log();
function unzipS() {
    let src = __dirname + '/helloAppS.zip';
    let zip = new AdmZip(src);
    zip.extractAllTo(cwd + '/helloAppS', true);
    console.log('extracted hello world, check it, bake it');
    process.exit();
}
function unzipA() {
    let src = __dirname + '/exMeta.zip';
    let zip = new AdmZip(src);
    zip.extractAllTo(cwd + '/exMeta', true);
    console.log('extracted a sample, check it, bake it');
    process.exit();
}
function unzipB() {
    let src = __dirname + '/build.zip';
    let zip = new AdmZip(src);
    zip.extractAllTo(cwd + '/build', true);
    console.log('extracted a sample, check it, bake it');
    process.exit();
}
if (arg) {
    arg = arg.split('\\').join('/');
    if (arg.startsWith('/')) {
    }
    else if (arg.startsWith('..')) {
        arg = arg.substring(2);
        let d = cwd;
        d = d.split('\\').join('/');
        let n = d.lastIndexOf('/');
        d = d.substring(0, n);
        arg = d + arg;
    }
    else if (arg.startsWith('.')) {
        arg = cwd;
    }
    else {
        arg = cwd + '/' + arg;
    }
}
function bake(arg) {
    console.log('Baking ' + arg);
    let d = new Base_1.Dirs(arg);
    let dirs = d.get();
    for (let val of dirs) {
        let b = new Base_1.Bake(val);
        b.bake();
    }
    process.exit();
}
function itemize(arg) {
    const i = new Base_1.Items(arg);
    i.itemize();
    process.exit();
}
function tag(arg) {
    let t = new Base_1.Tag(arg);
    let lst = t.get();
    t.bake(lst);
}
if (argsParsed.tag)
    tag(arg);
else if (argsParsed.items)
    itemize(arg);
else if (argsParsed.helloS)
    unzipS();
else if (argsParsed.metaA)
    unzipA();
else if (argsParsed.buildPG)
    unzipB();
else if (!arg)
    version();
else
    bake(arg);
