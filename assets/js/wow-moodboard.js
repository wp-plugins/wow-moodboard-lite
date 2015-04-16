/* Part of Name: WoW Moodboard Lite / Pro
   Version: 1.1.1 [ 2015.04.13 ]
   Author: Wow New Media
   Description: JavaScript functions used to load and manage the WoW MoodBoard
   Status: Production
   
   Load before </body>
*/

// Initate the Moodboard and create it's functionality.
// Last update: 2014.12.19
function initMoodboard ( wownonce, postid )
{
	// Create a local copy of jQuery for Speed and to prevent jQuery-$ errors
	var jQ = jQuery;
	
	// Export nonce and postid to global because we need them later to save the mood board back to Wordpress
	window.wownonce = wownonce;
	window.postid   = postid;
	window.mbwidth  = jQ( "#wowcanvas").width(); // Used to check if the width of the Moodboard has changed after a window resize
	
	// Receive the settings for this Moodboard by AJAX
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
			try {
			
			// Receive all objects for this Moodboard from WordPress backend (JSON) 
			var moodboardconfig = JSON.parse( response );
			
			} catch ( e ) { console.log( "Error Parsing Moodboard config from Wordpress (check pushcanvas function): " + e ); }

			// The Moodboard configuration
			var canvasheight = typeof moodboardconfig.height    !== 'undefined' ? moodboardconfig.height    : 500;
			var bgimage		 = typeof moodboardconfig.bgimage   !== 'undefined' ? moodboardconfig.bgimage   : "";
			var bgcontain	 = typeof moodboardconfig.bgcontain !== 'undefined' ? moodboardconfig.bgcontain : "inherit";
			var bgrepeat	 = typeof moodboardconfig.bgrepeat  !== 'undefined' ? moodboardconfig.bgrepeat  : "round";
			window.edit		 = typeof moodboardconfig.edit      !== 'undefined' ? moodboardconfig.edit      : false;
			
			// Create the Moodboard object, set it's height and set it's background
			var Moodboard = jQ( "#wowcanvas" );
			var cssheight = canvasheight + "px";
			Moodboard.css( { 'height'           : cssheight, 
							 'background-repeat': bgrepeat, 
							 'background-size'  : bgcontain, 
							 'background-image' : bgimage 
			} );
			
			// Setup the functionality of the Moodboard
			// Setup a Basic Moodboard which is only viewable
			if( edit != true )
			{
				Moodboard.delegate( 'object', 
				{ 
					// Move the object to the front of the Moodboard
					// Show/Hide the caption
					mouseenter: function() 
					{ 
						bringtoFront( jQ( this ), '.dragging-overlay' ); 
						showCaption( jQ( this ) );
					},
					mouseleave: function() 
					{
						hideCaption( jQ( this ) );
					} 
				} );
				
				if (  typeof( clickedonImage ) == "function" ) 
				{
					Moodboard.delegate( 'img', 
					{ 
						click: function()
						{
							clickedonImage( jQ( this ) );
						},
						
						mouseover: function()
						{
							if ( typeof jQ( this ).attr( "href" ) !== 'undefined' )  
							{
								jQ( this ).css( {'cursor': 'pointer'} );
							}
						}
					} );
				}
			}

			// Setup a Moodboard that can be edited
			else if( edit === true )
			{	
				Moodboard.delegate( 'object', 
				{ 
					// Set the functionality for a delete button so we can remove objects from the Moodboard
					// Show/Hide the caption
					mouseenter: function () 
					{
						ShowDeleteButton( jQ( this ) );
						showCaption( jQ( this ) );
					},
					mouseleave: function() 
					{
						RemoveDeleteButton( jQ( this ) );
						hideCaption( jQ( this ) );
					}
				} );
				
				// Set the Event handler to push items to the front while dragging and when clicked
				Moodboard.delegate( '.dragging-overlay', 
				{ 
					mousedown: function() 
					{ 
						bringtoFront( jQ( this ), '.dragging-overlay' ); 
					},
					click: function() 
					{ 
						showCaptionEdit( jQ( this ) );
						if (  typeof( showURLEdit ) == "function" ) 
						{
							showURLEdit( jQ( this ) );
						}
					},
					mouseleave: function() 
					{
						hideCaptionEdit( jQ( this ) );
						if (  typeof( hideURLEdit ) == "function" ) 
						{
							hideURLEdit( jQ( this ) );
						}						
					}
				} );				
				
				// Update the caption when it's changed				
				Moodboard.delegate( '.wow-captionedit', 
				{ 
					keyup: function() 
					{
						saveCaption( jQ( this ) );
					}
				} );
				
				// Update the caption when it's changed				
				Moodboard.delegate( '.wow-urledit', 
				{ 
					keyup: function() 
					{
						saveURL( jQ( this ) );
					}
				} );
				
				// Activate the default text in the input fields
				Moodboard.delegate( '.defaultText',
				{
					focusin: function()
					{ 
						if ( jQ( this ).val() === jQ( this ).attr( 'title' ) )
        				{
            				jQ( this ).removeClass( "defaultTextActive" );
            				jQ( this ).val( "" );
        				}
					},
					
					focusout: function()
					{
						if ( !jQ( this ).val() )
        				{
            				jQ( this ).addClass( "defaultTextActive" );
            				jQ( this ).val( jQ( this ).attr( 'title' ) );
        				}	
					}
				} );
				
				// Delete this object when it's delete button is clicked
				Moodboard.delegate( ".deleteBtn", 
				{
					click: function() 
					{ 
						DeleteObject( jQ( this ).parent() );
					}
				} );
				
				// Activate the Dropzone for new objects to be added
				Moodboard.droppable( 
				{
					accept: function( d ) 
					{ 
						// Only allow elements from the search results bar to be added
						return d.closest( "#wowcanvasimages" ); 
					},
					activeClass: "ui-state-highlight",
					hoverClass:	 "drop-hover",
   					drop:		 dragDropDiv,
					tolerance: 	 'touch',
					greedy: 	 true,
				} );
								
			} // End else if edit === true
			
			// Now Populate the Moodboard
			loadCanvas( wownonce, postid );
		
		} ); // End AJAX Response function

	} catch ( e ) { console.log( "Error initMoodboard: " + e ); }		
}


