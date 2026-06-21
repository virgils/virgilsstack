<script lang="ts">
	let {
		media,
		mediaType = 'image',
		alt = '',
		caption = '',
		contained = false
	}: {
		media: string;
		mediaType?: 'image' | 'video';
		alt?: string;
		caption?: string;
		contained?: boolean;
	} = $props();
</script>

<section class="wide-media-section {contained ? 'contained' : 'full-width'}">
	<div class="media-wrapper">
		{#if mediaType === 'video'}
			<video
				src={media}
				autoplay
				loop
				muted
				playsinline
				preload="metadata"
				aria-hidden="true"
			></video>
		{:else}
			<img src={media} alt={alt} loading="lazy" />
		{/if}
	</div>
	{#if caption}
		<div class="caption-container">
			<span class="caption">{caption}</span>
		</div>
	{/if}
</section>

<style>
	.wide-media-section {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 48px 0;
	}

	.wide-media-section.contained {
		max-width: 1200px;
		margin: 48px auto;
		padding: 0 48px;
	}

	.media-wrapper {
		width: 100%;
		overflow: hidden;
	}

	.media-wrapper video,
	.media-wrapper img {
		width: 100%;
		height: auto;
		display: block;
		object-fit: cover;
	}

	.caption-container {
		padding: 12px 48px 0;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.contained .caption-container {
		padding: 12px 0 0;
	}

	.caption {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-tertiary);
	}
</style>
