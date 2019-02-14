const { promises: fs } = require( 'fs' );
const express = require('express');



const app = express();
app.use( express.json() );

app.post( '/api/contact/email', async ( request, response ) =>
{
    const { to, html, subject } = request.body;

    email( await transport(), { to, html, subject } ).then( response =>
    {
        response.status( 201 ).json({
            content: response,
            status: 'success',
        });
    }).catch( error =>
    {
        let status = 400 <= error.code && error.code < 500 ? 500 : 400;
        response.status( status ).json({
            status: 'error',
            code: error.code,
            message: error.message,
            response: error.responseCode,
        });
    })
});

app.use( async ( request, response, next ) =>
{
    if ( /\.(js|css|html|jpg|png|ico|)$/.test( request.path )
    && ( await fs.stat( `${ __dirname }${ request.path }` ) ).isFile() )
    {
        return response.sendFile( `${ __dirname }${ request.path }` );
    }

    response.status( 404 ).sendFile( `${ __dirname }/index.html` );
});



async function email( transport, { to, from = process.env.fROM || process.env.EMAIL, html, subject })
{
    return new Promise( ( resolve, reject ) =>
    {
        transport.sendMail(
            { to, from, html, subject },
            ( error, info ) => error ? reject( error ) : resolve( info )
        );
    });
}

async function transport({ user = process.env.EMAIL, pass = process.env.EMAIL_PASSWORD } = {})
{
    return nodemailer.createTransport({
        auth : { user, pass },
        service,
    });
}

const service = 'gmail';



module.exports = app;
