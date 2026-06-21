<script lang="ts">
</script>

<div class="logo-container">
	<svg class="nav-logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<rect class="bg-rect" width="32" height="32" fill="currentColor"/>
		<rect class="block block-1" x="8" y="8" width="7" height="7" fill="var(--bg-color)"/>
		<rect class="block block-2" x="17" y="17" width="7" height="7" fill="var(--bg-color)"/>
	</svg>
</div>

<style>
	.logo-container {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.nav-logo {
		width: 28px;
		height: 28px;
		overflow: visible;
	}

	.bg-rect {
		transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.3s ease;
	}

	.block {
		transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
		transform-origin: center;
	}

	/* Micro-animations on hover */
	.logo-container:hover .bg-rect {
		transform: scale(1.08) rotate(90deg);
	}

	.logo-container:hover .block-1 {
		transform: translate(2px, 2px) scale(0.9);
	}

	.logo-container:hover .block-2 {
		transform: translate(-2px, -2px) scale(1.1);
	}
</style>
