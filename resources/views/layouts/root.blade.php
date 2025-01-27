<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('elements.metadata')

		@sectionMissing('page-need-javascript-message')
			<noscript>
				<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
			</noscript>

			{{ Vite::withEntryPoints(['resources/js/start.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }}
		@endif

		<link href="{{ $app->url->route('css-font-face') . '?id=' . filemtime($app->resourcePath('views/morphs/css-font-face.blade.php')) }}"
			nonce="{{ Vite::cspNonce() }}" rel="stylesheet">

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		<style nonce="{{ Vite::cspNonce() }}">

		</style>
	</head>

	<body>
		<a aria-label="Link To Jump To Main Content" class="jump-to-main-content" href="#main-content">Jump To Main Content</a>

		@sectionMissing('page-need-javascript-message')
			<div aria-hidden="true">
				<object data="{{ Vite::asset('resources/images/svg/icon-sprites.svg') }}" id="icon-sprites" nonce="{{ Vite::cspNonce() }}"
					onload="this.parentElement.id='inline-svg-icon';this.outerHTML=this.contentDocument.documentElement.outerHTML;" type="image/svg+xml"></object>
			</div>

			@include('elements.header')
			@include('elements.navigation')
		@endif

		<main id="main-content">
			@hasSection('page-need-javascript-message')
				@yield('page-need-javascript-message')
			@endif

			@yield('main-content')
		</main>

		@sectionMissing('page-need-javascript-message')
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
				import {
					findCurrentPage,
					showHideTopAppBarOnScroll,
					handleGlobalClickEvent
				} from "{{ Vite::asset('resources/js/main-interaction.js') }}";

				findCurrentPage();
				showHideTopAppBarOnScroll(document.body, 500);
				handleGlobalClickEvent();
			</script>
		@endif
	</body>

</html>
