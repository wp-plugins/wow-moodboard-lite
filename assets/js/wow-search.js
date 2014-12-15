/* Part of Name: WoW Moodboard Lite
   Version: 1.0.1 [2014.12.10]
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
		do {		
					
            var imgContainer = document.createElement( 'div' );
			var newImg       = document.createElement( 'img' );
				
			var uniqueid     = results[ i ].unescapedUrl.hashCode();
			var width		 = Math.round(  results[ i ].tbWidth / results[ i ].tbHeight * 70  );
			
			// Set the proxy for the image
			
			results[ i ].unescapedUrl = window.wowproxyurl + results[ i ].unescapedUrl.replace( /&/g, "**" ).replace( /\?/g, "!!" );
			results[ i ].tbUrl        = window.wowproxyurl + results[ i ].tbUrl;
			
			newImg.id    = "imageresult" + uniqueid;	
			newImg.title = "Google Image: " + results[ i ].title;
			newImg.src   = results[ i ].tbUrl;
			newImg.setAttribute( 'width', width );
			newImg.setAttribute( 'height', 70 );
					
			imgContainer.appendChild( newImg );
			imgContainer.className = "scroll-content-item";
				
			contentDiv.insertBefore( imgContainer, contentDiv.firstChild );						
			jQ( "#imageresult" + uniqueid ).css( 'width', width + 'px' ).css( 'height','70px' );
			var activateDom = jQ( "#imageresult" + uniqueid ).html(); // Somehow the image isn't directly available in the DOM

			results[ i ].type = "google#image";
			setDraggable( "#imageresult" + uniqueid, results[ i ] );

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
	imageSearch.setRestriction( google.search.ImageSearch.RESTRICT_IMAGESIZE, google.search.ImageSearch.IMAGESIZE_MEDIUM );
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