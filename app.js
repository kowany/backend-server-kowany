// Requires

var express = require( 'express' );
var bodyParser = require ( 'body-parser' );

// Inicializar variables

var app = express();

// body-parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Server index config

// var serverIndex = require( 'server-index' );
// app.use( express.static(__dirname + '/' ) );
// app.use( '/uploads', serverIndex( __dirname + '/uploads' ) );

// Importar rutas

var appRoutes = require( './routes/app' );
var usuarioRoutes = require( './routes/usuario' );
var loginRoutes = require( './routes/login' );
var hospitalRoutes = require( './routes/hospital' );
var medicoRoutes = require( './routes/medico' );
var busquedaRoutes = require( './routes/busqueda' );
var uploadRoutes = require( './routes/upload' );
var imagenesRoutes = require( './routes/imagenes' );


// Rutas

app.use( '/usuario', usuarioRoutes );
app.use( '/hospital', hospitalRoutes );
app.use( '/medico', medicoRoutes );
app.use( '/login', loginRoutes );
app.use( '/busqueda', busquedaRoutes );
app.use( '/upload', uploadRoutes );
app.use( '/img', imagenesRoutes );

app.use( '/', appRoutes );

module.exports = app;