# nbake


https://www.npmjs.com/package/nbake




## To install

If you are running our 'bake' docker avilable elsewhere, this is installed already.
If you are running other docker, any linux, OSX/Mac or such(but not Windows):

	// install node and yarn before this
	yarn global add nbake
	cd ** your project folder **
	nbake
	// you don't need to specify 'node $Env:userprofile/nbake/node_modules/nbake/nbake.js', so just run nbake and any args.

If you have Windows Pro, you can also run Docker.
If you are using Windows Home Edition, or if you don't know what operating system you have, in PowerShell:

	// install node and yarn before this:
	cd $Env:userprofile
	mkdir nbake
	cd nbake
	pwd
	yarn add nbake
	cd ** your project folder **
	pwd
	node $Env:userprofile/nbake/node_modules/nbake/nbake.js
	// so in windows you have to paste the the first two words, and then any args until the node team fixed npx bugs


	// to update
	// go to the folder where nbake is installed, $Env:userprofile
	yarn upgrade nbake



If using VS Code in windows you may want to set the terminal to PowerShell and not Command Prompt.


## To use

This will process the current folder ( if not windows than just 'nbake .')

	node $Env:userprofile/nbake/node_modules/nbake/nbake.js .

Or instead of . you can specify a directory to start in.



## More

It supports markdown includes.

Future versions will support internal less/sass/ts/vendor-prefix, inside the pug files. But it will not support external, for example .ts is usually in a different folder, as are css or CDN assets.




