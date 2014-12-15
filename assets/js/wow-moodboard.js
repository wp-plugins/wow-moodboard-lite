/* Part of Name: WoW Moodboard Lite / Pro
   Version: 2014.12.09
   Author: Wow New Media
   Description: JavaScript functions used to load and manage the WoW MoodBoard
   Status: Production
   
   Load before </body>
*/

// Initate the Canvas, create functionality and load all Objects
// Last update: 2014.12.09
function loadCanvas ( wownonce, postid ) 
{ 
	// Export nonce and postid to global because we need them later to save the mood board back to Wordpress
	window.wownonce = wownonce;
	window.postid   = postid;

	// Create a local copy of jQuery for Speed and to prevent $ errors
	var jQ = jQuery;

	// Receive the contents for this Moodboard by AJAX
	try {

	jQ.post(
		ajaxurl,
    	{
	       	action :  'pushcanvas',
			postid :  postid,
			security: wownonce
	   	},
    	function( response ) 
		{				
    	   	// Add all objects from this canvas (JSON)
			try {
				var canvascontent   = JSON.parse( response );
			} catch ( e ) { console.log( "Error Parsing Moodboard contents from Wordpress (check pushcanvas function): " + e ); }
			
			var objects = canvascontent.content;
			var index   = objects.length;
			window.edit	= canvascontent.edit;

			// Clear the MoodBoard before we add anything
			var $dropzonecanvas = jQ( "#canvas" );
			$dropzonecanvas.empty();
				
			// Add all items, Only on non-empty Moodboards
			if ( index ) 
			{	
				// Create the scale of the moodboard that has been saved (100%) 
				// and the moodboard that is beeing showed (x%);
				var widthscale  = Math.round( $dropzonecanvas.width() / canvascontent.width );
				var heightscale = Math.round( $dropzonecanvas.height() / canvascontent.height );

				// Set the Index to point to the last item in the array of objects
				index--;
				
				// Add all the objects to the MoodBoard
				do { // This is faster than a for - in loop
					switch ( objects[ index ].type ) 
					{
						// Add a YouTube Video
						case "youtube#video":
							if (typeof addYoutubeVideo == 'function') 
							{ 
								addYoutubeVideo( objects[ index ], widthscale, heightscale );
							}
							break;
							
						// Add an Image
						case "uploaded#image":
						case "google#image":
							if (typeof addImage == 'function') 
							{ 
								addImage( objects[ index ], widthscale, heightscale );
							}
							break;
						
						// Add a Spotify Music Album
						case "spotify#album":
							if (typeof addSpotifyAlbum == 'function') 
							{ 
								addSpotifyAlbum( objects[ index ], widthscale, heightscale );
							}
							break;
								
						default:
							break;	
					} // Switch Object type
				} while( index-- );
			} // if index
			
			else // This is an Empty Moodboard
			{
				// Show the instructions on how to use the moodboard when we are in edit mode
				if( edit === true ) 
				{
					var wowinstructions = jQ( "<div class='instructions'><h3>" 
												+ canvascontent.header + "</h3><p>" 
												+ canvascontent.instructions + "</p></div" );
					$dropzonecanvas.prepend( wowinstructions );
				}
				
			}
			// Check if we show a canvas that can be edited or a static canvas
		
			if( edit === true )
			{

				// Activate Tabs with jQueryui
				jQ( "#wowtabs" ).tabs();
				
				// Activate the Dropzone
				$dropzonecanvas.droppable( 
				{
					accept: function( d ) 
					{ 
						return d.closest( "#canvasimages" ); 
					},
					activeClass: "ui-state-highlight",
					hoverClass:	 "drop-hover",
   					drop:		 dragDropDiv,
					tolerance: 	 'intersect',
					greedy: 	 true,
				} );
			
				// Set the Event handler to push items to the front while dragging and when clicked
				$dropzonecanvas.delegate( '.dragging-overlay', 
				{ 
					mousedown: function() 
					{ 
						// Bring the Object to the front for dragging
						jQ( this ).parent().css( 'z-index', 200000 ); 
					},
					
					click: function() 
					{ 
						bringFront( "#" + jQ( this ).attr( 'id' ), '.dragging-overlay' ); 
						
						// Show the Caption Edit box
						if ( ! jQ( this ).find( '.wow-captionedit' ).length )
						{
							jQ( this ).append( jQ( "<input type='text' class='wow-captionedit'></input>" ).val( 
								jQ( this ).find( '.wow-caption' ).text() ) 
							); 
						}
						jQ( this ).find( '.wow-caption' ).hide();						
						saveCanvas( wownonce );
					},
					
					mouseleave: function() 
					{
						jQ( this ).find( '.wow-captionedit' ).remove();
					}
				} );
				
				// Set the functionality for a delete button so we can remove objects from the MoodBoard
				$dropzonecanvas.delegate( 'object', 
				{ 
					mouseenter: function () 
					{
						// Show a Delete Button
						var zIndex = jQ( this ).find( '.dragging-overlay' ).zIndex() + 5;
						var deleteBtn = '<p class="deleteBtn" title="Delete" style=";top:0px;left:0px; z-index:' 
										+ zIndex + '"><i class="fa fa-trash-o"></i></p>';
						// Remove all other delete buttons and add the new one
						jQ( "#canvas" ).find( '.deleteBtn' ).remove();
						jQ( this ).append( deleteBtn );	
					},
					mouseleave: function() 
					{
						jQ( this ).parent().find( '.deleteBtn' ).remove();
					}
				});

				//THE DELETE BUTTON CLICK EVENT
				$dropzonecanvas.delegate( ".deleteBtn", 
				{
					click: function() 
					{ 
						jQ( this ).parent().remove();
						saveCanvas( wownonce );
					}
				} );

				// Update the caption when it's changed				
				$dropzonecanvas.delegate( '.wow-captionedit', 
				{ 
					keyup: function() 
					{
						var caption = jQ( this ).closest( 'object' ).find( 'img' );
						caption.attr( 'title', jQ( this ).val() );
						caption.attr( 'alt', jQ( this ).val() );
						jQ( this ).parent().find( '.wow-caption' ).text( jQ( this ).val() );
						saveCanvas( wownonce );
					}
				} );
								
			} // If edit === true
			
			// Create the functionality for a MoodBoard that can't be edited
			else 
			{
				jQ( "#canvas" ).delegate( 'object', 
				{ 
					mouseenter: function () { bringFront( "#" + jQ( this ).attr( 'id' ), '.dragging-overlay' ); }
				} );
			} //edit === false		
			
			// Show the caption on mouseover
			jQ ( "#canvas" ).delegate( 'object', 
			{
				mouseenter: function () 
				{
					if ( jQ( this ).find( '.wow-caption' ).text().length ) // Only show this when we actually have a caption
					{
						jQ( this ).find( '.wow-caption' ).show();
					}
				},
				
				mouseleave: function() 
				{
					jQ( this ).find( '.wow-caption' ).hide();
				} 
			} );
    	}
	);	

	} catch ( e ) { console.log( "Error LoadCanvas: " + e ); }
} // Loadcanvas
	

