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

		<style src="{{ $app->url->route('css-font-face') . '?id=' . filemtime($app->resourcePath('views/css-font-face.blade.php')) }}"></style>

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		@stack('resources')
	</head>

	<body>
		<div>
			<object data="{{ Vite::asset('resources/images/svg/icon-sprites.svg') }}" id="icon-sprites" type="image/svg+xml"></object>
		</div>

		{{ Vite::withEntryPoints(['resources/js/svg-sprites-icon-loader.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }}

		<button aria-label="auto" aria-live="polite" class="theme-toggle" id="theme-toggle" title="Toggles light & dark">
			<svg aria-hidden="true" class="sun-and-moon" viewBox="0 0 24 24">
				<mask class="moon" id="moon-mask">
					<rect fill="white" height="100%" width="100%" x="0" y="0"></rect>
					<circle cx="24" cy="10" fill="black" r="6"></circle>
				</mask>
				<use href="#theme-toggle-icon"></use>
			</svg>
		</button>

		@hasSection('page-need-javascript-message')
			@yield('page-need-javascript-message')
		@endif

		<div id="content">
			@yield('content')
		</div>

		@sectionMissing('page-need-javascript-message')
			<script type="module"
				src="{{ $app->url->route('js-register-service-worker') . '?id=' . filemtime($app->resourcePath('views/js-register-service-worker.blade.php')) }}"></script>
		@endif
	</body>

</html>
