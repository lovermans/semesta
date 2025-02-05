<!DOCTYPE html>
<html dir="ltr" lang="{{ str_replace('_', '-', $app->getLocale()) }}">

	<head>
		@include('elements.metadata')

		<style nonce="{{ Vite::cspNonce() }}">
			@include('morphs.css-font-face')
		</style>

		<style nonce="{{ Vite::cspNonce() }}">

		</style>

		{{ Vite::withEntryPoints(['resources/css/main.css']) }}

		@sectionMissing('page-need-javascript-message')
			<noscript>
				<meta HTTP-EQUIV="refresh" content="0;url='{{ $app->url->route('page-need-javascript') }}'">
			</noscript>

			<script nonce="{{ Vite::cspNonce() }}">
				{!! Vite::content('resources/js/start.js') !!}
			</script>

			{{-- {{ Vite::withEntryPoints(['resources/js/start.js'])->useScriptTagAttributes(['type' => false])->usePreloadTagAttributes(false) }} --}}
		@endif
	</head>

	<body>
		<a aria-label="Link To Jump To Main Content" class="jump-to-main-content" href="#main-content">@lang('Jump To Main Content')</a>

		@sectionMissing('page-need-javascript-message')
			<div aria-hidden="true">
				<object data="{{ Vite::asset('resources/images/svg/internal-icon-sprites.svg') }}" id="icon-sprites"
					nonce="{{ Vite::cspNonce() }}"
					onload="this.parentElement.id='inline-svg-icon';this.outerHTML=this.contentDocument.documentElement.outerHTML;"
					type="image/svg+xml"></object>
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
			<div class="build-with">
				{{ Illuminate\Foundation\Application::VERSION }}
			</div>
			<div class="separator"></div>
			<div class="copyright">
				<a href="{!! $app->url->route('start') !!}">{{ $app->config->get('app.name') }}</a>
				&copy;2025{{ date('Y') == 2025 ? '' : '-' . date('Y') }}
			</div>
		</footer>

		@sectionMissing('page-need-javascript-message')
			@include('elements.script')
		@endif
	</body>

</html>
