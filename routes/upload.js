var express = require( 'express' );
const fileUpload = require('express-fileupload');
var app = express();

const Usuario = require( './../models/usuario' );
const Medico = require( './../models/medico' );
const Hospital = require( './../models/hospital' );

// default options
app.use( fileUpload() );
const fs = require( 'fs' );

app.put('/:tipo/:id', ( req, res, next ) => {

    console.log( 'adentro' );
    const tipo = req.params.tipo;
    const id = req.params.id;
    console.log( tipo, id );
    // tipos de colección

    const tiposValidos = [ 'hospitales', 'medicos', 'usuarios' ];

    if ( tiposValidos.indexOf( tipo ) < 0 ) {
        return res.status( 400 ).json( {
            ok: false,
            mensaje: 'Tipo de colección no es válido',
            errors: { message: 'Tipo de colección no es válido'}
        });
    }

    if( !req.files ) {
        return res.status( 400 ).json( {
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe de seleccionar una imagen'}
        });
    }

    // Obtener nombre de archivo

    const archivo = req.files.imagen;
    const nombreCortado = archivo.name.split('.');
    const extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    // Solo estas extensiones aceptamos

    const extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];

    if ( extensionesValidas.indexOf( extensionArchivo) < 0 ) {
        return res.status( 400 ).json( {
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: `Las extensiones válidas son: ${ extensionesValidas.join(', ') }` }
        });
    }

    // Nombre de archivo personalizado :  id_usurio-numerorandom.extension

    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;
    
    // Mover el archivo del temporal a un paht
    
    let path = `./uploads/${ tipo }/${ nombreArchivo }`;
    console.log( path );
    archivo.mv( path, err => {

        if ( err ) {
            return res.status( 500 ).json( {
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });        
        }
        
        subirPorTipo( tipo, id, nombreArchivo, res );

    });
    
});

function subirPorTipo( tipo, id, nombreArchivo, res ) {
    
    if ( tipo === 'usuarios' ) {
        Usuario.findById( id, ( err, usuario ) => {

            if ( !usuario ) {
                return res.status( 400 ).json( {
                    ok: false,
                    mensaje: 'No existe el usuario',
                    errors: err
                });        
            }


            const pathViejo = `./uploads/${ tipo }/${ usuario.img }`;
            
            // Si existe una imagen anterior la borra
            if ( fs.existsSync( pathViejo ) ) {
                fs.unlink( pathViejo );
            }
            
            usuario.img = nombreArchivo;
            usuario.password = ':)';
            usuario.save( ( err, usuarioActualizado ) => {

                res.status( 200 ).json( {
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
                
            });

        });
    }
    if ( tipo === 'medicos' ) {

        Medico.findById( id, ( err, medico ) => {

            if ( !medico ) {
                return res.status( 400 ).json( {
                    ok: false,
                    mensaje: 'No existe el médico',
                    errors: err
                });        
            }

            const pathViejo = `./uploads/${ tipo }/${ medico.img }`;
            
            // Si existe una imagen anterior la borra
            if ( fs.existsSync( pathViejo ) ) {
                fs.unlink( pathViejo );
            }
            
            medico.img = nombreArchivo;
            
            medico.save( ( err, medicoActualizado ) => {

                res.status( 200 ).json( {
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
                
            });

        })
    }
    if ( tipo === 'hospitales' ) {
   
        Hospital.findById( id, ( err, hospital ) => {

            if ( !hospital ) {
                return res.status( 400 ).json( {
                    ok: false,
                    mensaje: 'No existe el hospital',
                    errors: err
                });        
            }

            const pathViejo = `./uploads/${ tipo }/${ hospital.img }`;
            
            // Si existe una imagen anterior la borra
            if ( fs.existsSync( pathViejo ) ) {
                fs.unlink( pathViejo );
            }
            
            hospital.img = nombreArchivo;
            
            hospital.save( ( err, hospitalActualizado ) => {

                res.status( 200 ).json( {
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    hospital: hospitalActualizado
                });
                
            });

        })

    }
}

module.exports = app;