var express = require( 'express' );
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require( './../config/config' ).SEED;

var app = express();
var Usuario = require( '../models/usuario' );


var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth();
// var { OAuth2Client } = require('google-auth-library');
// var auth = new GoogleAuth;

var GOOGLE_CLIENT_ID = require( './../config/config' ).GOOGLE_CLIENT_ID;
var GOOGLE_SECRET = require( './../config/config' ).GOOGLE_SECRET;

// ==========================================
// Autenticación de Google
// ==========================================

app.post( '/google', ( req, res ) => {

    var token = req.body.token  || 'XXX';
    console.log( token );   
    // var OAuth2Client = new OAuth2Client(
    //     GOOGLE_CLIENT_ID, 
    //     GOOGLE_SECRET, '');
    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');
    
    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function( e, login ) {

            if ( e ) {
                return res.status( 400 ).json( {
                    ok: false,
                    mensaje: 'Token no válido',
                    errors: e
                });
    
            }
            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne( { email: payload.email }, ( err, usuario ) => {
                if ( err ) {
                    return res.status( 500 ).json( {
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: err
                    });
                }

                if ( usuario ) {
                    if ( usuario.google === false ) {
                        return res.status( 400 ).json( {
                            ok: false,
                            mensaje: 'Debe usar su autenticación normal'
                        })
                    } else {
                        // Crear un token !!!!!!!!!!!!!!!!!
                        usuario.password = ':)';
                        var token = jwt.sign({ 'usuario' : usuario }, SEED, { expiresIn: 14400 } );
                        res.status( 200 ).json( {
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });                    
                    }
                    // Si el usuario no existe por correo 
                } else {
                    var usuario = new Usuario();

                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = '=)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save ( ( err, usuarioDB ) => {
                        if ( err ) {
                            return res.status( 500 ).json( {
                                ok: false,
                                mensaje: 'Error al crear usuario - google',
                                errors: err
                            });
                        }        

                        var token = jwt.sign({ 'usuario' : usuarioDB }, SEED, { expiresIn: 14400 } );
                        res.status( 200 ).json( {
                            ok: true,
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });                    

                    });
                }
                    
            });
        });

});

// ==========================================
// Autenticación normal
// ==========================================
app.post( '/', ( req, res ) => {

    var body = req.body;

    Usuario.findOne( { email: body.email }, ( err, usuarioDB ) => {

        if ( err ) {
            return res.status( 500 ).json( {
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }

        if( !usuarioDB ) {
            return res.status( 400 ).json( {
                ok: false,
                mensaje: 'Credenciales incorrectas -- email',
                errors: err
            })
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status( 400 ).json( {
                ok: false,
                mensaje: 'Credenciales incorrectas -- password',
                errors: err
            })
        }

        // Crear un token !!!!!!!!!!!!!!!!!
        usuarioDB.password = ':)';
        //var token = jwt.sign( { usuario: usuarioDB }, '@este-es@-un-seed-dificil', { expiresIn: 14400 } );
        var token = jwt.sign({ 'usuario' : usuarioDB }, SEED, { expiresIn: 14400 } );
        res.status( 200 ).json( {
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    })

});








module.exports = app;