<?php
/*
Plugin Name: Video Gallery Block
Description: Video gallery block that displays media library videos in a grid with popup
Version: 1.0
Author: Your Name
Plugin URI: https://example.com/video-gallery
Author URI: https://example.com
Text Domain: video-gallery-block
Domain Path: /languages
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

function video_gallery_block_init()
{
    register_block_type(__DIR__ . '/build');

    // Register REST API endpoint
    register_rest_route('video-gallery/v1', '/videos', array(
        'methods' => 'GET',
        'callback' => 'get_all_videos',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));
}
add_action('init', 'video_gallery_block_init');

function get_all_videos()
{
    $videos = get_posts(array(
        'post_type' => 'attachment',
        'post_mime_type' => 'video',
        'post_status' => 'inherit',
        'posts_per_page' => -1,
        'orderby' => 'title',
        'order' => 'ASC'
    ));

    $formatted_videos = array_map(function ($video) {
        return array(
            'id' => $video->ID,
            'url' => wp_get_attachment_url($video->ID),
            'thumbnail' => wp_get_attachment_image_src($video->ID, 'medium')[0],
            'title' => $video->post_title
        );
    }, $videos);

    return rest_ensure_response($formatted_videos);
}

// Enqueue frontend assets
function video_gallery_frontend_assets()
{
    wp_enqueue_style(
        'video-gallery-css',
        plugins_url('assets/css/style.css', __FILE__)
    );

    wp_enqueue_script(
        'video-gallery-frontend-js',
        plugins_url('assets/js/frontend.js', __FILE__),
        array('jquery'),
        null,
        true
    );
}
add_action('wp_enqueue_scripts', 'video_gallery_frontend_assets');

// Add icon to the plugin
function video_gallery_plugin_row_meta($links, $file)
{
    if (plugin_basename(__FILE__) === $file) {
        $icon_url = plugins_url('assets/images/video-gallery-icon.svg', __FILE__);
        echo '<style>
            .video-gallery-icon {
                display: inline-block;
                width: 16px;
                height: 16px;
                margin-right: 5px;
                vertical-align: text-top;
            }
        </style>';
        echo '<img src="' . esc_url($icon_url) . '" class="video-gallery-icon" alt="Video Gallery Icon" />';
    }
    return $links;
}
add_filter('plugin_row_meta', 'video_gallery_plugin_row_meta', 10, 2);

// Register block category
function video_gallery_block_categories($categories, $post)
{
    return array_merge(
        $categories,
        array(
            array(
                'slug' => 'video-gallery-blocks',
                'title' => __('Video Gallery Blocks', 'video-gallery-block'),
                'icon'  => 'video-alt2',
            ),
        )
    );
}
add_filter('block_categories_all', 'video_gallery_block_categories', 10, 2);
