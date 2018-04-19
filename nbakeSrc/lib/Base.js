"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const FileHound = require('filehound');
const yaml = require('js-yaml');
const riotc = require('riot-compiler');
const pug = require('pug');
const express = require('express');
const formidable = require('formidable');
const logger = require('tracer').console();
const os = require('os');
class NBake {
    ver() {
        return 'v2.04.021 beta';
    }
}
exports.NBake = NBake;
class Srv {
    constructor(bake_, itemize_, prop_) {
        Srv.bake = bake_;
        Srv.itemize = itemize_;
        Srv.prop = prop_;
        this.app = express();
        this.app.set('view engine', 'pug');
        this.app.set('views', __dirname + '/www');
        this.app.get('/upload', function (req, res) {
            res.render('upload');
        });
    }
    static ret(res, msg) {
        logger.trace(msg);
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write(msg);
        res.write('\n\n');
        res.end();
    }
    s() {
        this.app.post('/upload', function (req, res) {
            console.log('upload');
            const form = new formidable.IncomingForm();
            form.uploadDir = os.homedir() + '/tmp';
            form.keepExtensions = true;
            form.multiples = true;
            let files = [];
            let fields = [];
            form.on('field', function (field, value) {
                console.log(field, value);
                fields.push([field, value]);
            });
            form.on('progress', function (bytesReceived, bytesExpected) {
                console.log(bytesReceived);
            });
            form.on('file', function (name, file) {
                files.push([name, file]);
                console.log(name);
            });
            form.on('error', function (err) {
                console.log(err);
            });
            form.on('aborted', function () {
                console.log('user aborted');
            });
            form.on('end', function () {
                console.log('done');
                res.writeHead(200, { 'content-type': 'text/plain' });
                res.write('received fields:\n\n ' + (fields));
                res.write('\n\n');
                res.end('received files:\n\n ' + (files));
            });
            form.parse(req);
        });
        const secretProp = 'secret';
        const cmdProp = 'cmd';
        const folderProp = 'folder';
        const ITEMS = 'i';
        const SECRET = Srv.prop.secret;
        this.app.get('/api', function (req, res) {
            let qs = req.query;
            let keys = Object.keys(qs);
            logger.trace(JSON.stringify(qs));
            if (!keys.includes(secretProp)) {
                Srv.ret(res, 'no secret');
                return;
            }
            let secret = qs.secret;
            if (secret != SECRET) {
                Srv.ret(res, 'wrong');
                return;
            }
            if (!keys.includes(folderProp)) {
                Srv.ret(res, 'no folder');
                return;
            }
            if (!keys.includes(cmdProp)) {
                try {
                    let msg = Srv.bake(qs[folderProp]);
                    Srv.ret(res, msg);
                }
                catch (err) {
                    Srv.ret(res, err);
                }
                return;
            }
            let cmd = qs.cmd;
            if (cmd == ITEMS) {
                try {
                    let msg = Srv.itemize(qs[folderProp]);
                    Srv.ret(res, msg);
                }
                catch (err) {
                    Srv.ret(res, err);
                }
                return;
            }
            Srv.ret(res, 'oops, no op');
        });
        return this;
    }
    start() {
        this.app.listen(Srv.prop.port, function () {
            logger.trace('port 3000');
        });
    }
}
exports.Srv = Srv;
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
        let y = yaml.load(fs.readFileSync(path));
        this.props = y;
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
        if (!fs.existsSync(this.dir + '/meta.yaml'))
            return ' ';
        if (!fs.existsSync(this.dir + '/index.pug'))
            return ' ';
        process.chdir(this.dir);
        let m = new Meta(this.dir + '/meta.yaml');
        this.cli(this.dir, m);
        let html = pug.renderFile(this.dir + '/index.pug', m.getAll());
        let fn = this.dir + '/index.html';
        fs.writeFileSync(fn, html);
        return ' OK ';
    }
    cli(dir, m) {
        const files = FileHound.create()
            .depth(0)
            .paths(dir)
            .ext('pug')
            .match('*_d.pug')
            .findSync();
        for (let fn of files) {
            this.cliEach(fn, m);
        }
    }
    cliEach(fn, m) {
        let obj = m.getAll();
        let foo = this.getNameFromFileName(fn);
        console.log(' _d:', foo);
        obj.name = foo;
        obj.compileDebug = false;
        let js = pug.compileFileClient(fn, obj);
        let pos = fn.lastIndexOf('.');
        fn = fn.substring(0, pos) + '.js';
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
        let y = yaml.load(fs.readFileSync((dn + '/meta.yaml')));
        if (y.hasOwnProperty('publish')) {
            if (y.publish == false) {
                console.log('  skipped');
                return;
            }
        }
        delete y.basedir;
        let dl = this.dir.length;
        y.local_url = dn.substring(dl + 1);
        if (!this.feed.items)
            this.feed.items = [];
        this.feed.items.push(y);
        console.log('  ' + this.feed.items.length);
    }
    itemize() {
        console.log('Itemizing: ' + this.dir);
        const rootDir = this.dir;
        let fn = rootDir + '/meta_d.yaml';
        let y = yaml.load(fs.readFileSync((fn)));
        console.log(y);
        delete y.basedir;
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
    Meta, Dirs, Bake, Items, Tag, NBake, Srv
};