// Populate the Moodboard with all it's Objects
// Last update: 2014.12.19
function loadCanvas ( security, wppostid ) 
{ 
	// Create a local copy of jQuery for Speed and to prevent $ errors
	var jQ = jQuery;
	
	// Receive the contents for this Moodboard by AJAX
	try {

	jQ.post(
		ajaxurl,
    	{
	       	action :  'pushcanvas',
			postid :  wppostid,
			security: security
	   	},
    	function( response ) 
		{				
    	   	// Receive all objects for this Moodboard from WordPress backend (JSON)
			try {
				var moodboardcontent   = JSON.parse( response );
			} catch ( e ) { console.log( "Error Parsing Moodboard contents from Wordpress (check pushcanvas function): " + e ); }
			
			// Populate Variables
			var Moodboard   = jQ( "#wowcanvas" );
			var objects     = moodboardcontent.content; // Our Objects placed on this Moodboard
			var index       = objects.length;			 // The number of objects placed on this Moodboard

			// In case the 'switcheditmode' checkbox is checked, the user has adminrights but want to see the Moodboard as a regular user
			var edit	    = jQ( "#switcheditmode" ).is( ':checked' ) ? false : moodboardcontent.edit;
			var canvaswidth = typeof moodboardcontent.width  !== 'undefined' ? moodboardcontent.width  : Moodboard.width();

			// Clear the MoodBoard before we add anything and set it's background
			Moodboard.empty();
			ResetOffsetWindow();
	
			// Add all items, Only on non-empty Moodboards
			if ( index ) 
			{	
				index--;

				// Create the scale of the moodboard that has been saved (100%) 
				// and the moodboard that is beeing showed (x%);
				var objectscale = typeof moodboardpro !== 'undefined' ? Number( Moodboard.width() ) / Number( canvaswidth ) : 1;
				
				// Add all our objects to the Moodboard
				do { addObjecttoMoodboard( objects[ index ], objectscale ); } while( index-- );
			}
			
			// Setup an Empty Moodboard
			else 
			{
				// Show the instructions on how to use the moodboard when we are in edit mode
				if( edit === true ) 
				{
					var wowinstructions = jQ( "<div class='instructions'><h3>" + moodboardcontent.header + "</h3>" 
												+ "<p>" + moodboardcontent.instructions + "</p></div" );
					Moodboard.prepend( wowinstructions );
				}	
			}			
    	
			// Initialize the canvas to be resized (Pro version only)
			if (  edit === true && typeof( setResizableCanvas ) == "function" ) 
			{	
				setResizableCanvas();
			}
		}
	);	
	} catch ( e ) { console.log( "Error Populate Moodboard (loadcanvas): " + e ); }
} // Loadcanvas
	

