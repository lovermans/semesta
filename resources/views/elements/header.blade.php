<header aria-label="Top App Bar" data-print="none">
	<div class="overlay">
		<div class="header-column" id="main-header">
			<button class="header-button" popovertarget="main-navigation" title="Main Navigation Menu">
				<svg aria-hidden="true" viewbox="0 0 24 24">
					<use href="#menu-icon"></use>
				</svg>
			</button>
			<div class="title-header">
				<a href="{{ $app->url->route('root') }}" title="{{ $app->config->get('app.name') }}">
					<img alt="{{ $app->config->get('app.name') . ' App Icon' }}" src="{{ Vite::asset('resources/images/app-icon/app-icon-sprites.svg') . '#app-icon' }}">
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
			<button popovertarget="app-navigation" title="App Menu">
				<svg aria-hidden="true" viewbox="0 0 24 24">
					<use href="#apps-icon"></use>
				</svg>
			</button>
			<button popovertarget="user-navigation" title="User Menu">
				<img alt="User Menu" aria-hidden="true" src="{{ Vite::asset('resources/images/svg/icon-sprites.svg') . '#account-circle-icon' }}">
			</button>
			<a class="text-button" href="#login" title="Login">
				Login
			</a>
		</div>
	</div>
</header>