// Prepare search results and uploaded images so they can be dragged and dropped on the MoodBoard
// Last Change: 2014.12.09
// Input: domid == the #ID of the object to be dragged; object = array with information regarding #ID 
function setDraggable( domid, object ) 
{
	// Create a local copy of jQuery for Speed and to prevent $ errors
	var jQ         = jQuery;	
	var $dragimage = jQ( domid );
	
	// Configure the object
	try {
	
	$dragimage.draggable(
	{
		helper:      'clone',
		containment: '#canvas',
		cursor:      'move',
		revert:      'invalid',
		stack:       '.dragging-overlay',
		zIndex:      500000,
		appendTo:    'body',
		start: function( event, ui ) 
		{	
			// Prepare each type of search results in it's own way
			switch ( object.type ) 
			{
				// YouTube Video Search result
				case "youtube#video":
					// Set the dimensions for the image of the video while dragged and when dropped
					ui.helper.width( 280 );
					ui.helper.height( 210 );
					break;
				
				// Uploaded Image and Google Image Search result
				case "uploaded#image":
				case "google#image":	
					// Start preloading the full size image while draggingit to the MoodBoard
					var imgEl    = new Image();
					imgEl.onload = function() { };
					imgEl.src    = object.unescapedUrl; 
								
					// Set the dimensions for the image while dragged and when dropped
					// We start with a fixed width and calculate the height of the image
					ui.helper.width( 280 );
					ui.helper.height( Math.round( 280 / object.tbWidth * object.tbHeight ) );
					break;
					
				// Spotify Album Search result
				case "spotify#album":
					// Set the dimensions for the image of the Spotify Album while dragged and when dropped
					ui.helper.width( 250 );
					ui.helper.height( 250 );
					break;
					
				default:
					break;
			} // Switch object.type
		} // Function start dragging
	} ); // $dragimage.draggable
		
	// set the data payload for the object 
	$dragimage.data( 'object', object ); 
		
	} catch ( e ) { console.log( "Error Prepare Drag for search results: " + e ); }	
} // END Function setDraggable


