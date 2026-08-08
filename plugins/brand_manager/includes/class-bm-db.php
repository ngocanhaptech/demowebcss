<?php

class BM_DB_Helper {
    public static function table_brands() {
        global $wpdb;
        return $wpdb->prefix . 'bm_brands';
    }
}