// Prepare search results and uploaded images so they can be dragged and dropped on the MoodBoard
// Last Change: 2014.12.19
function setDraggable( thumbnailID, payload ) 
{
	// Create a local copy of jQuery for Speed and to prevent $ errors
	var jQ            = jQuery;	
	var dragThumbnail = jQ( thumbnailID );
	
	// Configure the object
	try {
	
	var topZindex = getHighestZindex( '.dragging-overlay' ) + 5000;

	dragThumbnail.draggable(
	{
		helper:      'clone',
		containment: '#wowcanvas',
		cursor:      'move',
		revert:      'invalid',
		stack:       '.dragging-overlay',
		zIndex:      topZindex,
		appendTo:    '#wowcanvas',
		refreshPositions: true,

		start: function( event, ui ) 
		{	
			// Prepare each type of search results in it's own way
			switch ( payload.type ) 
			{
				// YouTube Video Search result
				case "youtube#video":
					// Set the dimensions for the image of the video while dragged and when dropped
					ui.helper.width( 280 );
					ui.helper.height( 210 );
					break;
				
				// Uploaded Image, Google Image Search result, Seamless image for background
				case "uploaded#image":
				case "google#image":	
				case "background#image":				
					// Start preloading the full size image while draggingit to the MoodBoard
					var imageWidth = 280;
					var imgEl      = new Image();
					imgEl.onload   = function() { };
					imgEl.src      = payload.unescapedUrl; 
					
					// Set the dimensions for the image while dragged and when dropped
					// We start with a fixed width and calculate the height of the image
					ui.helper.width( imageWidth );
					ui.helper.height( imageWidth / payload.tbWidth * payload.tbHeight );
					break;
				
				// Spotify Album Search result
				case "spotify#album":
					// Set the dimensions for the image of the Spotify Album while dragged and when dropped
					ui.helper.width( 250 );
					ui.helper.height( 250 );
					break;
					
				default:
			} // Switch object.type
		} // Function start dragging
	} ); // dragThumbnail.draggable
		
	// set the data payload for the object 
	dragThumbnail.data( 'object', payload ); 
		
	} catch ( e ) { console.log( "Error Prepare Drag for search results: " + e ); }	
} // END Function setDraggable


// Make an element on the Moodboard Draggable
// Last change: 2014.12.19
function makeDraggable( ObjectID ) 
{		
	var jQ         = jQuery; // Local cache for jQuery	
	var dragObject = jQ( ObjectID );
	var overlayid  = dragObject.find( ".dragging-overlay" );
						
	// Setup the drag object
	var topZindex = getHighestZindex( '.dragging-overlay' ) + 5000;
	
	overlayid.draggable(
	{
		containment: '#wowcanvas',
		appendTo: 	 "body",
		iframeFix: 	 true,
		cursor: 	 'move',
		revert: 	 "invalid",
		stack: 		 ".dragging-overlay",
		zIndex: 	 topZindex,
		refreshPositions: true,

		drag: function( event, ui ) 
		{
			var left = ui.offset.left - window.offsetX;
			var top  = ui.offset.top - window.offsetY;
			var zIndex = topZindex + 100;
       		dragObject.css( { 'left': left, 'top': top,'z-index': zIndex } );
       	},

		stop: function( event, ui ) 
		{
			bringtoFront( dragObject, '.dragging-overlay' ); 			
			// Save the changed Object to DB
			saveCanvas( wownonce );
		}
	});
} // END makeDraggable