// Add a new object to the MoodBoard
// Last Change: 2014.12.09
function dragDropDiv( event, ui )
{
	// Create a local copy of jQuery for Speed and to prevent $ errors
	var jQ = jQuery;
	
	try {
		
	// Check if we have a new Object or if we are just moving around
	if ( ui.draggable && ui.draggable.data( 'object' ) ) 
	{
		// Prepare our MoodBoard to add this new object; use local variables for speed
		// Make sure we have the correct position on the screen ( offset )
		var $dropzone    = jQ( '#canvas' );
		var offset       = ui.offset;
		var canvasOffset = $dropzone.offset();
		var offsetX      = Math.round( offset.left - canvasOffset.left );
		var offsetY      = Math.round( offset.top - canvasOffset.top );
		
		// check if if our object is an image, youtube video, etc and prepare accordingly
		switch ( ui.draggable.data( 'object').type ) 
		{
			// YouTube Video
			case  "youtube#video":
				// Create a unique DOM #ID based on this YouTube Video
				var id = "wowvideo" + ui.draggable.data( 'object' ).id.videoId.hashCode();
	
				// And check if we do not already have an object with this id, so we don't add the same Video twice
				if ( document.getElementById( id ) == null && typeof addYoutubeVideo == 'function' ) 
				{
					var object            = {}; // This is the YouTube object to be added to the MoodBoard	
					object[ 'id' ]        = id;
					object[ 'type' ]      = ui.draggable.data( 'object' ).type;
					object[ 'top' ]       = offsetY;
					object[ 'left' ]      = offsetX;
					object[ 'width' ]     = 280;
					object[ 'height' ]    = 210;
					object[ 'content' ]   = ui.draggable.data( 'object' ).id.videoId;
					object[ 'caption' ]   = ui.draggable.data( 'object' ).snippet.title;
					object[ 'zindex' ]    = getHighestZindex( '.dragging-overlay' ) + 1;
					object[ 'thumbnail' ] = ui.draggable.data( 'object' ).snippet.thumbnails.default.url;
		
					// Add the video to the canvas and bring it forward
					addYoutubeVideo( object, 1, 1 );
					saveCanvas( wownonce );
				}
				break;
			
			// Uploaded Image and Google Image Search result
			case "uploaded#image":
			case "google#image":
				// Create a unique DOM #ID based on this image
				var id = "wowimage" + ui.draggable.data( "object" ).unescapedUrl.hashCode();
				
				// And check if we do not already have an object with this id, so we don't add the same Image twice
				if ( document.getElementById( id ) == null && typeof addImage == 'function' ) 
				{
					var object            = {}; 
					object[ 'id' ]        = id;
					object[ 'type' ]      = ui.draggable.data( 'object' ).type;
					object[ 'top' ]       = offsetY;
					object[ 'left' ]      = offsetX;
					object[ 'width' ]     = 280;
					object[ 'height' ]    = Math.round( 280 / ui.draggable.data( 'object').width * ui.draggable.data( 'object' ).height );
					object[ 'content' ]   = ui.draggable.data( 'object' ).unescapedUrl;
					object[ 'caption' ]   = (typeof ui.draggable.data( 'object' ).title == "undefined" || ui.draggable.data( 'object' ).title == null) ? "" : ui.draggable.data( 'object' ).title;
					object[ 'zindex' ]    = getHighestZindex( '.dragging-overlay' ) + 1;
					object[ 'thumbnail' ] = ui.draggable.data( 'object' ).tbUrl;
						
					// Add the Dropped Image to the MoodBoard
					var image = addImage( object, 1, 1 );
					saveCanvas( wownonce ); // Save the version with the full image

				} // If
				break;
				
			// Spotify Album	
			case "spotify#album":
				// Create a unique DOM #ID based on this Spotify Album
				var id = 'wowmusic' + ui.draggable.data( 'object' ).id.hashCode();
				
				// And check if we do not already have an object with this id, so we don't add the same Album twice
				if ( document.getElementById( id ) == null && typeof addSpotifyAlbum == 'function'  ) 
				{
					var object            = {}; 
					object[ 'id' ]        = id;
					object[ 'type' ]      = ui.draggable.data( 'object' ).type;
					object[ 'top' ]       = offsetY;
					object[ 'left' ]      = offsetX;
					object[ 'width' ]     = 250;
					object[ 'height' ]    = 80;
					object[ 'content' ]   = ui.draggable.data( 'object' ).uri;
					object[ 'caption' ]   = ui.draggable.data( 'object' ).name;
					object[ 'zindex' ]    = getHighestZindex( '.dragging-overlay' ) + 1;
					object[ 'thumbnail' ] = ui.draggable.data( 'object' ).images[ 1 ].url;

					// Add Album to Canvas and bring it forward
					var spotify = addSpotifyAlbum( object, 1, 1 );
					saveCanvas( wownonce );
				} // if
				break;
					
			default:
				break;
		} // Switch object.type	

	} // if 
	
	} catch (e) { console.log( 'Error Drag and Drop: ' + e ); }
} // END Function dragDropDiv


