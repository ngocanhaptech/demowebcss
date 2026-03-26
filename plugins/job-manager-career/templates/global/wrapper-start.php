<?php
/**
 * Single job page content wrapper start
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/global/wrapper-start.php
 *
 * @link       https://themehigh.com
 * @author     ThemeHigh
 * @package    job-manager-career
 * @subpackage job-manager-career/templates
 * @category   Template
 * @since      1.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

switch ( thjmf_get_theme_slug() ) {
	case 'twentyten':
		echo '<div id="container"><div id="content" role="main">';
		break;
	case 'twentyeleven':
		echo '<div id="primary"><div id="content" role="main" class="twentyeleven">';
		break;
	case 'twentytwelve':
		echo '<div id="primary" class="site-content"><div id="content" role="main" class="twentytwelve">';
		break;
	case 'twentythirteen':
		echo '<div id="primary" class="site-content"><div id="content" role="main" class="entry-content twentythirteen">';
		break;
	case 'twentyfourteen':
		echo '<div id="primary" class="content-area"><div id="content" role="main" class="site-content twentyfourteen">';
		break;
	case 'twentyfifteen':
		echo '<div id="primary" role="main" class="content-area twentyfifteen"><div id="main" class="site-main t15wc">';
		break;
	case 'twentysixteen':
		echo '<div id="primary" class="content-area twentysixteen"><main id="main" class="site-main" role="main">';
		break;
	case 'twentyseventeen':
		echo '<div class="wrap">';
		echo '<div id="primary" class="content-area twentyseventeen">';
		echo '<main id="main" class="site-main" role="main">';
		break;
	case 'twentynineteen':
		echo '<div id="primary" class="content-area"><main id="main" class="site-main" role="main"><article id="post-'.get_the_ID().'" class="post-'.get_the_ID().'thjm_jobs hentry entry">';
		break;
	case 'twentytwenty':
		echo '<section id="primary" class="content-area"><main id="main" class="site-main">';
		break;
	case 'astra':
		echo '<div id="primary" class="content-area thjmf-job-contents"><main id="main" class="site-main" role="main"><article id="post-'.get_the_ID().'" class="post-'.get_the_ID().' ast-article-single">';
		break;
	case 'oceanwp':
		echo '<div id="content-wrap" class="container clr"><div id="primary" class="content-area clr">';
		echo '<div id="content" class="site-content clr"><article id="post-'.get_the_ID().'">';
		break;
	case 'storefront':
		echo '<div id="primary" class="content-area">';
		echo '<main id="main" class="site-main" role="main">';
		break;
	case 'bravada':
		echo '<div id="container" class="two-columns-right">';
		echo '<main id="main" class="main">';
		break;
	default:
		echo '<div id="primary" class="content-area thjmf-job-contents"><main id="main" class="site-main" role="main">';
		break;
}
