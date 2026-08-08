<?php

class BM_Shortcode_Brand_List extends BM_Shortcode_Base {

    protected $tag = 'ux_brand_list';

    public function render( $atts ) {
		// Tham số cho filter + paging
		$atts = shortcode_atts( [
			'posts'        => 20,
			'brand_cat'    => '',
			'orderby'      => 'date',
			'order'        => 'DESC',
			'status'       => '',  // Cấp bằng / Đang giải quyết / ...
			'app_type'     => '',  // 0: quốc gia, 1: quốc tế
			'owner_name'   => '',
			'classes'      => '',
			'paged'        => 1,
			'show_filter'  => 'true', // hiển thị filter bar
			'ajax'         => 'true', // bật ajax pagination
		], $atts );

		if ( isset( $atts['visibility'] ) && $atts['visibility'] === 'hidden' ) {
			return '';
		}

		$paged = max( 1, (int) $atts['paged'] );

		// Base query
		$args = [
			'post_type'      => 'brand',
			'post_status'    => 'publish',
			'posts_per_page' => (int) $atts['posts'],
			'orderby'        => $atts['orderby'],
			'order'          => $atts['order'],
			'paged'          => $paged,
		];

		// Taxonomy filter
		if ( ! empty( $atts['brand_cat'] ) ) {
			$args['tax_query'] = [
				[
					'taxonomy' => 'brand-categories',
					'field'    => 'slug',
					'terms'    => explode( ',', $atts['brand_cat'] ),
				],
			];
		}

		// Meta filters
		$meta_query = [];

		if ( $atts['status'] !== '' ) {
			$meta_query[] = [
				'key'   => '_bm_brand_status_text',
				'value' => $atts['status'],
			];
		}

		if ( $atts['app_type'] !== '' ) {
			$meta_query[] = [
				'key'   => '_bm_brand_application_type',
				'value' => (string) $atts['app_type'],
			];
		}

		if ( $atts['owner_name'] !== '' ) {
			$meta_query[] = [
				'key'     => '_bm_brand_owner_name',
				'value'   => $atts['owner_name'],
				'compare' => 'LIKE',
			];
		}

		if ( $atts['classes'] !== '' ) {
			$meta_query[] = [
				'key'     => '_bm_brand_classes',
				'value'   => $atts['classes'],
				'compare' => 'LIKE',
			];
		}

		if ( ! empty( $meta_query ) ) {
			$args['meta_query'] = $meta_query;
		}

		$query = new WP_Query( $args );

		// ---- RENDER ----
		ob_start();

		// Filter bar (trên cùng)
		if ( $atts['show_filter'] === 'true' ) {
			$this->render_filter_bar( $atts );
		}

		// Wrapper chính để AJAX thay nội dung bên trong
		echo '<div class="bm-brand-list-wrapper" data-ajax="' . esc_attr( $atts['ajax'] ) . '" data-posts="' . (int) $atts['posts'] . '">';

		if ( ! $query->have_posts() ) {
			echo '<p class="bm-brand-list-empty">' . esc_html__( 'Không có nhãn hiệu phù hợp.', 'bm' ) . '</p>';
		} else {
			$this->render_table( $query, $atts );
			$this->render_pagination( $query, $paged );
		}

		echo '</div>';

		wp_reset_postdata();

		return ob_get_clean();
	}

	/**
	 * In filter bar.
	 */
	protected function render_filter_bar( $atts ) {
		// Form không có action, JS sẽ handle
		?>
		<form class="bm-brand-filter-bar">
			<div class="bm-filter-row">
				<div class="bm-filter-item">
					<label><?php esc_html_e( 'Nhóm', 'bm' ); ?></label>
					<input type="text" name="classes" value="<?php echo esc_attr( $atts['classes'] ); ?>" placeholder="3,5,35">
				</div>
				<div class="bm-filter-item">
					<label><?php esc_html_e( 'Chủ đơn', 'bm' ); ?></label>
					<input type="text" name="owner_name" value="<?php echo esc_attr( $atts['owner_name'] ); ?>">
				</div>
				<div class="bm-filter-item">
					<label><?php esc_html_e( 'Trạng thái', 'bm' ); ?></label>
					<select name="status">
						<option value=""><?php esc_html_e( 'Tất cả', 'bm' ); ?></option>
						<option value="Cấp bằng" <?php selected( $atts['status'], 'Cấp bằng' ); ?>><?php esc_html_e( 'Cấp bằng', 'bm' ); ?></option>
						<option value="Đang giải quyết" <?php selected( $atts['status'], 'Đang giải quyết' ); ?>><?php esc_html_e( 'Đang giải quyết', 'bm' ); ?></option>
						<option value="Từ chối" <?php selected( $atts['status'], 'Từ chối' ); ?>><?php esc_html_e( 'Từ chối', 'bm' ); ?></option>
						<option value="Rút đơn" <?php selected( $atts['status'], 'Rút đơn' ); ?>><?php esc_html_e( 'Rút đơn', 'bm' ); ?></option>
					</select>
				</div>
				<div class="bm-filter-item">
					<label><?php esc_html_e( 'Loại đơn', 'bm' ); ?></label>
					<select name="app_type">
						<option value=""><?php esc_html_e( 'Tất cả', 'bm' ); ?></option>
						<option value="0" <?php selected( $atts['app_type'], '0' ); ?>><?php esc_html_e( 'Đơn quốc gia', 'bm' ); ?></option>
						<option value="1" <?php selected( $atts['app_type'], '1' ); ?>><?php esc_html_e( 'Đơn quốc tế', 'bm' ); ?></option>
					</select>
				</div>
				<div class="bm-filter-item bm-filter-item--actions">
					<button type="submit" class="button bm-filter-submit">
						<?php esc_html_e( 'Lọc', 'bm' ); ?>
					</button>
				</div>
			</div>
		</form>
		<?php
	}