// Add a Image to the Moodboard
// Last change: 2014.12.09
// Input: object: array(id, type, top, left, width, height, zindex, thumbnail, content, caption)
// Output: id for the newly added object: string
function addImage( object, widthscale, heightscale ) 
{
	try {
	var jQ     = jQuery; // Local cached version for jQuery
	var top    = Math.round( object[ 'top' ] * heightscale );
	var left   = Math.round( object[ 'left' ] * widthscale );
	var width  = Math.round( object[ 'width' ] * widthscale );
	var height = Math.round( object[ 'height' ] * widthscale );
		
	var NewObject = jQ( '<object></object>' , 
	{
		"id": object[ 'id' ],
		"class": "image-border",
		"style": 'top:' + top + 'px; left:' + left +'px; z-index:' + object[ 'zindex' ] + '; background-image: url(' + object[ 'thumbnail' ] + '); background-size: 100% auto;',
		"type": object[ 'type' ],
		"width": width,
		"height": height,
		"thumbnail": object[ 'thumbnail' ],
	} ).append( jQ( '<img/>' , 
	{
		"src": object[ 'content' ],
		"title": object[ 'caption' ],
		"alt": object[ 'caption' ],
		"width": width,
		"height": height,
		"style": 'width: 100%; height:100%;',
	} ) ).append( jQ( "<div></div>" ,
	{
		"class": "dragging-overlay overlay",
		"id": "overlay" + object[ 'id' ],
		"style": 'z-index:' + Math.round( object[ 'zindex' ] ) + ';'
	} ) );
	
	jQ( '#canvas' ).append( NewObject );
	
	jQ( "#overlay" + object[ 'id' ] ).append( jQ( "<div></div>",
	{
		"class": "wow-caption",
		"id": "caption" + object[ 'id' ],
	} ).text( object[ 'caption' ] ) );
	
	// Make the newly added object draggable	
	makeDraggable(  "#" + object[ 'id' ] );
	makeResizeable( "#" + object[ 'id' ] );	
	
	} catch( e ) { console.log( "Error Add Image: " + e ); }
	
} // END Function addImage


