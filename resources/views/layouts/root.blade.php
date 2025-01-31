<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('elements.metadata')

		<style nonce="{{ Vite::cspNonce() }}">

		</style>

		<link href="{{ $app->url->route('css-font-face') . '?id=' . filemtime($app->resourcePath('views/morphs/css-font-face.blade.php')) }}"
			nonce="{{ Vite::cspNonce() }}" rel="stylesheet">

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		@sectionMissing('page-need-javascript-message')
			<noscript>
				<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
			</noscript>

			{{ Vite::withEntryPoints(['resources/js/start.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }}
		@endif
	</head>

	<body>
		<a aria-label="Link To Jump To Main Content" class="jump-to-main-content" href="#main-content">@lang('Jump To Main Content')</a>

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

		<footer>
			Test Footer
		</footer>

		@sectionMissing('page-need-javascript-message')
			@include('elements.script')
		@endif
	</body>

</html>
