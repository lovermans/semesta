<script type="module"
	src="{{ $app->url->route('js-register-service-worker') . '?id=' . filemtime($app->resourcePath('views/morphs/js-register-service-worker.blade.php')) }}"
	nonce="{{ Vite::cspNonce() }}"></script>

<script nonce="{{ Vite::cspNonce() }}">
	async function applyWebsocket() {
		let {
			soketi
		} = await import(
			"{{ $app->url->route('js-websocket') . '?id=' . filemtime($app->resourcePath('views/morphs/js-websocket.blade.php')) }}"
		);

		return soketi;
	};

	window.addEventListener('popstate', (event) => {
		console.log(`location: ${document.location}, state: ${JSON.stringify(event.state)}`, );
	});
</script>

<script nonce="{{ Vite::cspNonce() }}" type="module">
	import * as root from "{{ Vite::asset('resources/js/main-interaction.js') }}";

	root.findCurrentPage();
	root.showHideTopAppBarOnScroll(document.body, 500);
	root.handleGlobalClickEvent();
	root.handleAppLocaleChange();
</script>