	/**
	 * In bảng nhãn hiệu (đã có sẵn trong code cũ, tách ra cho gọn).
	 */
	protected function render_table( WP_Query $query, $atts ) {
		$paged     = max( 1, (int) $atts['paged'] );
		$per_page  = (int) $atts['posts'];
		$index     = ( $paged - 1 ) * $per_page + 1;
		?>
		<div class="bm-brand-table-wrapper">
			<table class="bm-brand-table">
				<thead>
				<tr>
					<th><?php esc_html_e( 'STT', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Mẫu Nhãn', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Nhãn Hiệu', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Nhóm', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Trạng Thái', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Ngày Nộp Đơn', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Số Đơn', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Chủ Đơn', 'bm' ); ?></th>
					<th><?php esc_html_e( 'Đại diện SHCN', 'bm' ); ?></th>
				</tr>
				</thead>
				<tbody>
				<?php
				while ( $query->have_posts() ) :
					$query->the_post();
					$post_id            = get_the_ID();
					$image_url          = get_post_meta( $post_id, '_bm_brand_image_url', true );
					$classes            = get_post_meta( $post_id, '_bm_brand_classes', true );
					$status_text        = get_post_meta( $post_id, '_bm_brand_status_text', true );
					$filing_date        = get_post_meta( $post_id, '_bm_brand_filing_date', true );
					$application_number = get_post_meta( $post_id, '_bm_brand_application_number', true );
					$owner_name         = get_post_meta( $post_id, '_bm_brand_owner_name', true );
					$representative     = get_post_meta( $post_id, '_bm_brand_representative', true );

					$badge_class = 'bm-badge-secondary';
					if ( stripos( $status_text, 'Cấp bằng' ) !== false ) {
						$badge_class = 'bm-badge-success';
					} elseif ( stripos( $status_text, 'Đang giải quyết' ) !== false ) {
						$badge_class = 'bm-badge-warning';
					} elseif ( stripos( $status_text, 'Từ chối' ) !== false ) {
						$badge_class = 'bm-badge-danger';
					}
					?>
					<tr>
						<td><?php echo (int) $index; ?></td>
						<td class="bm-col-logo">
							<?php if ( $image_url ) : ?>
								<img src="<?php echo esc_url( $image_url ); ?>"
									 alt="<?php echo esc_attr( get_the_title() ); ?>"
									 class="bm-brand-logo" />
							<?php endif; ?>
						</td>
						<td class="bm-col-title">
							<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
						</td>
						<td class="bm-col-classes">
							<?php echo esc_html( $classes ); ?>
						</td>
						<td class="bm-col-status">
							<?php if ( $status_text ) : ?>
								<span class="bm-badge <?php echo esc_attr( $badge_class ); ?>">
									<?php echo esc_html( $status_text ); ?>
								</span>
							<?php endif; ?>
						</td>
						<td class="bm-col-date">
							<?php echo esc_html( $filing_date ); ?>
						</td>
						<td class="bm-col-app-number">
							<?php echo esc_html( $application_number ); ?>
						</td>
						<td class="bm-col-owner">
							<?php echo esc_html( $owner_name ); ?>
						</td>
						<td class="bm-col-rep">
							<?php echo esc_html( $representative ); ?>
						</td>
					</tr>
					<?php
					$index++;
				endwhile;
				?>
				</tbody>
			</table>
		</div>
		<?php
	}

	/**
	 * In thanh phân trang (sử dụng cho cả AJAX).
	 */
	protected function render_pagination( WP_Query $query, $paged ) {
		$total_pages = (int) $query->max_num_pages;
		if ( $total_pages <= 1 ) {
			return;
		}

		echo '<div class="bm-brand-pagination" data-page="' . (int) $paged . '" data-total="' . $total_pages . '">';

		// prev
		if ( $paged > 1 ) {
			echo '<a href="#" class="bm-page-link" data-page="' . ( $paged - 1 ) . '">&laquo;</a>';
		}

		for ( $i = 1; $i <= $total_pages; $i++ ) {
			$class = 'bm-page-link';
			if ( $i === $paged ) {
				$class .= ' bm-page-current';
			}
			echo '<a href="#" class="' . esc_attr( $class ) . '" data-page="' . $i . '">' . $i . '</a>';
		}

		// next
		if ( $paged < $total_pages ) {
			echo '<a href="#" class="bm-page-link" data-page="' . ( $paged + 1 ) . '">&raquo;</a>';
		}

		echo '</div>';
	}
}