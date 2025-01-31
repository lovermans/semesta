<header aria-label="Top App Bar" data-print="none">
	<div class="overlay">
		<div class="header-column" id="main-header">
			<button class="header-button" popovertarget="main-navigation" title="Main Navigation Menu">
				<svg aria-hidden="true" viewbox="0 0 24 24">
					<use href="#menu-icon"></use>
				</svg>
			</button>
			<div class="title-header">
				<a href="{{ $app->url->route('start') }}" title="{{ $app->config->get('app.name') }}">
					<img alt="{{ $app->config->get('app.name') . ' App Icon' }}" class="svg"
						src="{{ Vite::asset('resources/images/app-icon/app-icon-sprites.svg') . '#app-icon' }}">
					{{ $app->config->get('app.name') }}
				</a>
			</div>
		</div>
		<div class="header-column" id="extra-header">
			<button popovertarget="app-navigation" title="App Menu">
				<svg aria-hidden="true" viewbox="0 0 24 24">
					<use href="#apps-icon"></use>
				</svg>
			</button>
			<button popovertarget="user-navigation" title="User Menu">
				<img alt="User Menu" aria-hidden="true" class="svg" src="{{ Vite::asset('resources/images/svg/icon-sprites.svg') . '#account-circle-icon' }}">
			</button>
			<a class="text-button" href="#login" title="Login">
				Login
			</a>
		</div>
	</div>
</header>
