<?php
/*
Plugin Name: WoW Moodboard Lite
Plugin URI: https://wownmedia.com/wow-moodboard/
Description: Create a Mood board for your Wordpress pages and posts. Lite version.
Version: 1.1.1.1
Author: Wow New Media
Author URI: https://wownmedia.com
Last Change: 2015.04.06
License: GPLv2 or later

	WoW Moodboard, plugin for Wordpress.
	Copyright © 2015 Wow New Media

	Wow New Media
	info@wownmedia.com
	Buzon 621 Sta. Clara
	03599 Altea la Vella
	ALC Spain
	
*/
defined( 'ABSPATH' ) or die( 'Come on, Please install Wordpress before using this plugin!' );

function wow_moodboard_lite_init() 
{
	global $wowmoodboard;
	
	load_plugin_textdomain('wow_moodboard', false, basename( dirname( __FILE__ ) ) . '/languages' );
	
	require( dirname( __FILE__ ) . '/admin.php' );
    require( dirname( __FILE__ ) . '/wow-moodboard-class.php' );
	
	// Create a Moodboard Object
	if( class_exists( 'WoW_MoodBoard' ) ) 
	{
		$wowmoodboard = new WoW_MoodBoard();		
	}
}

// Let's start...
defined( 'WOWMOODBOARD' ) or define( 'WOWMOODBOARD', '1.1.1' );

// We need to wait until all plugins are loaded to know for sure if the Pro version is active as well:
// In case it has been loaded before this Lite version we should prevent initializing the Lite Version.
// In case Pro is loaded after Lite, we remove the action below from within the Pro version.
if ( ! defined( 'WOWMOODBOARDPRO' ) )
{
	add_action( 'plugins_loaded', 'wow_moodboard_lite_init' );
}