// Make a element on the Moodboard Resizeable
// Last change: 2015.03.16
function makeResizeable( ObjectID ) 
{		
	var jQ = jQuery; // Local cache for jQuery
				
	// Setup the Canvas and object
	var sizeObject = jQ( ObjectID );
	var overlay    = sizeObject.find( ".dragging-overlay" );
	
	// Reset the resize config if it has been set already
	if ( overlay.is( '.ui-resizable' ) )
	{
		overlay.resizable( "destroy" );
	}

	// Create compensation for padding during resize
	var widthcompensation  = sizeObject.width()  - overlay.width();
	var heightcompensation = sizeObject.height() - overlay.height();
	
	setTimeout( function() 
	{
		
	var resizeObject = overlay.resizable( 
	{ 
		aspectRatio: true,
		handles: "all",
		maxWidth: 1000,
		autoHide: false,
		containment: "#wowcanvas",
		
		resize: function( event, ui ) 
		{
			clearTimeout( window.resizeID ); // Clear the event for the window resize to prevent reload of the moodboard
			
			var width  = ( ui.size.width  + widthcompensation ) + "px";
			var height = ( ui.size.height + heightcompensation ) + "px";
			sizeObject.css( { 'width': width, 'height': height } );
		},
		stop: function( event, ui ) 
		{
			saveCanvas( window.wownonce );	
		}
	} );
	
	}, 500);
} // END makeResizeable


// Add a new object to the MoodBoard
// Last Change: 2014.12.20
function dragDropDiv( event, ui )
{
	try {
		
	// Check if we are adding a new Object
	if ( ui.draggable && ui.draggable.data( 'object' ) ) 
	{
		// Prepare our MoodBoard to add this new object; use local variables for speed
		var offset  = ui.position;
		var offsetX = offset.left; 
		var offsetY = offset.top; 
		
		// Set general options for all data types
		var Addobject         = {};
		Addobject[ 'zindex' ] = getHighestZindex( '.dragging-overlay' ) + 1;
		Addobject[ 'type' ]   = ui.draggable.data( 'object' ).type;
		Addobject[ 'top' ]    = offsetY;
		Addobject[ 'left' ]   = offsetX;

		// set options per data type
		switch ( ui.draggable.data( 'object').type ) 
		{
			// YouTube Video
			case  "youtube#video":
				// Create a unique DOM #ID based on this YouTube Video
				var id = "wowvideo" + ui.draggable.data( 'object' ).id.videoId.hashCode();
	
				// And check if we do not already have an object with this id, so we don't add the same Video twice
				if ( document.getElementById( id ) == null && typeof addYoutubeVideo == 'function' ) 
				{
					 // This is the YouTube object to be added to the MoodBoard	
					Addobject[ 'id' ]        = id;
					Addobject[ 'type' ]      = ui.draggable.data( 'object' ).type;
					Addobject[ 'width' ]     = 280;
					Addobject[ 'height' ]    = 210;
					Addobject[ 'content' ]   = ui.draggable.data( 'object' ).id.videoId;
					Addobject[ 'caption' ]   = ui.draggable.data( 'object' ).snippet.title;
					Addobject[ 'thumbnail' ] = ui.draggable.data( 'object' ).snippet.thumbnails.default.url;
		
					// Add the video to the canvas and bring it forward
					addYoutubeVideo( Addobject, 1 );
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
					Addobject[ 'id' ]        = id;
					Addobject[ 'width' ]     = 280;
					Addobject[ 'height' ]    = 280 / ui.draggable.data( 'object').width * ui.draggable.data( 'object' ).height;
					Addobject[ 'content' ]   = ui.draggable.data( 'object' ).unescapedUrl;
					Addobject[ 'caption' ]   = (typeof ui.draggable.data( 'object' ).title == "undefined" || ui.draggable.data( 'object' ).title == null) ? "" : ui.draggable.data( 'object' ).title;
					Addobject[ 'thumbnail' ] = ui.draggable.data( 'object' ).tbUrl;
						
					// Add the Dropped Image to the MoodBoard
					addImage( Addobject, 1 );
				} // If
				break;
				
			// Spotify Album	
			case "spotify#album":
				// Create a unique DOM #ID based on this Spotify Album
				var id = 'wowmusic' + ui.draggable.data( 'object' ).id.hashCode();
				
				// And check if we do not already have an object with this id, so we don't add the same Album twice
				if ( document.getElementById( id ) == null && typeof addSpotifyAlbum == 'function'  ) 
				{
					Addobject[ 'id' ]        = id;
					Addobject[ 'width' ]     = 250;
					Addobject[ 'height' ]    = 80;
					Addobject[ 'content' ]   = ui.draggable.data( 'object' ).uri;
					Addobject[ 'caption' ]   = ui.draggable.data( 'object' ).name;
					Addobject[ 'thumbnail' ] = ui.draggable.data( 'object' ).images[ 1 ].url;

					// Add Album to Canvas and bring it forward
					addSpotifyAlbum( Addobject, 1 );
				} // if
				break;
					
			// Seamless image for background	
			case "background#image":
				//set the image as background for this moodboard
				jQuery( '#wowcanvas' ).css( "background-image", "url(" + ui.draggable.data( 'object' ).unescapedUrl + ")" );
				break;
			default:
			
		} // Switch object.type	
		saveCanvas( wownonce );

	} // if 
	
	} catch (e) { console.log( 'Error Drag and Drop: ' + e ); }
} // END Function dragDropDiv