// Save the MoodBoard to the WordPress Database; This function is called from saveCanvas()
// Last change: 2014.12.09
function saveMoodBoard( wownonce )
{
	var jQ = jQuery;

	var group  = jQ( "#canvas" ).find( 'object' ); // find is faster() than children()
	var canvas = {};
		
	// Prepare all Objects to be saved correctly
	jQ( group ).each( function( i ) 
	{
		var object            = {}; // This is the object to be saved	
		object[ 'id' ]        = jQ( this ).attr( 'id' );
		object[ 'type' ]      = jQ( this ).attr( 'type' );
		object[ 'top' ]       = jQ( this ).css( 'top' );
		object[ 'left' ]      = jQ( this ).css( 'left' );
		object[ 'width' ]     = parseInt( jQ( this ).css( 'width' ), 10 );
		object[ 'height' ]    = parseInt( jQ( this ).css( 'height' ), 10 );
		object[ 'thumbnail' ] = jQ( this ).attr( 'thumbnail' );
		object[ 'zindex' ]    = jQ( this ).zIndex();
				
		// Prepare the differences per objecttype
		switch ( object[ 'type' ] ) 
		{
			case "youtube#video":
			case "spotify#album":
				object[ 'content' ] = jQ( this ).attr( 'name' );
				object[ 'caption' ] = jQ( this ).attr( 'title' );
				break;
				
			case "uploaded#image":
			case "google#image":
				var image = jQ( "#" + object[ 'id' ] ).find( "img" ).first();
				object[ 'content' ] = image.attr( "src" );
				object[ 'caption' ] = image.attr( "title" );
				break;	
			
			default:	
				break;
		}
		canvas[ i ] = object;
	});
		
	// Send the MoodBoard to WordPress AJAX
	jQ.post(
		ajaxurl,
    	{
	        action : 'savecanvas',
			security : wownonce,
			postid : postid,
			canvas: canvas,
			width: jQ( "#canvas" ).width(),
			height: jQ( "#canvas" ).height()
	    },
    	
		function( response ) 
		{
			try {
				var savedmoodboard = JSON.parse( response );
			} catch ( e ) { console.log( "Error Parsing Moodboard save-results from Wordpress (check savecanvas function): " + e ); }
			
			// Show alert if Moodboard could not be saved because user not logged in anymore
			if ( !savedmoodboard.success ) 
			{
				alert( "Save Error: Are you Logged in?" );
				location.reload();
			}
		}
	);
} // END Function saveMoodBoard


// Make a element on the Moodboard Draggable
// Last change: 2014.12.09
// Input: id for the object that will be made draggable
// Output:  true if object exists and has dragging overlay: boolean
function makeDraggable( id ) 
{		
	var jQ = jQuery; // Local cache for jQuery
			
	// Setup the Canvas and object
	var canvasOffset = jQ( "#canvas" ).offset();
	var offsetX      = canvasOffset.left;
	var offsetY      = canvasOffset.top;
	var object       = jQ( id );
	var overlayid    = object.find( ".dragging-overlay" );
						
	// Setup the drag object
	overlayid.draggable({
		appendTo: 	"body",
		iframeFix: 	true,
		cursor: 	'move',
		revert: 	"invalid",
		stack: 		".dragging-overlay",
		zIndex: 	500000,

		drag: function( event, ui ) 
		{
       		object.css( 'left', Math.round( ui.offset.left - offsetX ) ).css( 'top', Math.round( ui.offset.top - offsetY ) ).css( 'z-index',10000000 );
       	},

		stop: function( event, ui ) 
		{
			// Save the changed Object to DB
			object.css( 'z-index', overlayid.zIndex() );
			saveCanvas( wownonce );
		}
	});
						
} // END makeDraggable


// Make a element on the Moodboard Resizeable
// Last change: 2014.12.09
// Input: id for the object that has will be made rersizeable
// Output:  true if object exists and has dragging overlay: boolean
function makeResizeable( id ) 
{		
	var jQ = jQuery; // Local cache for jQuery
			
	// Setup the Canvas and object
	var canvasOffset = jQ( "#canvas" ).offset();
	var object       = jQ( id );
	var $overlayid   = object.find( ".dragging-overlay" );
	
	// Create compensation for padding during resize
	var widthcompensation  = Math.round( object.width()  - $overlayid.width() );
	var heightcompensation = Math.round( object.height() - $overlayid.height() );
	
	var $resizeobject = $overlayid.resizable( 
	{ 
		aspectRatio: true,
		handles: "se",
		maxWidth: 1000,
		minWidth: 150,
		resize: function( event, ui ) 
		{
			clearTimeout( window.resizeID ); // Clear the event for the window resize to prevent reload of the moodboard
			
			var width  = Math.round( ui.size.width ) + widthcompensation;
			var height = Math.round( ui.size.height ) + heightcompensation;
			object.css( 'width', width + "px" ).css( 'height', height + "px" );
		},
		stop: function( event, ui ) 
		{
			saveCanvas( wownonce );	
		}
	});
} // END makeResizeable


