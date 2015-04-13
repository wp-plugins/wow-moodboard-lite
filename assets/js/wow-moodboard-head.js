/* Part of Name: WoW Moodboard Lite
   Version: 1.1.1 [ 2015.03.13 ]
   Author: Wow New Media
   Description: Setup the WoW MoodBoard JavaScript in the <head> section
   Status: Production
   
   Load before </head>
*/

// Declare General variables
var windowWidth = jQuery( window ).width();
var resizeID;
var SaveMoodboardID;
var scopes = [
  'https://www.googleapis.com/auth/youtube'
]; 

// Save this MoodBoard to the Database, with a small delay to not overload the DB
function saveCanvas( wownonce )
{
	clearTimeout( SaveMoodboardID );
	SaveMoodboardID = setTimeout( saveMoodBoard( wownonce ), 500 );	
}

function wowupload( wpnonce, wowurl, includeurl ) 
{	
	// Create a local copy of jQuery for Speed and to prevent $ errors
	var jQ = jQuery;

	jQ( "#uploader" ).plupload( {
        // General settings
        runtimes: 'html5,flash,silverlight,html4',
        file_data_name: "async-upload",
        url: wowurl,

        // Maximum file size
        max_file_size : '2mb',

        // Specify what files to browse for
        filters : {
            mime_type: [ { title : "Image files", extensions : "jpg,png,jpeg" } ],
            max_file_size: "2mb"
        },
        // Rename files by clicking on their titles
        rename: false,
		unique_names: true,

        // Sort files
        sortable: false,

        // Enable ability to drag'n'drop files onto the widget (currently only HTML5 supports that)
        dragdrop: false,
        // Views to activate

        multipart_params: {
            action: "upload-attachment",
            _wpnonce: wpnonce
        },
        // Flash settings
        flash_swf_url : includeurl + 'js/plupload/plupload.flash.swf',

        // Silverlight settings
        silverlight_xap_url : includeurl + 'js/plupload/plupload.silverlight.xap',
		
    } );
}


// Create automatic resize
// Last change: 2014.12.18
function doneResizing() 
{
	var moodBoardwidth = jQuery( "#wowcanvas").width();
	var screenWidth    = jQuery( window ).width();

	if ( windowWidth != screenWidth && window.mbwidth != moodBoardwidth )
	{
	  // Our window resize has affected the Moodboard, so we need to re-calculate the position and scale of the objects and scrollbar
		// Store new Width
		window.mbwidth     = moodBoardwidth;
		window.windowWidth = screenWidth;
		
		// Recalculate the scrollbar
		sizeScrollbar();
		reflowContent();
		resetValue();
		
		// Resize objects on the MoodBoard
		loadCanvas ( window.wownonce, window.postid );
	}
}