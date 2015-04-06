<?php
/*
Part of Name: Wow Moodboard Lite
Plugin URI: https://wownmedia.com/wow-moodboard/
Description: Create a proxy to load remote images so the come from our server (https, caching, etc)
Version: 1.0.7 [2015.03.16]
Author: Wow New Media
Author URI: https://wownmedia.com
License: GPLv2 or later

	WoW Moodboard, plugin for Wordpress.
	Copyright © 2015 Wow New Media

	Wow New Media
	info@wownmedia.com
	Buzon 621 Sta. Clara
	03599 Altea la Vella
	ALC Spain
	
*/

// THIS IS A LIMITED VERSION, FOR FULL VERSION USE THE FILE FROM Wow Moodboard Pro!

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
	header( "Location: ".$url );
	exit;	
}