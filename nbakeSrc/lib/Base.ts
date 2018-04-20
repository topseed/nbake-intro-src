

declare var module: any
declare var require: any
declare var process: any
declare var __dirname: any


const fs = require('fs')
const FileHound = require('filehound')
const yaml = require('js-yaml')
const riotc = require('riot-compiler')
const pug = require('pug')
const express = require('express')
const formidable = require('formidable')
const logger = require('tracer').console()
const os = require('os')

export class NBake {
	ver() {
		return 'v2.04.023 beta'
	}
}


export class Srv {
	static bake //()
	static itemize// ()
	static prop //ROOT folder, yaml, etc.

	app //express

	constructor(bake_, itemize_, prop_) {// functions to call
		Srv.bake = bake_
		Srv.itemize = itemize_
		Srv.prop = prop_
		this.app = express()
		this.app.set('view engine', 'pug') // yes!
		this.app.set('views', __dirname + '/www')

		//upload
		this.app.get('/upload', function (req, res) {
			res.render('upload')
		})
	}

	static ret(res, msg) {
		logger.trace(msg)
		res.writeHead(200, {'content-type': 'text/plain'})
		res.write(msg)
		res.write('\n\n')
		res.end()
	}

	s() {
		//form
		this.app.post('/upload', function (req, res) {
			console.log('upload')
			const form = new formidable.IncomingForm()
			form.uploadDir = os.homedir() + '/tmp'
			form.keepExtensions = true
			form.multiples = true

			let files = []
			let fields = []

			form.on('field', function(field, value) {
				console.log(field, value)
				fields.push([field, value])
			})

			form.on('progress', function(bytesReceived, bytesExpected) {
				console.log(bytesReceived)
			})

			form.on('file', function(name, file) {
				files.push([name, file])
				console.log(name)
			})

			form.on('error', function(err) {
				console.log(err)
			})

			form.on('aborted', function() {
				console.log('user aborted')
			})

			form.on('end', function() {
				console.log('done')
				res.writeHead(200, {'content-type': 'text/plain'})
				res.write('received fields:\n\n '+(fields))
				res.write('\n\n')
				res.end('received files:\n\n '+(files))
			})

			//start upload
			form.parse(req)

		})//post route

		const secretProp = 'secret'
		const cmdProp = 'cmd'
		const folderProp = 'folder'
		const ITEMS = 'i'
		const SECRET = Srv.prop.secret

		this.app.get('/api', function (req, res) {
			let qs = req.query
			let keys = Object.keys( qs )
			logger.trace(JSON.stringify(qs))

			if(!keys.includes(secretProp)) {
				Srv.ret(res, 'no secret')
				return
			}
			let secret = qs.secret
			if(secret != SECRET) {
				Srv.ret(res, 'wrong')
				return
			}
			if(!keys.includes(folderProp)) {
				Srv.ret(res,'no folder')
				return
			}
			if(!keys.includes(cmdProp)) {
				//default is bake
				try {
					let msg = Srv.bake(qs[folderProp])
					Srv.ret(res, msg)
				} catch(err) {
					Srv.ret(res, err)
				}
				return
			}
			let cmd = qs.cmd
			if(cmd == ITEMS) {
				try {
					let msg = Srv.itemize(qs[folderProp])
					Srv.ret(res, msg)
				} catch(err) {
					Srv.ret(res, err)
				}
				return
			}

			Srv.ret(res,'oops, no op')
		})// api route

		return this

	}//()

	start() {
		this.app.listen(Srv.prop.port, function () {
			logger.trace('port 3000')
		})
	}//()
}//class

export class Dirs {
	dir:string
	constructor(dir:string) {
		this.dir=dir
	}
	get() {
		const rec = FileHound.create() //recurse
			.paths(this.dir)
			.ext('yaml')
			.findSync()
		let ret : string[] = [] //empty string array
		for (let val of rec) {//clean the strings
			val = val.split('\\').join('/') // windoze
			let n = val.lastIndexOf('/')
			let s:string = val.substring(0,n)
			ret.push(s)
		}
		return ret
	}//()
}//class

export class Meta {
	props: any
	path:string
	constructor(path:string) {
		//logger.trace(path)
		this.path = path
		let y = yaml.load(fs.readFileSync(path+'/meta.yaml'))
		if(!y) y= {}
		this.props = y

		let keys = Object.keys( y )
		if(keys.includes('jdata')) this.addData()
	}
	addData() {// load json
		let jn = this.props.jdata
		let fn = this.path+'/'+jn
		logger.trace( fn)
		let jso = fs.readFileSync(fn)
		this.props.jdata = JSON.parse(jso)
	}
	exists():boolean {
		var count = this.props.length
		if(count>0) return true
		return false
	}
	getBase():string {
		let r:string = this.props.get('basedir')
		//all the case ./..
		if(r=='.') return this.path

		return r
	}
	getTitle():string {
		return this.props.get('title')
	}
	get(prop:string) {
		return this.props.get(prop)
	}
	getAll():Object {
		return this.props
	}//()
}//class


