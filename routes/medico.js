var express = require( 'express' );
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require( './../middleware/autenticacion' );
var app = express();

var Medico = require( './../models/medico' );


// =================================
// Obtener todos los usuarios
// =================================

app.get( '/', ( req, res, next ) => {

    let desde = req.query.desde || 0;
    desde = Number( desde );

    Medico.find( {}, 'nombre img usuario hospital')
        .skip( desde )
        .limit( 5 )
        .populate( 'usuario', 'nombre email')
        .populate( 'hospital' )
        .exec(
            ( err, medicos ) => {
                if ( err ) {
                    return res.status( 500 ).json( {
                        ok: false,
                        mensaje: 'Error cargando médicos',
                        errors: err
                    })
                } 

                Medico.count( {}, ( err, conteo ) => {
                    res.status( 200 ).json( {
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    })
                });

            });
});


// ==========================================
// Actualizar médico
// ==========================================

app.put( '/:id', mdAutenticacion.verificaToken, ( req, res ) => {
    var id = req.params.id;

    var body = req.body;

    if ( body.nombre ) {
        console.log( body.nombre );
    } else {
        console.log( 'empty' );
    }

    Medico.findById( id, ( err, medico ) => {

        if ( err ) {
            return res.status( 500 ).json( {
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            })
        }        
        if ( !medico ) {
            return res.status( 400 ).json( {
                ok: false,
                mensaje: `El médico con el id: ${ id } no existe`,
                errors: { message: 'No existe médico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( ( err, medicoGuardado ) => {
            if ( err ) {
                return res.status( 400 ).json( {
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                })
            }

            res.status( 200 ).json( {
                ok: true,
                medico: medicoGuardado
            })

        })
    } );
})


// =================================
// Crear nuevo usuario
// =================================

app.post( '/', mdAutenticacion.verificaToken, ( req, res ) => {
    
    var body = req.body;
    console.log( body );
    var medico = new Medico( {
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( ( err, medicoGuardado ) => {
        if ( err ) {
            return res.status( 400 ).json( {
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            })
        } else {
            res.status( 201 ).json( {
                ok: true,
               // usuarioToken: req.usuario,
                medico: medicoGuardado

            })
        }
    });
} );

// =================================
// Borrar usuario
// =================================

app.delete( '/:id', mdAutenticacion.verificaToken, ( req, res ) => {
    
    var id = req.params.id;

    Medico.findByIdAndRemove( id, ( err, medicoBorrado ) => {
        if ( err ) {
            return res.status( 500 ).json( {
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            })
        } 
        if ( !medicoBorrado ) {
            return res.status( 500 ).json( {
                ok: false,
                mensaje: 'No existe médico con ese ID',
                errors: { message: 'No existe médico con ese ID' }
            })
        }
        
        res.status( 200 ).json( {
            ok: true,
            medico: medicoBorrado
        })
    })

})

module.exports = app;