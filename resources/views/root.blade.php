<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('include-metadata')

		@stack('metadata')

		@sectionMissing('page-need-javascript-message')
			<noscript>
				<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
			</noscript>
		@endif

		{{ Vite::withEntryPoints(['resources/js/start.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }}

		<link href="{{ $app->url->route('css-font-face') . '?id=' . filemtime($app->resourcePath('views/css-font-face.blade.php')) }}" nonce="{{ Vite::cspNonce() }}"
			rel="stylesheet">

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		@stack('resources')

		<style nonce="{{ Vite::cspNonce() }}">

		</style>
	</head>

	<body>
		<div aria-hidden="true">
			<object data="{{ Vite::asset('resources/images/svg/icon-sprites.svg') }}" id="icon-sprites" nonce="{{ Vite::cspNonce() }}"
				onload="this.parentElement.id='inline-svg-icon';this.outerHTML=this.contentDocument.documentElement.outerHTML;" type="image/svg+xml"></object>
		</div>

		<header data-print="none">
			<div class="header-column" id="main-header">
				<button class="header-button" title="Menu">
					<svg aria-hidden="true" viewbox="0 0 24 24">
						<use href="#menu"></use>
					</svg>
				</button>
				<div class="title-header">
					<a href="{{ $app->url->route('start') }}" title="{{ $app->config->get('app.name') }}">
						<img alt="{{ $app->config->get('app.name') . ' App Icon' }}" src="{{ Vite::asset('resources/images/svg/icon-sprites.svg') . '#semesta' }}">
						{{ $app->config->get('app.name') }}
					</a>
				</div>
			</div>
			<div class="header-column" id="extra-header">
				<button aria-label="auto" aria-live="polite" class="header-button theme-toggle" id="theme-toggle" title="Toggles light & dark theme">
					<svg aria-hidden="true" class="sun-and-moon" viewBox="0 0 24 24">
						<mask class="moon" id="moon-mask">
							<rect fill="white" height="100%" width="100%" x="0" y="0"></rect>
							<circle cx="24" cy="10" fill="black" r="6"></circle>
						</mask>
						<use href="#theme-toggle-icon"></use>
					</svg>
				</button>
			</div>
		</header>

		@hasSection('page-need-javascript-message')
			@yield('page-need-javascript-message')
		@endif

		<div id="content">
			@yield('content')
		</div>

		@sectionMissing('page-need-javascript-message')
			<script type="module"
				src="{{ $app->url->route('js-register-service-worker') . '?id=' . filemtime($app->resourcePath('views/js-register-service-worker.blade.php')) }}"
				nonce="{{ Vite::cspNonce() }}"></script>
		@endif

		<script nonce="{{ Vite::cspNonce() }}" type="module">
			import {
				showHideTopAppBarOnScroll
			} from "{{ Vite::asset('resources/js/core-listener.js') }}";

			showHideTopAppBarOnScroll(document.body, 500);
		</script>
	</body>

</html>