// Brings an element to the front of a stack
// Last change: 2014.08.28
function bringFront( elem, stack )
{
	var jQ = jQuery;
	var index_highest = getHighestZindex( stack )
     
    if( jQ( elem ) == undefined || Number( jQ( elem ).css( "zIndex" ) ) == index_highest ) return;
    
	jQ( elem ).css( { 'zIndex' : index_highest + 1 } );
	jQ( elem ).parent( 'object' ).css( { 'zIndex' : index_highest + 1 } );
} // END bringFront


// Returns the Highest zIndex used in a stack
// Last change: 2014.08.28
function getHighestZindex( stack ) 
{
	var jQ = jQuery;
	var group = jQ( stack );
	var index_highest = 0; 

	// Get the currently highest z-index
	jQ( group ).each( function() {
    	var index_current = Number( jQ( this ).css( "zIndex" ) );
	 	
		// Set all the Objects to the same zIndex as the overlays 
		jQ( this ).parent().css( { 'zIndex' : index_current } );

    	if( index_current > index_highest ) 
		{
        	index_highest = index_current;
    	}
    } );	

	return index_highest;
}  // END getHighestZindex


// Create a hash for a string
// Last change: 2014.08.28
String.prototype.hashCode = function() 
{
	var hash = 0, i, chr, len;
  	if ( this.length == 0 ) return hash;
	
	for ( i = 0, len = this.length; i < len; i++ ) 
	{
    	chr   = this.charCodeAt( i );
    	hash  = ( ( hash << 5 ) - hash ) + chr;
    	hash |= 0; // Convert to 32bit integer
  	}
  	return hash;
}; // END String.prototype.hashCode


// Load Youtube Search
// The apiKey is obtained from the Google Developers Console
// at https://console.developers.google.com/.
// Last change: 2014.08.28
function googleApiClientReady() 
{	
	gapi.client.setApiKey( apiKey );
	gapi.client.load( 'youtube', 'v3', function() {
   		jQuery( '#youtube-search-button' ).attr( 'disabled', false );
	});	
} // END Function googleApiClientReady


// YouTube Video search: Search for a specified string.
// Last change: 2014.12.09
function youtubesearch() 
{
	var jQ = jQuery;
	
	jQ( document ).ready( function( $ ) 
	{
		var q = jQ( '#youtubequery' ).val();
		var request = gapi.client.youtube.search.list(
		{
			q: q,
			part: 'snippet',
			maxResults: YTmaxResults,
			safeSearch: "moderate",
			type: "video",
			videoEmbeddable: true,
		});

		request.execute( function( response ) {
			
			// Grab our content div, show clear results button.
			jQ( "#clearsearchresults" ).show();	
         	var contentDiv = document.getElementById( 'canvasimages' );
			
			var i = response.items.length -1;
			
			// Since we prepend the results we go through the array in reverse order (and its faster)
			do {		
					
            	var imgContainer = document.createElement( 'div' );
				var newImg       = document.createElement( 'img' );
				var uniqueid     = response.items[ i ].id.videoId.hashCode();
				response.items[ i ].snippet.thumbnails.default.url = window.wowproxyurl + response.items[ i ].snippet.thumbnails.default.url;
				
				newImg.id    = "imageresult" + uniqueid;	
				newImg.title = "YouTube: " + response.items[ i ].snippet.title;
				newImg.src   = response.items[ i ].snippet.thumbnails.default.url;
				newImg.setAttribute( 'width', 93 );
				newImg.setAttribute( 'height', 70 );
					
				imgContainer.appendChild( newImg );
				imgContainer.className = "scroll-content-item";
				
				contentDiv.insertBefore( imgContainer, contentDiv.firstChild );						
				jQ( "#imageresult" + uniqueid ).css( 'width','93px' ).css( 'height','70px' );
				var activateDom = jQ( "#imageresult" + uniqueid ).html(); // Somehow the image isn't directly available in the DOM

				response.items[ i ].type = response.items[ i ].id.kind;
				setDraggable( "#imageresult" + uniqueid, response.items[ i ] );

			} while ( i-- );
			
			//init scrollbar size
			sizeScrollbar();
			reflowContent();
			resetValue();
		
		});
	});
}
// END of YouTube Search Functions