// Save the MoodBoard to the WordPress Database; This function is called from saveCanvas()
// Last change: 2015.01.05
function saveMoodBoard( wownonce )
{
	var jQ = jQuery;

	// Get all objects on this Moodboard
	var Moodboard = jQ( "#wowcanvas" );
	var group     = Moodboard.find( 'object' ); // find is faster() than children()
	var canvas    = {};
		
	// Prepare all Objects to be saved correctly
	jQ( group ).each( function( i ) 
	{
		// Create the object to be saved
		var object            = {};	
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
				var image           = jQ( "#" + object[ 'id' ] ).find( "img" ).first();
				object[ 'content' ] = image.attr( "src" );
				object[ 'caption' ] = image.attr( "title" );
				object[ 'href' ]    = image.attr( "href" );
				break;	
			
			default:	
		}
		
		canvas[ i ] = object;
	} );

		
	// Send the MoodBoard to WordPress backend with AJAX call
	Moodboard.find( '.deleteBtn' ).remove(); 
	jQ.post(
		ajaxurl,
    	{
	        action    : 'savecanvas',
			security  : wownonce,
			postid    : postid,
			canvas    : canvas,
			moodboard : Moodboard.html(),
			width     : Moodboard.width(),
			height    : Moodboard.height(),
			bgimage   : Moodboard.css( "background-image" ),
			bgcontain : Moodboard.css( "background-size" ),
			bgrepeat  : Moodboard.css( "background-repeat" ),
	    },
    	
		function( response ) 
		{
			try 
			{
				var savedmoodboard = JSON.parse( response );
				
			} catch ( e ) { console.log( "Error Parsing Moodboard save-results from Wordpress (check savecanvas function): " + e ); }
			
			// Show alert if Moodboard could not be saved ( mostly occurs because user not logged in anymore / session expired )
			if ( !savedmoodboard.success ) 
			{
				alert( "Saving Moodboard Error: Are you Logged in?" );
				location.reload();
			}
		}
	);
} // END Function saveMoodBoard


// Brings an element to the front of a stack
// Last change: 2014.12.18
function bringtoFront( element, stack )
{
	var jQ = jQuery;
	var index_highest = getHighestZindex( stack )

	// Either this element does not exist, or it is already on top of the stack 
    if( element == undefined || element.css( "zIndex" ) == index_highest ) 
	{	
		return false;
	}
    else
	{
		element.css( { 'zIndex' : index_highest + 1 } );
		element.parent( 'object' ).css( { 'zIndex' : index_highest + 1 } );
	
		if ( edit === true ) 
		{
			// Save the Moodboard because this object is now on the front of the stack 
			saveCanvas( wownonce );		
		}
		
		return true;
	}
} // END bringtoFront


