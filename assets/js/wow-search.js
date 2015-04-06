/* Part of Name: WoW Moodboard Lite
   Version: 1.0.7 [ 2015.03.16 ]
   Author: Marc Schot
   Description: Load and execute the Google Image search
   Status: Production
   
   Load before </head>
*/

// Initiate the Google Imagesearch API
google.load( 'search', '1' );
var imageSearch;

function searchComplete() 
{
	// Check that we got results
    if ( imageSearch.results && imageSearch.results.length > 0 ) 
	{	
		var jQ = jQuery;
		
		// Grab our content div, show clear results button.
		jQ( "#clearsearchresults" ).show();	

        // Loop through our results, printing them to the page.
        var results       = imageSearch.results;	
		var index         = results.length -1;
		var contentDiv    = document.getElementById( 'canvasimages' );
		var scrollContent = jQ( ".scroll-content" );
		var i             = results.length -1;
		
		// Since we prepend the results we go through the array in reverse order (and its faster)
		do 
		{		
			results[ i ].unescapedUrl = window.wowproxyurl + results[ i ].unescapedUrl.replace( /&/g, "**" ).replace( /\?/g, "!!" );
			results[ i ].tbUrl        = window.wowproxyurl + results[ i ].tbUrl;
			results[ i ].url		  = window.wowproxyurl + results[ i ].url;
			results[ i ].type         = "google#image";
			results[ i ].title		  = "";

			var uniqueid = results[ i ].unescapedUrl.hashCode();
			var caption  = results[ i ].title;
			var url      = results[ i ].tbUrl
			var width    = results[ i ].tbWidth / results[ i ].tbHeight * 70;
			var payload  = results[ i ];
			
			CreateSearchresultThumbnail( uniqueid, caption, url, width, payload );	

		} while ( i-- );
		
		//init scrollbar size
		sizeScrollbar();
		reflowContent();
		resetValue();
	}
}


function ImageSearchOnLoad() 
{
	// Create an Image Search instance.
    imageSearch = new google.search.ImageSearch();

    imageSearch.setSearchCompleteCallback( this, searchComplete, null );
	imageSearch.setResultSetSize( 8 );
	imageSearch.setRestriction( google.search.ImageSearch.RESTRICT_FILETYPE,  google.search.ImageSearch.FILETYPE_JPG );
	imageSearch.setRestriction( google.search.Search.RESTRICT_SAFESEARCH,     google.search.Search.SAFESEARCH_MODERATE );
	imageSearch.setNoHtmlGeneration();

    jQuery( '#image-search-button' ).attr( 'disabled', false );
        
    // Include the required Google branding
    google.search.Search.getBranding( 'googlebranding' );
}
google.setOnLoadCallback( ImageSearchOnLoad );


// Search for a specified string.
function googleimagesearch() 
{		
	googleimagesearchTracker = false;
	imageSearch.execute( jQuery( '#googleimagesearchquery' ).val() );	
}