// Set Scrollbar for imageresults
// Last change: 2014.11.25
function CreateScrollbar() 
{
	var jQ = jQuery; // Local cached version for jQuery
	 
	//scrollpane parts
	var scrollPane = jQ( ".scroll-pane" ), scrollContent = jQ( ".scroll-content" );
	
	//build slider
	var scrollbar = jQ( ".scroll-bar" ).slider( {
		slide: function( event, ui ) {
			if ( scrollContent.width() > scrollPane.width() ) {
				scrollContent.css( "margin-left", Math.round(
					ui.value / 100 * ( scrollPane.width() - scrollContent.width() )
				) + "px" );
			} else {
				scrollContent.css( "margin-left", 0 );
			} 
		},
		animate: "fast",
		value: 0,
		max: 100,
		min: 0,
	});
	
	//append icon to handle
	var handleHelper = scrollbar.find( ".ui-slider-handle" ).mousedown(function() 
	{
		scrollbar.width( handleHelper.width() );
	})
	.mouseup(function() 
	{
		scrollbar.width( "100%" );
	})
	.append( "<span class='ui-icon ui-icon-grip-dotted-vertical'></span>" )
	.wrap( "<div class='ui-handle-helper-parent'></div>" ).parent();
	//change overflow to hidden now that slider handles the scrolling
	scrollPane.css( "overflow", "hidden" );
	
} // END function CreateScrollbar


// Fit the Scrollbar
// Last change: 2014.12.09
function sizeScrollbar() 
{
	 var jQ = jQuery; // Local cached version for jQuery
	 
	//scrollpane parts
	var scrollPane = jQ( ".scroll-pane" ), scrollContent = jQ( ".scroll-content" );
	var scrollbar = jQ( ".scroll-bar" );
	var handleHelper = scrollbar.find( ".ui-slider-handle" );
	
	var handleSize = Math.round( scrollPane.width() / 5 );
	scrollbar.find( ".ui-slider-handle" ).css({
		width: handleSize,
		"margin-left": -handleSize / 2
	});
	
	// Reset width of element with the size of the current image and margin of 20px
	var width = 0;
	jQ( ".scroll-content-item" ).each(function() {
		width += Math.round( jQ( this ).outerWidth( true ) )
	});

	if ( width <= scrollPane.parent().width() ) {
		scrollContent.width( "100%" );
		scrollbar.hide();
	} else {
		scrollContent.width( width );
		scrollbar.show();
	}
} // END function sizeScrollbar


//reset slider value based on scroll content position
// Last change: 2014.11.25
function resetValue() 
{
	 var jQ = jQuery; // Local cached version for jQuery
	 
	//scrollpane parts
	var scrollPane = jQ( ".scroll-pane" ), scrollContent = jQ( ".scroll-content" );
	var scrollbar = jQ( ".scroll-bar" );
	
	var remainder = scrollPane.width() - scrollContent.width();
	var leftVal = 	scrollContent.css( "margin-left" ) === "auto" ? 0 :
					parseInt( scrollContent.css( "margin-left" ), 10 );
	var percentage = Math.round( leftVal / remainder * 100 );
	scrollbar.slider( "value", percentage );
} // END function resetValue


//if the slider is 100% and window gets larger, reveal content
// Last change: 2014.11.25
function reflowContent() 
{
	 var jQ = jQuery; // Local cached version for jQuery
	 
	//scrollpane parts
	var scrollPane = jQ( ".scroll-pane" ), scrollContent = jQ( ".scroll-content" );
	var scrollbar = jQ( ".scroll-bar" )
	
	var showing = scrollContent.width() + parseInt( scrollContent.css( "margin-left" ), 10 );
	var gap = scrollPane.width() - showing;
	if ( gap > 0 ) {
		scrollContent.css( "margin-left", parseInt( scrollContent.css( "margin-left" ), 10 ) + gap );
	}
} // END function reflowContent


// Clear the Search results
// Last change: 2014.11.25
function resetImageResults() 
{
	 var jQ = jQuery; // Local cached version for jQuery

	// Grab our content div, clear it.
    jQ( "#canvasimages" ).empty();
	jQ( ".scroll-content" ).width( "100%" );
	jQ( ".scroll-bar" ).hide();	
	jQ( "#clearsearchresults" ).hide();	
} // END function resetImageResults