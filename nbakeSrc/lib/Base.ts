import { TSInterfaceDeclaration } from "babel-types";


declare var module: any
declare var require: any
declare var process: any
declare var __dirname: any


const fs = require('fs')
const FileHound = require('filehound')
const yaml = require('js-yaml')
const riotc = require('riot-compiler')
const pug = require('pug')
const logger = require('tracer').console()
//const os = require('os')

export class NBake {
	ver() {
		return 'v2.04.025 alpha'
	}
}

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
		if(keys.includes('include')) this.addData()
	}
	addData() {// load json
		let jn = this.props.include
		let fn = this.path+'/'+jn
		logger.trace( fn)
		let jso = fs.readFileSync(fn)
		Object.assign(this.props, JSON.parse(jso)) // merge
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

		if (!fs.existsSync(this.dir+'/meta.yaml'))
			return ' '

		process.chdir(this.dir)
		let m = new Meta(this.dir)

		this.cli(this.dir, m)//process pug-cli

		if (!fs.existsSync(this.dir+'/index.pug'))
			return ' '

		//static data binding:
		let html = pug.renderFile(this.dir+'/index.pug', m.getAll() )

		let fn = this.dir + '/index.html'
		fs.writeFileSync(fn, html)
		//console.log(' processed: '+ this.dir)
		return ' OK '
	}//()

	cli(dir, m) {
		//logger.trace(dir)
		const files = FileHound.create()
			.depth(0)
			.paths(dir)
			.ext('pug')
			.match('*_d.pug')
			.findSync()

		//logger.trace(files)
		for (let fn of files) {
			this.cliEach(fn, m)
		}
	}//()

	cliEach(fn, m) { // dynamic data binding
		let obj = m.getAll()
		let foo = this.getNameFromFileName(fn)
		console.log(' _d' ,foo)
		obj.name = foo
		obj.compileDebug = false
		let js = pug.compileFileClient(fn, obj )
		//logger.trace(js)
		let pos = fn.lastIndexOf('.')
		fn = fn.substring(0,pos) + '.js'
		console.log(' _d:', fn)
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
		if(!y) return
		if(y.hasOwnProperty('publish')) {
			if(y.publish==false) {
				console.log('  skipped')
				return
			}
		}//outer

		Items.clean(y)

		let dl = this.dir.length
		y.id = dn.substring(dl+1)

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

		Items.clean(y)

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
	 Meta, Dirs, Bake, Items, Tag, NBake
}

