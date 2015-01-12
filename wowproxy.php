<?php
/*
Part of Name: WoW Moodboard Lite / Pro
Plugin URI: http://wownmedia.com/wow-moodboard/
Description: Create a proxy to load remote images so the come from our server (https, caching, etc)
Version: 1.0.6 [2015.01.12]
Author: Wow New Media
Author URI: http://wownmedia.com
License: GPLv2 or later

	WoW Moodboard, plugin for Wordpress.
	Copyright © 2015 Wow New Media

	Wow New Media
	info@wownmedia.com
	Buzon 621 Sta. Clara
	03599 Altea la Vella
	ALC Spain
	
*/
ob_start(); // Prevent any error from sending headers to the browser

// Get the url of the image to be proxied
$url = ( isset( $_POST[ 'url' ] ) ) ? $_POST[ 'url' ] : ( isset( $_GET[ 'url' ] ) ? $_GET[ 'url' ] : false );

// Remove 'spaces' from url
$find    = array( "**", "!!", " " );
$replace = array( "&", "?", "%20" );
$url     = str_replace( $find, $replace, $url );

// retreive and show our image
proxyimages( $url );


// Proxy images from Google Search so the come from our server (can be cached in Cloudflare, SSL, etc)
function proxyimages( $url )
{
	
	// Make sure we actually use cUrl on this server and that we have no open_basedir and safe_mode (PHP < 5.4) set 
	if ( function_exists( 'curl_version' ) 
		 && filter_var( ini_get( 'open_basedir' ), FILTER_VALIDATE_BOOLEAN ) === false 
		 && filter_var( ini_get( 'safe_mode' ),    FILTER_VALIDATE_BOOLEAN ) === false
	)
	{
		$session = curl_init( $url );
	
		// Don't return HTTP headers. Do return the contents of the call
		curl_setopt( $session, CURLOPT_HEADER, false );
		curl_setopt( $session, CURLOPT_FOLLOWLOCATION, true ); 
		curl_setopt( $session, CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $session, CURLOPT_REFERER, "" );
		curl_setopt( $session, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36" );
	
		// So, Cloudflare checks if it can write cookies in the Browser integrity check
		$tmp_fname = tempnam("/tmp", "COOKIE");
		curl_setopt( $session, CURLOPT_COOKIEJAR, $tmp_fname );
		curl_setopt( $session, CURLOPT_COOKIEFILE, $tmp_fname );
		curl_setopt( $session, CURLOPT_COOKIESESSION, true );  

		// Make the call
		$response   = curl_exec( $session );	
		$image_mime = curl_getinfo( $session, CURLINFO_CONTENT_TYPE );
		curl_close( $session );
	}
	else $image_mime = false;
	
	// Check if the received response is actually a binary image
	if ( substr( $image_mime, 0, 5 ) === "image" )
	{	
		// Show the image
		showImage( $response, $image_mime );
		exit;
	}
	
	// Seems cUrl is beeing blocked or PHP open_basedir or safe_mode is set, try a different method
	else
	{
		$rawImage   = file_get_contents( $url );
		$finfo      = new finfo( FILEINFO_MIME );
		$image_mime = $finfo->buffer( $rawImage );
		
		// Check again to see wether we have a correct image now
		if ( substr( $image_mime, 0, 5 ) === "image" )
		{
			showImage( $rawImage, $image_mime );
			exit;
		}
		
		// Still no image, redirect to the url, SSL mixed content errors can occur :(
		else
		{
			header( "Location: ".$url );
			exit;
		}
	}
	
}

function showImage( $image, $mimetype )
{
	// Show the image
	ob_clean(); // Clear previous buffer that was set to prevent any headers being sent earlier
	ob_start();
	header( "Content-Type: " . $mimetype );
	
	// Set image caching
	header( 'Pragma: public' );
	header( 'Cache-Control: max-age=31536000, public' );
	header( 'Expires: ' . gmdate( 'D, d M Y H:i:s \G\M\T', time() + 31536000 ) );
	header( 'ETag: ' . md5( $image ) );
	
	echo $image;
	ob_end_flush();
	exit;
}