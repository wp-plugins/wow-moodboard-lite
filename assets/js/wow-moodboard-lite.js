/* Part of Name: WoW Moodboard Lite
   Version: 1.0.4 [ 2014.12.22 ]
   Author: Wow New Media
   Description: JavaScript functions used in WoW MoodBoard Lite
   Status: Production
   
   Load before </body>
*/

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
		"frameborder": "0",
		'allowtransparency': true,
		'style':'width:100%;height:100%;background-color:rgba(0,0,0,0);',
		"sandbox" : "allow-scripts allow-same-origin"
	})).append(jQ( "<div></div>",
	{
		"class": "dragging-overlay overlay",
		"id": "overlay" + object[ 'id' ],
		"style": 'z-index:' + object[ 'zindex' ] + ';'
	}));

	jQ( '#canvas' ).append( NewObject );
	
	// Make the newly added Youtube video draggable	
	makeDraggable(  "#" + object[ 'id' ] );
	makeResizeable( "#" + object[ 'id' ] );	

	} catch( e ) { console.log( "Error Add Youtube Video: " + e ); }
} // END addYoutubeVideo