// Returns the Highest zIndex used in a stack
// Last change: 2014.08.28
function getHighestZindex( stack ) 
{
	var jQ            = jQuery;
	var group         = jQ( stack );
	var index_highest = 0; 

	// Get the currently highest z-index
	jQ( group ).each( function() 
	{
    	var index_current = Number( jQ( this ).zIndex() );
	 	
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
	// Setup the Search Query
	var jQ      = jQuery;
	var request = gapi.client.youtube.search.list(
	{
		q               : jQ( '#youtubequery' ).val(),
		part            : 'snippet',
		maxResults      : YTmaxResults,
		safeSearch      : "none",
		type            : "video",
		videoEmbeddable : true,
	});

	// Execute the Search Query
	request.execute( function( response ) 
	{
		// Grab our content div, show clear results button.
		jQ( "#clearsearchresults" ).show();	
		var i = response.items.length -1;
			
		do 
		{		
			response.items[ i ].type = response.items[ i ].id.kind;
			response.items[ i ].snippet.thumbnails.default.url = window.wowproxyurl + response.items[ i ].snippet.thumbnails.default.url;

			var uniqueid = response.items[ i ].id.videoId.hashCode();
			var caption  = response.items[ i ].snippet.title;
			var url      = response.items[ i ].snippet.thumbnails.default.url
			var width    = 93;
			var payload  = response.items[ i ];
			
			CreateSearchresultThumbnail( uniqueid, caption, url, width, payload );		
			
		} while ( i-- );
			
			//init scrollbar size
			sizeScrollbar();
			reflowContent();
			resetValue();
		
		});
}
// END of YouTube Search Functions

// Create a thumbnail with Payload to be added to the search results
// Last change: 2014.12.20
function CreateSearchresultThumbnail( uniqueid, caption, url, width, payload )
{	
	var jQ      = jQuery;
	var thumbID = "searchresult" + uniqueid;
	
	// Only add this thumbnail if it isn't beeing shown on the resultsbar already
	if ( ! jQ( "#" + thumbID ).length )
	{
		// Create Thumbnail
		jQ( '<img>', {
			id: thumbID,
			title: caption,
			src: url,
			width: width,
			height: 70,
		} ).appendTo( 

		// Create Imagecontainer
		jQ( '<div/>', 
		{
    		id: "scroll" + uniqueid,
			class: "scroll-content-item",
		} ).prependTo( '#wowcanvasimages' ) );

		setDraggable( "#" + thumbID , payload );
	}
}


// Set Scrollbar for imageresults
// Last change: 2014.11.25
function CreateScrollbar() 
{
	var jQ = jQuery; // Local cached version for jQuery
	 
	//scrollpane parts
	var scrollPane    = jQ( ".scroll-pane" );
	var scrollContent = jQ( ".scroll-content" );
	
	//build slider
	var scrollbar = jQ( ".scroll-bar" ).slider( 
	{
		slide: function( event, ui ) 
		{
			if ( scrollContent.width() > scrollPane.width() ) {
				scrollContent.css( "margin-left", Math.round(
					ui.value / 100 * ( scrollPane.width() - scrollContent.width() )
				) + "px" );
			} else {
				scrollContent.css( "margin-left", 0 );
			} 
		},
		animate: "slow",
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
	var scrollPane    = jQ( ".scroll-pane" );
	var scrollContent = jQ( ".scroll-content" );
	var scrollbar     = jQ( ".scroll-bar" );
	var handleHelper  = scrollbar.find( ".ui-slider-handle" );
	
	var handleSize    = Math.round( scrollPane.width() / 5 );
	scrollbar.find( ".ui-slider-handle" ).css( {
		width: handleSize,
		"margin-left": -handleSize / 2
	} );
	
	// Reset width of element with the size of the current image and margin of 20px
	var width = 0;
	jQ( ".scroll-content-item" ).each(function() {
		width += Math.round( jQ( this ).outerWidth( true ) )
	} );

	if ( width <= scrollPane.parent().width() ) {
		scrollContent.width( "100%" );
		scrollbar.hide();
	} else {
		scrollContent.width( width );
		scrollbar.show();
	}
	
	// Set the offset for the Moodboard
	ResetOffsetWindow();

} // END function sizeScrollbar


//reset slider value based on scroll content position
// Last change: 2014.11.25
function resetValue() 
{
	 var jQ = jQuery; // Local cached version for jQuery
	 
	//scrollpane parts
	var scrollPane    = jQ( ".scroll-pane" ); 
	var scrollContent = jQ( ".scroll-content" );
	var scrollbar     = jQ( ".scroll-bar" );
	
	var remainder     = scrollPane.width() - scrollContent.width();
	var leftVal       = scrollContent.css( "margin-left" ) === "auto" ? 0 :
					   		parseInt( scrollContent.css( "margin-left" ), 10 );
	var percentage    = Math.round( leftVal / remainder * 100 );
	scrollbar.slider( "value", percentage );
} // END function resetValue


//if the slider is 100% and window gets larger, reveal content
// Last change: 2014.11.25
function reflowContent() 
{
	 var jQ = jQuery; // Local cached version for jQuery
	 
	//scrollpane parts
	var scrollPane    = jQ( ".scroll-pane" );
	var scrollContent = jQ( ".scroll-content" );
	var scrollbar     = jQ( ".scroll-bar" );
	
	var showing       = scrollContent.width() + parseInt( scrollContent.css( "margin-left" ), 10 );
	var gap           = scrollPane.width() - showing;
	if ( gap > 0 ) 
	{
		scrollContent.css( "margin-left", parseInt( scrollContent.css( "margin-left" ), 10 ) + gap );
	}
} // END function reflowContent


// Clear the Search results
// Last change: 2014.11.25
function resetImageResults() 
{
	 var jQ = jQuery; // Local cached version for jQuery

	// Grab our content div, clear it.
    jQ( "#wowcanvasimages" ).empty();
	jQ( ".scroll-content" ).width( "100%" );
	jQ( ".scroll-bar" ).hide();	
	jQ( "#clearsearchresults" ).hide();	
	
	// Set the offset for the Moodboard
	ResetOffsetWindow();
	
} // END function resetImageResults


// Reset the window.offset variables
// Last change: 2014.12.19
function ResetOffsetWindow()
{
	var canvasOffset = jQuery( "#wowcanvas" ).offset();
	window.offsetX   = canvasOffset.left;
	window.offsetY   = canvasOffset.top;
}


// Load Editmode
// Last change: 2014.12.18
function loadEditMode()
{
	var jQ = jQuery;

	// Configure Editmode switch
	jQ( "#switcheditmode" ).change( function() 
	{
		switcheditmode();
	} );

	// Activate Tabs with jQueryui
	jQ( "#wowtabs" ).tabs();
	jQ( "#wow-edit-panel" ).show("slow");
	
	// Activate the Switch edit mode button
	jQ( "#editmode" ).buttonset().show();
}


// Switch the Edit mode of the Moodboard so you can see it as the visitors will see it
// Last change: 2014.12.18
function switcheditmode()
{
	var jQ = jQuery;
	
	if ( jQ( "#switcheditmode" ).is( ':checked' ) )
	{
		jQ( "#wow-edit-panel" ).hide("slow");
		jQ( "#wowcanvas" ).removeClass( 'woweditcanvas' ).addClass( 'wowcanvas' ).undelegate( 'object', "mouseenter" ).delegate( 'object', 
		{ 
			// Move the object in the stack to be on top of the Overlay-layer so we can actually click on the YouTube Videos etc
			mouseenter: function () 
			{ 
				bringtoFront( jQ( this ), '.dragging-overlay' ); 
				showCaption( jQ( this ) );
			}
		} );
		

		if (  typeof( clickedonImage ) == "function" ) 
		{
			jQ( "#wowcanvas" ).delegate( 'img', 
			{ 
				click: function()
				{
					clickedonImage( jQ( this ) );
				},
					
				mouseover: function()
				{
					if ( typeof jQ( this ).attr( "href" ) !== 'undefined' )  
					{
						jQ( this ).css( {'cursor': 'pointer'} );
					}
				}
			} );
		}
		
		var group  = jQ( "#wowcanvas" ).find( 'object' ); // find is faster() than children()	
		jQ( group ).each( function() 
		{
			jQ( this ).find( ".dragging-overlay" ).resizable( "disable" );
		} );
	}
	else
	{
		jQ( "#wow-edit-panel" ).show("slow");
		jQ( "#wowcanvas" ).removeClass( 'wowcanvas' ).addClass( 'woweditcanvas' ).undelegate( 'object', "mouseenter" ).undelegate( 'img', "mouseover" ).undelegate( 'img', "click" ).delegate( 'object', 
		{ 
			mouseenter: function () 
			{
				// Show a Delete Button
				if ( $edit === true ) ShowDeleteButton( jQ( this ) );
				showCaption( jQ( this ) );
			} 
		} );

		var group  = jQ( "#wowcanvas" ).find( 'object' ); // find is faster() than children()	
		jQ( group ).each( function() 
		{
			jQ( this ).find( ".dragging-overlay" ).resizable( "enable" );
		} );			
	}
	
	// Reload the Canvas
	doneResizing() ;
}


// Show/hide a delete button on an object
// Last change: 2014.12.19
function ShowDeleteButton( object )
{
	var zIndex    = object.find( '.dragging-overlay' ).zIndex() + 5;
	var deleteBtn = '<p class="deleteBtn" title="Delete" style=";top:0px;left:0px; z-index:' + zIndex + '"><i class="fa fa-trash-o"></i></p>';
	object.append( deleteBtn );	
}
function RemoveDeleteButton( object )
{
	object.find( '.deleteBtn' ).remove();
}


// Show/Hide the caption/edit caption Layer on an Image
// Last change: 2014.12.19
function showCaption( imageOverlayer )
{
	// Only show this when we actually have a caption
	if ( imageOverlayer.parent().find( 'img' ).length && imageOverlayer.find( '.wow-caption' ).text().length ) 
	{
		imageOverlayer.find( '.wow-caption' ).show();
	}
}
function hideCaption( imageOverlayer )
{
	imageOverlayer.find( '.wow-caption' ).hide();
}
function showCaptionEdit( imageOverlayer )
{ 
	if ( imageOverlayer.parent().find( 'img' ).length && !imageOverlayer.find( '.wow-captionedit' ).length )
	{
		var presettext  = imageOverlayer.find( '.wow-caption' ).text();
		var captionedit = jQuery( "<input type='text' class='wow-captionedit defaultText' title='Caption'></input>" ).val( presettext );
		imageOverlayer.append( captionedit ); 
		captionedit.trigger( 'focusout' );	
	}
}
function hideCaptionEdit( imageOverlayer )
{
	imageOverlayer.find( '.wow-captionedit' ).remove();
}


// Save Caption
// Last change: 2014.12.19
var saveCaptionTimer;
function saveCaption( moodBoardObject )
{
	clearTimeout( saveCaptionTimer );
	saveCaptionTimer = setTimeout( function() 
	{
		var image       = moodBoardObject.closest( 'object' ).find( 'img' );
		var captiontext = moodBoardObject.val();
	
		image.attr( 'title', captiontext ).attr( 'alt', captiontext );
		moodBoardObject.parent().find( '.wow-caption' ).text( captiontext );
		saveCanvas( wownonce );
	}, 200, moodBoardObject );
}


// Delete an object from the moodboard
// Last change 2014.12.19
function DeleteObject( object )
{
	object.remove();
	saveCanvas( wownonce );
}


// Add Objects to the Moodboard
// Last change 2014.12.19
function addObjecttoMoodboard( moodboardContentItem, objectscale )
{
	switch ( moodboardContentItem.type ) 
	{
		// Add a YouTube Video
		case "youtube#video":
			if (typeof addYoutubeVideo == 'function') 
			{ 
				addYoutubeVideo( moodboardContentItem, objectscale );
			}
			break;
							
		// Add an Image
		case "uploaded#image":
		case "google#image":
			if (typeof addImage == 'function') 
			{ 
				addImage( moodboardContentItem, objectscale );
			}
			break;
						
		// Add a Spotify Music Album
		case "spotify#album":
			if (typeof addSpotifyAlbum == 'function') 
			{ 
				addSpotifyAlbum( moodboardContentItem, objectscale );
			}
			break;
							
		// Discard anything else	
		default:
	}
}