#!/usr/bin/env node

declare var require: any
declare var process: any
declare var console: Console
declare var __dirname: any

const AdmZip = require('adm-zip')
const logger = require('tracer').console()
const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')

import { Dirs, Bake, Items, Tag, NBake } from './lib/Base'


// imports done /////////////////////////////////////////////
const cwd:string = process.cwd()

function version() {
	let b = new NBake()
	console.log()
	console.log(b.ver()) // tsc
	console.log('node '+ process.version)
	console.log('from '+ __dirname)
	console.log('usage: nbake .')
	console.log(' or: nbake any_dir')
	console.log(' for hello world app: nbake -s')
	console.log(' to process tags on _tag.pug: nbake -t .')
	console.log(' to process items on dat_i to items.json: nbake -i .')
	console.log(' for an example meta admin: nbake -x')
	console.log(' for full docs and more optional arguments check: - http://github.com/topseed ')

	process.exit()
}

// args: //////////////////////////////////////////////////////////////////////////////////////////////////////
const optionDefinitions = [
	{ name: 'nbake', defaultOption: true},
	{ name: 'metA', alias: 'a', type: Boolean },
	{ name: 'helloS', alias: 's', type: Boolean },
	{ name: 'items',    alias: 'i', type: Boolean },
	{ name: 'tag',      alias: 't', type: Boolean },
	{ name: 'upload',   alias: 'u', type: Boolean },
	{ name: 'download', alias: 'd', type: Boolean }
]
const argsParsed = commandLineArgs(optionDefinitions)
let arg:string = argsParsed.nbake

console.log()

// unzip: ////////////////////////////////////////////////////////////////////////////////////////////
function unzipS() {
	let src:string =__dirname+ '/helloAppS.zip'
	let zip = new AdmZip(src)
	zip.extractAllTo(cwd +'/helloAppS', /*overwrite*/true)
	console.log('extracted hello world, check it, bake it')
	process.exit()
}
function unzipA() {
	let src:string =__dirname+ '/exMeta.zip'
	let zip = new AdmZip(src)
	zip.extractAllTo(cwd +'/exMeta', /*overwrite*/true)
	console.log('extracted a sample, check it, bake it')
	process.exit()
}

// get folder to be processed: ///////////////////////////////////////////////////////////////////////////////////////////////////////
if(arg) {
	arg = arg.split('\\').join('/') // windoze
	if(arg.startsWith('/'))  {
		//do nothing, full path is arg
	} else if (arg.startsWith('..')) { // few  cases to test
		arg = arg.substring(2)
		let d = cwd
		d = d.split('\\').join('/') // windoze
		// find offset
		let n = d.lastIndexOf('/')
		d = d.substring(0,n)
		arg = d + arg
	} else if (arg.startsWith('.')) {//cur

		arg = cwd //test ./dd

	} else  { // just plain, dir passed
		arg = cwd + '/' + arg
	}
}


// pug: ////////////////////////////////////////////////////////////////////////////////////////////////
function bake(arg) {
	console.log('Baking ' + arg)
	let d = new Dirs(arg)
	let dirs =d.get()
	for (let val of dirs) {
		let b = new Bake(val)
		b.bake()
	}
	process.exit()
}


// itemize : /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function itemize(arg) {
	const i = new Items(arg)
	i.itemize()
	process.exit()
}


// tag:  ///////////////////////////////////////////////////////////////////////////////////////////////
function tag(arg) {
	let t = new Tag(arg)
	let lst = t.get()
	t.bake(lst)

}

// start: /////////////////////////////////////////////////////////////////////////////////////
if(argsParsed.tag)
	tag(arg)
else if(argsParsed.items)
	itemize(arg)
else if(argsParsed.helloS)
	unzipS()
else if(argsParsed.metaA)
	unzipA()
	else if(!arg)
	version()
else
	bake(arg)