export class Bake {
	dir:string
	constructor(dir:string) {
		this.dir=dir
		console.log(' processing: '+ this.dir)
	}
	bake():string {
		// if both
		if (!fs.existsSync(this.dir+'/meta.yaml'))
			return ' '
		if (!fs.existsSync(this.dir+'/index.pug'))
			return ' '

		process.chdir(this.dir)
		let m = new Meta(this.dir)

		this.cli(this.dir, m)//process pug-cli

		//static data binding:
		let html = pug.renderFile(this.dir+'/index.pug', m.getAll() )

		let fn = this.dir + '/index.html'
		fs.writeFileSync(fn, html)
		//console.log(' processed: '+ this.dir)
		return ' OK '
	}//()
	cli(dir, m) {
		const files = FileHound.create()
			.depth(0)
			.paths(dir)
			.ext('pug')
			.match('*_d.pug')
			.findSync()

		for (let fn of files) {
			this.cliEach(fn, m)
		}
	}//()
	cliEach(fn, m) { // dynamic data binding
		let obj = m.getAll()
		let foo = this.getNameFromFileName(fn)
		console.log(' _d:' ,foo)
		obj.name = foo
		obj.compileDebug = false
		let js = pug.compileFileClient(fn, obj )
		//logger.trace(js)
		let pos = fn.lastIndexOf('.')
		fn = fn.substring(0,pos) + '.js'
		fs.writeFileSync(fn, js)

	}//()

	getNameFromFileName(filename) {//lifted from pug cli
		filename = filename.split('\\').join('/') // windoze
		if (filename.indexOf('/')>-1) {
			let pos = filename.lastIndexOf('/')+1
			filename = filename.substring(pos)
		}
		var file = filename.replace(/\.(?:pug|jade)$/, '')
		return file.toLowerCase().replace(/[^a-z0-9]+([a-z])/g, function (_, character) {
		  return character.toUpperCase()
		}) + 'Bind'
	 }
}//class

export class Items {
	// http://jsonfeed.org/version/1
	dir:string
	dirs // array
	feed //rss
	constructor(dir:string) {
		this.dir=dir
		let d = new Dirs(dir)
		this.dirs =d.get()
		this.dirs.pop() // not the root
	}

	addAnItem(dn) {
		console.log(' '+ dn)
		let y = yaml.load(fs.readFileSync(dn+'/meta.yaml'))
		//logger.trace(y)
		if(y.hasOwnProperty('publish')) {
			if(y.publish==false) {
				console.log('  skipped')
				return
			}
		}//outer

		delete y.basedir

		let dl = this.dir.length
		y.local_url = dn.substring(dl+1)

		//logger.trace(y)
		if(!this.feed.items)
			this.feed.items =[]

		this.feed.items.push(y)
		console.log('  '+ this.feed.items.length)
	}

	itemize():string {
		console.log('Itemizing: '+ this.dir)

		const rootDir:string = this.dir
		// header
		let fn:string = rootDir +'/meta_d.yaml'
		let y = yaml.load(fs.readFileSync((fn)))
		console.log(y)

		delete y.basedir

		this.feed = y

		for (let val of this.dirs) {
			this.addAnItem(val)
		}

		//write
		let json = JSON.stringify(this.feed, null, 2)
		let items = rootDir + '/items.json'
		fs.writeFileSync(items, json)

		console.log(' processed.')
		return ' processed '
	}

	static clean(o:Object) {// remove fileds that are pug
		delete o['basedir']
	}

}//class



export class Tag {
	dir:string
	constructor(dir:string) {
		this.dir=dir
	}
	get() {
		const rec = FileHound.create() //recurse
			.paths(this.dir)
			.ext('pug')
			.glob('*-tag.pug')
			.findSync()
		let ret : string[] = [] //empty string array
		for (let val of rec) {//clean the strings
			val = val.split('\\').join('/') // windoze
			ret.push(val)
		}
		return ret
	}//()
	bake(list) {
		console.log('Looking for tags *-tag '+ this.dir)
		for (let val of list) {//clean the strings
			let s:string =  fs.readFileSync(val)

			let n = val.lastIndexOf('/')
			let dir:string = val.substring(0,n)
			let name:string = val.substring(n)
			let p = name.lastIndexOf('.')
			name = name.substring(0,p)
			name = name + '.js'
			console.log(' '+ dir+name)
			this.write(s,dir+name)
		}
	}//()
	write(s:string, fn:string) {
		const r_options = {'template':'pug'}
		let js = riotc.compile(s, r_options)
		fs.writeFileSync(fn, js)
	}
}//class

module.exports = {
	 Meta, Dirs, Bake, Items, Tag, NBake, Srv
}

