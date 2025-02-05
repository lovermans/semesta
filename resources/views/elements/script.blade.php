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
	function getBrowserInfo() {
		const userAgent = navigator.userAgent;
		let browserName = '@lang('Unknown')';
		let browserVersion = '@lang('Unknown')';

		if (/chrome|crios|crmo/i.test(userAgent) && !/edg/i.test(userAgent)) {
			browserName = 'Google Chrome';
			browserVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || '@lang('Unknown')';
		} else if (/firefox|fxios/i.test(userAgent)) {
			browserName = 'Mozilla Firefox';
			browserVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || '@lang('Unknown')';
		} else if (/safari/i.test(userAgent) && !/chrome|crios|crmo|edg/i.test(userAgent)) {
			browserName = 'Safari';
			browserVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] || '@lang('Unknown')';
		} else if (/edg/i.test(userAgent)) {
			browserName = 'Microsoft Edge';
			browserVersion = userAgent.match(/Edg\/([\d.]+)/)?.[1] || '@lang('Unknown')';
		} else if (/opera|opr/i.test(userAgent)) {
			browserName = 'Opera';
			browserVersion = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || '@lang('Unknown')';
		}

		let detectedBrowser = `${browserName} @lang('version') ${browserVersion}`;
		let detectedBrowserAnchor = document.getElementById('detectedBrowser');

		if (detectedBrowserAnchor) {
			detectedBrowserAnchor.textContent = detectedBrowser;
		}
	}

	getBrowserInfo();
</script>

<script nonce="{{ Vite::cspNonce() }}" type="module">
	import * as root from "{{ Vite::asset('resources/js/main-interaction.js') }}";

	root.findCurrentPage();
	root.showHideTopAppBarOnScroll(document.body, 500);
	root.handleGlobalClickEvent();
	root.handleAppLocaleChange();
</script>
