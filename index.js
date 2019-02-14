const nodemailer = require( 'nodemailer' );
const express = require('express');
const fs = require( 'fs' );



let transporter;
const app = express();
app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

app.post( '/api/contact/email', async ( request, response ) =>
{
    const { to, html, subject } = request.body;

    transporter = transporter || await transport();
    email( transporter, { to, html, subject } ).then( status =>
    {
        response.status( 201 ).json({
            status: 'success',
            content: status,
        });
    }).catch( error =>
    {
        let status = 400 <= error.code && error.code < 500 ? 500 : 400;
        response.status( status ).json({
            status: 'error',
            code: error.code,
            body: request.body,
            message: error.message,
            response: error.responseCode,
        });
    })
});

app.use( async ( request, response, next ) =>
{
    try {
        if ( /\.(js|css|html|jpg|png|ico|)$/.test( request.path )
            && ( fs.statSync( `${ __dirname }${ request.path }` ) ).isFile() )
        {
            return response.sendFile( `${ __dirname }${ request.path }` );
        }
    }
    catch ( error )
    {
        console.error( error );
    }

    response.status( 404 ).sendFile( `${ __dirname }/index.html` );
});



async function email( transport, { to, from = process.env.email, html, subject })
{
    console.log({ to, from, html, subject});

    return new Promise( ( resolve, reject ) =>
    {
        transport.sendMail(
            { to, from, html, subject },
            ( error, info ) => error ? reject( error ) : resolve( info )
        );
    });
}

async function transport({ user = process.env.email, pass = process.env.email_password } = {})
{
    return nodemailer.createTransport({
        auth : { user, pass },
        service,
    });
}

const service = 'gmail';



module.exports = app;
