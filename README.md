
# nbake-src

Source code for nbake, https://github.com/topseed/nbake-user

You can use this to write your own build script.
For example add jstransformer to pug


There is supper set project (Apache 2 license) that allows you to build in the cloud by for using the web admin, a bit like WordPress admin, here:
 - http://github.com/topseed/nbake-admin
Admin super set requires deployment to AWS S3.
You can use FTP (ex: CyberDuck) in nbake cli to deploy to AWS S3 (with an 'IAM' id, key, secret and bucket name). It is recomended that you start using that project as well as soon as you deel comfortable with nbake.

Note that this is GPL license, so adding script features or jstransform must also be open source.
If you want an apache version, start with the nbake admin project.