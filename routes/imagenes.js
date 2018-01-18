var express = require( 'express' );

var app = express();
var fs = require( 'fs' );

app.get( '/:tipo/:img', ( req, res, next ) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var path = `./uploads/${ tipo }/${ img }`;
    console.log( path );
    fs.exists( path, existe => {
        console.log( existe );
        if ( !existe ) {
            path = './assets/no-img.jpg';
        }

        res.sendfile( path );
    });

    // res.status( 200 ).json( {
    //     ok: true,
    //     mensaje: 'Petición realizada correctamente'
    // })
});


module.exports = app;