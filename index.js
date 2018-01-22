var mongoose = require( 'mongoose' );

var app = require( './app' );

const colorVerde = '\x1b[32m%s\x1b[0m';

// Conexión a la base de datos

mongoose.connection.openUri( 'mongodb://localhost:27017/hospitalDB', ( err, res ) => {
    if ( err ) throw err;
    console.log( `Base de datos: ${ colorVerde }` , 'online' )
    
    // Escuchar peticiones
    
    app.listen( 3000, ( ) => {
        console.log( `Express server corriendo en el puerto 3000: ${colorVerde}` , 'online' )
    } );
});
