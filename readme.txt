=== Wow Moodboard Lite ===
Contributors: mschot
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=K2YMTHZXUUXJS
Tags: mood board, collage, presentation, youtube, images, jquery, album, albums, galleries, gallery, image, image album, image captions, image gallery, images, media, media gallery, photo, photo albums, photo gallery, photographer, photography, photos, picture, Picture Gallery, pictures, responsive, responsive galleries, responsive gallery, wordpress gallery plugin, wordpress photo gallery plugin, wordpress responsive gallery, wp gallery, wp gallery plugins, video, buddypress
Requires at least: 4.0
Tested up to: 4.2.1
Stable tag: 1.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Visually stand out, add a mood board with images and YouTube videos to your posts and pages. 

== Description ==
A mood board is a type of collage consisting of images, text, and samples of objects in a composition. 
They may be physical or digital, and can be "extremely effective" presentation tools.

With Wow Moodboard you can add a mood board to your posts and pages to visually illustrate the style you wish to pursue and quickly inform your audience of the overall "feel" (or "flow") of your idea/product/article/writing. In other words you can add a collage of Youtube Video's and Images (both uploaded and Google Image Search) to any post or page (including Woocommerce / Jigoshop products) to add that extra edge to your presentation to make it stand out.

A demonstration:

https://www.youtube.com/watch?v=sVA7ZYYQKa0

**Pro Version Available**

All the functionality of Wow moodboard Lite +

- Customize the look of your mood boards with a **custom background**
- Resize your mood boards to **fit your needs**
- **Auto-Scale** your mood boards to different screen sizes
- Add music to your mood boards with **Spotify Album search**
- Allow your audience to view YouTube videos from your mood boards **fullscreen**
- Receive **more search results to choose from** when performing Google Image and Youtube searches
- Add **Clickable links** to images placed on the Moodboard
- Add HTML **Cache** to your Mood boards for faster pageloads ( **important SEO enhancement** )
- Enable Mood Boards on **BuddyPress** profiles

More info at [Wow New Media](https://wownmedia.com/wow-moodboard/ "Wow Moodboard Pro")

== Installation ==
1. Upload the Plugin to your `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Enter your Google API (see below) key in the settings->Wow Moodboard menu
4. Insert the shortcode [moodboard] on any page or post where you like to create a collage; 
5. View your post/page and start filling your mood board, you can drag and resize your objects to position them in your mood board. 
6. Click on a image to enter/edit it`s caption.

In order to be able to use the Youtube Video search you will need to obtain a (*free*) Google API Key at https://console.developers.google.com/

- Create a project
- Enable the YouTube Data API v3 in APIs & Auth
- Create a new Browser Key (credentials)
- Add the API key to your Wordpress site (Settings ->Wow Moodboard).

== Screenshots ==

1. Edit your mood board inline, you can add images and videos, resize them and add captions
2. A mood board implemented in a page of a webzine
3. A mood board implemented in a post in the blog of a fashion label
4. A Wow moodboard Pro with custom background, spotify albums and custom size
5. Wow Moodboard Admin/Settings interface

== Changelog ==

= 1.1.1.1 =
* Bug (introduced in v1.1.1) fixed in fileuploader 

= 1.1.1 =
* (Pro) Added BuddyPress Profile option
* Bug Fixes
* Updated included FontAwesome to version 4.3.0

= 1.1.0 =
* Added Genesis Framework 2.1 compatibility

= 1.0.7.1 =
* Bug fix

= 1.0.7 =
* Added: additional configuration options
* Bug resolved: Wide images (banners) can now corrctly be resized
* Removed: Standard title for Google Image search images

= 1.0.6 =
* jQuery and javascript performance updates
* (Pro) Added option to add link/url to images placed on the Moodboard

= 1.0.5 =
* Bug resolved: Resizeable objects when not in edit mode
* Bug resolved: wowproxy errors when using cUrl with PHP open_basedit / safe_mode settings 

= 1.0.4 =
* jQuery and javascript performance updates
* Show/Hide 'edit-mode' of Moodboards for Admin

= 1.0.3 =
* Prevent Loading Moodboards if current location is not is_singular() to prevent trying to load more than 1 moodboard;
* (Pro) Added option to add background to Moodboard
* (Pro) Added option to resize Moodboard

= 1.0.2 =
* Prevent loading the Wow Moodboard Lite plugin when the Pro version is installed and activated;
* Moved AJAX endpoint functions from functions.php to within the Wow_Moodboard Class to prevent possible mixups with other plugins;
* Included Upgrade mechanism for Moodboards in case we upgrade to a newer version or to Pro;
* Updated Jqueryui CSS to version 1.11.2;
* CSS cleanup for better integration in Twenty Fifteen theme;
* Solved bug saving error on empty Moodboard;

= 1.0.1 =
* Updated wowproxy.php to work better with the Cloudflare browser integrity check;
* Updated Google image search results to escape & and ? in the URLs of the images found;
* Included jquery-ui.css into assets
* Included image for Pro version into assets

= 1.0 =
* Initial version