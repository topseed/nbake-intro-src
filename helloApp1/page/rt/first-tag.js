
riot.tag2('first-tag', '<h2>Riot.js</h2> <p></p> <p>{opts.num}</p> <p>{num}</p> <p></p>', '', '', function(opts) {
    this.doSomething = function(arg) {
    	console.log('XXX ', arg)
    	this.update()
    }.bind(this)
});