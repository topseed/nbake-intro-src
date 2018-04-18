
# nbake

nbake is.. amazing way to make webapps/websites ( competitors  here http://staticGen.com )
It is so minimal, you'll be amazed.
It does so much, you'll be shocked.

It assume you know jade/pug. (Pug is to html what SASS/Less is to css. Pug is the defualt for node express/koi instead of html. Pug is crack. If you know of php/asp/jsp - then you know most of pug. )

You can install via yarn (or npm)

In docker/linux:


		nbake .


bakes current folder recursively.
In windows home edition:


		node $Env:userprofile/nbake/node_modules/nbake/nbake.js .


bakes current folder recursively. (Windows requires special install - check overview ) No arg checks version, or you can specify dir as arg to process.



It only looks for index.pug. This forces good structure. You should use index.pug as an 'app shell' (google pwa fundamentals) and your import 'chunks'/'components.'

It requires meta.info in each folder. Ex:

		title = Oh hi
		basedir = ..

So in pug you can #{title}. Or whatever. basedir is for absolute path imports.


Also:

-x will make a small example project.


Soon:

-r will make a rss.xml. So you can call from a client side to make 'boxes'. It looks at meta.info.


You can glance at overview to review how to install, etc. https://github.com/topseed/topseed-nbake/blob/master/OVERVIEW.md