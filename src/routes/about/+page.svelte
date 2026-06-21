<script lang="ts">
	import { Footer } from "$lib";
</script>

<svelte:head>
	<title>About — Virgil</title>
	<meta name="description" content="Creative director, designer, and visual storyteller based in New York." />
</svelte:head>

<section class="about">
	<div class="about-content">
		<h1 class="about-heading">About</h1>
		<p class="about-bio">
			Creative director and designer based in New York. Working at the intersection of brand, motion,
			and digital experience — with a focus on work that is precise, considered, and lasting.
		</p>
		<p class="about-bio">
			Open to new collaborations.
		</p>
		<a href="mailto:hello@virgil.studio" class="about-contact">hello@virgil.studio</a>
	</div>
</section>

<Footer />

<style>
	.about {
		display: flex;
		align-items: flex-end;
		min-height: calc(100vh - 72px);
		padding: 72px 48px;
	}

	.about-content {
		max-width: 560px;
	}

	.about-heading {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-tertiary);
		margin-bottom: 32px;
	}

	.about-bio {
		font-size: 22px;
		font-weight: 300;
		line-height: 1.6;
		color: var(--text-primary);
		margin-bottom: 20px;
	}

	.about-contact {
		display: inline-block;
		margin-top: 16px;
		font-size: 13px;
		font-weight: 400;
		letter-spacing: 0.06em;
		color: var(--text-secondary);
		border-bottom: 1px solid rgba(0, 0, 0, 0.15);
		padding-bottom: 2px;
		transition: color 0.2s ease, border-color 0.2s ease;
	}

	.about-contact:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
	}

	@media (max-width: 600px) {
		.about {
			padding: 48px 24px;
		}
	}
</style>
