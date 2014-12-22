<?php
/*
Part of Name: WoW Moodboard Lite
Plugin URI: https://wownmedia.com/wow-moodboard/
Description: Create the admin environment for the Wow Moodboard plugin.
Version: 1.0.4 [ 2014.12.19 ]
Author: Wow New Media
Author URI: https://wownmedia.com
License: GPLv2 or later

	WoW Moodboard, plugin for Wordpress.
	Copyright © 2014 Wow New Media

	Wow New Media
	info@wownmedia.com
	Buzon 621 Sta. Clara
	03599 Altea la Vella
	ALC Spain
	
*/
defined( 'WOWMOODBOARD' ) or die( 'No direct access to this file allowed.' );

function wow_moodboard_plugin_menu()
{
	add_options_page( __( 'WoW MoodBoard Settings' ), 'Wow Moodboard Lite', 'manage_options', 'wow_moodboard', 'wowmoodboard_plugin_options' );
}

function wow_moodboard_update()
{
	if ( !current_user_can( 'manage_options' ) ) return false;
	
	// Check if we need to update
	$storedversion = get_option( "wowmoodboardversion" );
	if ( $storedversion != false)
	{ 
		if ( $storedversion != WOWMOODBOARD )
		{
			// Upgrade the Moodboards
			if ( WoW_MoodBoard::UpgradeMoodboards( $storedversion ) ) 
			{
				update_option( "wowmoodboardversion", WOWMOODBOARD );
				
				?>
    			<div class="updated">
        			<p>Wow Moodboard: <?php _e( 'Your Moodboards have been updated', 'wow_moodboard' ); ?></p>
    			</div>
    			<?php 	
			}
		}
	}
	else update_option( "wowmoodboardversion", WOWMOODBOARD );	
}

function wowmoodboard_plugin_options()
{
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
	
    // variables for the field and option names 
    $opt_name 			= 'wow_youtube_api';
    $hidden_field_name 	= 'wow_submit_hidden';
    $data_field_name 	= 'wow_youtube_api';

    // Read in existing option value from database
    $opt_val = get_option( $opt_name );

    // See if the user has posted us some information
    // If they did, this hidden field will be set to 'Y'
    if( isset($_POST[ $hidden_field_name ]) && $_POST[ $hidden_field_name ] == 'Y' ) {
        // Read their posted value
        $opt_val = $_POST[ $data_field_name ];

        // Save the posted value in the database
        update_option( $opt_name, $opt_val );

        // Put an settings updated message on the screen

	?>
	<div class="updated"><p><strong><?php _e('settings saved.', 'wow_moodboard' ); ?></strong></p></div>
	<?php

    }

    // Now display the settings editing screen

    echo '<div class="wrap">';

    // header

    echo "<h2>" . __( 'Wow Moodboard Lite Plugin Settings ', 'wow_moodboard' ) . "</h2>";
	
	// settings form
    
    ?>

	<form name="formwowmoodboard" method="post" action="">
		<input type="hidden" name="<?php echo $hidden_field_name; ?>" value="Y">

		<p><h3><?php _e("YouTube API Key:", 'wow_moodboard' ); ?> </h3>
			<input type="text" name="<?php echo $data_field_name; ?>" value="<?php echo $opt_val; ?>" size="40">
            <label for="<?php echo $data_field_name; ?>"><em><?php _e("The API Key is obtained from the Google Developers Console at"); ?> <a href="https://console.developers.google.com/" target="_blank">https://console.developers.google.com/</a>.</em></label>
		</p>

		<p class="submit">
			<input type="submit" name="Submit" class="button-primary" value="<?php esc_attr_e('Save Changes') ?>" />
		</p>

	</form>
	</div><hr />
    
    <?php
    // Wow Moodboard Pro
	echo '<a href="https://wownmedia.com/wowmoodboard" title="Wow Moodboard Pro">';
	echo "<img src='" . plugins_url( '/assets/images/wowmoodboardpro.jpg', __FILE__ ) . "' alt='Wow Moodboard Pro' width='800' height='407'></a>";
	echo "<h3>" . __('Upgrade now to ');
	echo '<a href="https://wownmedia.com/wowmoodboard" title="Wow Moodboard Pro">Wow Moodboard Pro</a> ' . __('to get additional options:');
	echo "</h3>";
	echo "<ul><li>* ";
	echo __("Allow clients to view YouTube videos from your mood boards fullscreen") . "</li><li>* ";
	echo __("Scale your mood boards to different screen sizes") . "</li><li>* ";
	echo __("Resize your mood boards") . "</li><li>* ";
	echo __("Customize the look of your mood boards") . "</li><li>* ";
	echo __("Add music to your mood boards with Spotify Album search") . "</li><li>* ";
	echo __("Add links to the images on your mood boards") . "</li><li>* ";
	echo __("Receive more search results on Google Image and Youtube searches") . "</li></ul><hr />";

}

// Return true if the current user is a Site admin
function isSiteAdmin()
{
    $currentUser = wp_get_current_user();
    return in_array( 'administrator', $currentUser->roles );
}