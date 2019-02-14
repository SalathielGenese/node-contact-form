const { normalize, sep } = require( 'path' );
const { promises: fs } = require( 'fs' );


/**
 * @type { string[] }
 */
let paths;
let now = require( './now.json' );
let dest = now.routes.map( route => route.dest )[ 0 ];

( async function inspect( directory, stack = [] )
{
    directory = normalize( directory );
    paths = ( await fs.readdir( directory ) )
        .map( name => `${ directory}${ sep }${ name }`);

    for ( let path of paths )
    {
        if ( ( await fs.stat( path ) ).isDirectory() )
        {
            stack.push( path );
            await inspect( path, stack );
        }
    }

    return stack;
})( './api' ).then( nestedDirectories =>
{
    return Promise.all(
        nestedDirectories.map( directory =>
            fs.stat( `${ directory }${ sep }index.js` ).then( stat =>
                stat.isFile() ? void 0 : directory ).catch( () => directory ) )
    ).then( listableDirectories => listableDirectories.filter( directory => directory ) );
}).then( async listableDirectories =>
{
    now.routes.push( ...listableDirectories.map( directory => ({ dest, src: `/${ directory }` }) ) );
    await fs.writeFile( './now.json', JSON.stringify( now, void 0, 2 ) );
});
