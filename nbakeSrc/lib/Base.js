"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const FileHound = require('filehound');
const yaml = require('js-yaml');
const riotc = require('riot-compiler');
const pug = require('pug');
const logger = require('tracer').console();
class NBake {
    ver() {
        return 'v2.04.027 alpha';
    }
}
exports.NBake = NBake;
class Dirs {
    constructor(dir) {
        this.dir = dir;
    }
    get() {
        const rec = FileHound.create()
            .paths(this.dir)
            .ext('yaml')
            .findSync();
        let ret = [];
        for (let val of rec) {
            val = val.split('\\').join('/');
            let n = val.lastIndexOf('/');
            let s = val.substring(0, n);
            ret.push(s);
        }
        return ret;
    }
}
exports.Dirs = Dirs;
class Meta {
    constructor(path) {
        this.path = path;
        let y = yaml.load(fs.readFileSync(path + '/meta.yaml'));
        if (!y)
            y = {};
        this.props = y;
        let keys = Object.keys(y);
        if (keys.includes('include'))
            this.addData();
    }
    addData() {
        let jn = this.props.include;
        let fn = this.path + '/' + jn;
        logger.trace(fn);
        let jso = fs.readFileSync(fn);
        Object.assign(this.props, JSON.parse(jso));
    }
    exists() {
        var count = this.props.length;
        if (count > 0)
            return true;
        return false;
    }
    getBase() {
        let r = this.props.get('basedir');
        if (r == '.')
            return this.path;
        return r;
    }
    getTitle() {
        return this.props.get('title');
    }
    get(prop) {
        return this.props.get(prop);
    }
    getAll() {
        return this.props;
    }
}
exports.Meta = Meta;
class Bake {
    constructor(dir) {
        this.dir = dir;
        console.log(' processing: ' + this.dir);
    }
    bake() {
        process.chdir(this.dir);
        this.cli(this.dir);
        if (!fs.existsSync(this.dir + '/index.pug'))
            return ' ';
        if (!fs.existsSync(this.dir + '/meta.yaml'))
            return ' ';
        let m = new Meta(this.dir);
        let html = pug.renderFile(this.dir + '/index.pug', m.getAll());
        let fn = this.dir + '/index.html';
        fs.writeFileSync(fn, html);
        return ' OK ';
    }
    cli(dir) {
        const files = FileHound.create()
            .depth(0)
            .paths(dir)
            .ext('pug')
            .match('*_d.pug')
            .findSync();
        let obj = {};
        if (fs.existsSync(this.dir + '/meta.yaml')) {
            let m = new Meta(this.dir);
            obj = m.getAll();
        }
        for (let fn of files) {
            this.cliEach(fn, obj);
        }
    }
    cliEach(fn, obj) {
        let foo = this.getNameFromFileName(fn);
        console.log(' _d', foo);
        obj.name = foo;
        obj.compileDebug = false;
        let js = pug.compileFileClient(fn, obj);
        let pos = fn.lastIndexOf('.');
        fn = fn.substring(0, pos) + '.js';
        console.log(' _d:', fn);
        fs.writeFileSync(fn, js);
    }
    getNameFromFileName(filename) {
        filename = filename.split('\\').join('/');
        if (filename.indexOf('/') > -1) {
            let pos = filename.lastIndexOf('/') + 1;
            filename = filename.substring(pos);
        }
        var file = filename.replace(/\.(?:pug|jade)$/, '');
        return file.toLowerCase().replace(/[^a-z0-9]+([a-z])/g, function (_, character) {
            return character.toUpperCase();
        }) + 'Bind';
    }
}
exports.Bake = Bake;
class Items {
    constructor(dir) {
        this.dir = dir;
        let d = new Dirs(dir);
        this.dirs = d.get();
        this.dirs.pop();
    }
    addAnItem(dn) {
        console.log(' ' + dn);
        let y = yaml.load(fs.readFileSync(dn + '/meta.yaml'));
        if (!y)
            return;
        if (y.hasOwnProperty('publish')) {
            if (y.publish == false) {
                console.log('  skipped');
                return;
            }
        }
        Items.clean(y);
        let dl = this.dir.length;
        y.id = dn.substring(dl + 1);
        if (!this.feed.items)
            this.feed.items = [];
        this.feed.items.push(y);
        console.log('  ' + this.feed.items.length);
    }
    itemize() {
        console.log('Itemizing: ' + this.dir);
        const rootDir = this.dir;
        let fn = rootDir + '/meta_i.yaml';
        let y = yaml.load(fs.readFileSync((fn)));
        console.log(y);
        Items.clean(y);
        this.feed = y;
        for (let val of this.dirs) {
            this.addAnItem(val);
        }
        let json = JSON.stringify(this.feed, null, 2);
        let items = rootDir + '/items.json';
        fs.writeFileSync(items, json);
        console.log(' processed.');
        return ' processed ';
    }
    static clean(o) {
        delete o['basedir'];
    }
}
exports.Items = Items;
class Tag {
    constructor(dir) {
        this.dir = dir;
    }
    get() {
        const rec = FileHound.create()
            .paths(this.dir)
            .ext('pug')
            .glob('*-tag.pug')
            .findSync();
        let ret = [];
        for (let val of rec) {
            val = val.split('\\').join('/');
            ret.push(val);
        }
        return ret;
    }
    bake(list) {
        console.log('Looking for tags *-tag ' + this.dir);
        for (let val of list) {
            let s = fs.readFileSync(val);
            let n = val.lastIndexOf('/');
            let dir = val.substring(0, n);
            let name = val.substring(n);
            let p = name.lastIndexOf('.');
            name = name.substring(0, p);
            name = name + '.js';
            console.log(' ' + dir + name);
            this.write(s, dir + name);
        }
    }
    write(s, fn) {
        const r_options = { 'template': 'pug' };
        let js = riotc.compile(s, r_options);
        fs.writeFileSync(fn, js);
    }
}
exports.Tag = Tag;
module.exports = {
    Meta, Dirs, Bake, Items, Tag, NBake
};
