var express = require( 'express' );

var app = express();

var Hospital = require( './../models/hospital' );
var Medico = require( './../models/medico' );
var Usuario = require( './../models/usuario' );

// ==========================================
// Búsqueda por colección
// ==========================================

app.get( '/coleccion/:tabla/:busqueda', ( req, res ) => {

    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp( busqueda, 'i' );

    let promesa;

        switch ( tabla ) {
            case 'medicos':
                promesa = buscarMedicos( busqueda, regex )
                break;
            case 'hospitales':
                promesa = buscarHospitales( busqueda, regex )
                break;
            case 'usuarios': 
                promesa = buscarUsuarios( busqueda, regex )
                break;
            default:
                return res.status( 404 ).json( {
                    ok: false,
                    mensaje: 'No coincide con ninguna de las colecciones de la base de datos',
                    error: { message: 'Tipo de tabla / colección no válida' }
                });
        }

        promesa.then( data => {
            res.status( 200 ).json( {
                ok: true,
                [tabla]: data
            });
        });

});


// ==========================================
// Búsqueda general
// ==========================================


app.get( '/todo/:busqueda', ( req, res, next ) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp( busqueda, 'i' );

    Promise.all( [ 
            buscarHospitales( busqueda, regex ), 
            buscarMedicos( busqueda, regex ),
            buscarUsuarios( busqueda, regex ) ] )
        .then( respuestas => {
            res.status( 200 ).json( {
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            })
        });

});

function buscarHospitales( busqueda, regex ) {

    return new Promise ( ( resolve, reject ) => {
        Hospital.find( { nombre: regex })
                .populate( 'usuario', 'nombre email' )
                .exec( ( err, hospitales ) => {
                    if ( err ) {
                        reject( 'Error al cargar hospitales' );
                    } else {
                        resolve( hospitales );
                    }
                } )
    } )
}
function buscarMedicos( busqueda, regex ) {

    return new Promise ( ( resolve, reject ) => {
        Medico.find( { nombre: regex })
            .populate( 'usuario', 'nombre email')
            .populate( 'hospital' )
            .exec( ( err, medicos ) => {
                if ( err ) {
                    reject( 'Error al cargar médicos' );
                } else {
                    resolve( medicos );
                }
            } );
    } )
}
function buscarUsuarios( busqueda, regex ) {

    return new Promise ( ( resolve, reject ) => {

        Usuario.find( {}, 'nombre email role')
            .or( [ { 'nombre': regex }, { 'email': regex } ])
            .exec( ( err, usuarios ) => {
                if( err ) {
                    reject( 'Error al cargar usuarios' );
                } else {
                    resolve( usuarios );
                }
            })
    } )
}

module.exports = app;