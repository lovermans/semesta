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

	async function getMainFunction() {
		let use = await import("{{ Vite::asset('resources/js/main-function.js') }}");

		return use;
	};
</script>

<script nonce="{{ Vite::cspNonce() }}" type="module">
	import * as appStart from "{{ Vite::asset('resources/js/main-interaction.js') }}";

	appStart.getBrowserInfo('@lang('Unknown')', '@lang('version')', 'detectedBrowser');
	appStart.findCurrentPage();
	appStart.showHideTopAppBarOnScroll(document.body, 500);
	appStart.handleGlobalClickEvent();
	appStart.handleAppLocaleChange();

	window.addEventListener('popstate', (event) => {
		console.log(`location: ${document.location}, state: ${JSON.stringify(event.state)}`, );
	});
</script>
