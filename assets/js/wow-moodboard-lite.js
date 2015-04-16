/* Part of Name: WoW Moodboard Lite
   Version: 1.1.1 [ 2015.04.14 ]
   Author: Wow New Media
   Description: JavaScript functions used in WoW MoodBoard Lite
   Status: Production
   
   Load before </body>
*/

// Add a Image to the Moodboard
// Last change: 2014.12.20
function addImage( image, objectscale ) 
{
	try {
		
	var jQ     = jQuery; // Local cached version for jQuery
	var top    = image[ 'top' ]    * objectscale;
	var left   = image[ 'left' ]   * objectscale;
	var width  = image[ 'width' ]  * objectscale;
	var height = image[ 'height' ] * objectscale;
		
	var NewObject = jQ( '<object></object>', 
	{
		"id": image[ 'id' ],
		"class": "image-border",
		"style": 'top:' + top + 'px; left:' + left +'px; z-index:' + image[ 'zindex' ] + '; background-image: url(' + image[ 'thumbnail' ] + '); background-size: contain;',
		"type": image[ 'type' ],
		"width": width,
		"height": height,
		"thumbnail": image[ 'thumbnail' ],
	} ).append( jQ( '<img/>', 
	{
		"src": image[ 'content' ],
		"title": image[ 'caption' ],
		"alt": image[ 'caption' ],
		"width": width,
		"height": height,
		"style": 'width: 100%; height:100%;',
	} ) ).append( jQ( "<div></div>",
	{
		"class": "dragging-overlay overlay",
		"id": "overlay" + image[ 'id' ],
		"style": 'z-index:' + image[ 'zindex' ] + ';'
	} ) );
	
	
	// Add this image to the Moodboard
	jQ( '#wowcanvas' ).append( NewObject );
	jQ( "#overlay" + image[ 'id' ] ).append( jQ( "<div></div>",
	{
		"class": "wow-caption",
		"id": "caption" + image[ 'id' ],
	} ).text( image[ 'caption' ] ) );
	
	
	// Make the newly added object draggable
	if( edit === true )
	{	
		makeDraggable(  "#" + image[ 'id' ] );
		makeResizeable( "#" + image[ 'id' ] );	
	}
	
	} catch( e ) { console.log( "Error Add Image: " + e ); }
	
} // END Function addImage

// Add a Youtube Video to the Moodboard
// Last change: 2014.12.22
// Input: object: array(id, type, top, left, width, height, zindex, thumbnail, content, caption)
// Output: id for the newly added object: string
function addYoutubeVideo( object, objectscale ) 
{
	try {
	var jQ = jQuery; // Local cached version for jQuery
	var top    = Math.round( object[ 'top' ]    * objectscale );
	var left   = Math.round( object[ 'left' ]   * objectscale );
	var width  = Math.round( object[ 'width' ]  * objectscale );
	var height = Math.round( object[ 'height' ] * objectscale );
	
	var NewObject = jQ( '<object></object>', 
	{
		"id": object[ 'id' ],
		"class": "video-border",
		"name": object[ "content" ],
		"style": 'top:' + top + 'px;left:' + left + 'px;z-index:' + object[ 'zindex' ] + '; background-image: url(' + object[ 'thumbnail' ] + '); background-size: 100% auto;',
		"type": object[ 'type' ],
		"width": width,
		"height": height,
		"title": object[ 'caption' ],
		"thumbnail": object[ 'thumbnail' ]
	}).append( jQ( '<iframe></iframe>',
	{
		"src": "//www.youtube-nocookie.com/embed/" + object[ 'content' ] + "?rel=0&modesbranding=1&showinfo=0",
		'allowfullscreen': false,
		'style':'width:100%;height:100%;background-color:rgba(0,0,0,0);',
		"sandbox" : "allow-scripts allow-same-origin"
	})).append(jQ( "<div></div>",
	{
		"class": "dragging-overlay overlay",
		"id": "overlay" + object[ 'id' ],
		"style": 'z-index:' + object[ 'zindex' ] + ';'
	}));

	jQ( '#wowcanvas' ).append( NewObject );
	
	// Make the newly added Youtube video draggable	
	if( edit === true )
	{	
		makeDraggable(  "#" + object[ 'id' ] );
		makeResizeable( "#" + object[ 'id' ] );	
	}
	
	} catch( e ) { console.log( "Error Add Youtube Video: " + e ); }
} // END addYoutubeVideo