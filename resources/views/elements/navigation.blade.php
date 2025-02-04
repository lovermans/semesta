<nav aria-label="Main Navigation" data-print="none" id="main-navigation" popover>
	<ul class="menu">
		<li>
			<a href="#home">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Home
			</a>
		</li>
		<li>
			<a href="#home2">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Service
				<svg aria-hidden="true" viewbox="0 0 24 24">
					<use href="#arrow-drop-down-icon"></use>
				</svg>
			</a>
			<ul>
				<li><a href="#design">Web Design</a></li>
				<li>
					<button aria-disabled="true">
						<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
							<use href="#article-icon"></use>
						</svg>
						Development
						<svg aria-hidden="true" viewbox="0 0 24 24">
							<use href="#arrow-drop-down-icon"></use>
						</svg>
					</button>
					<ul>
						<li><a href="#frontend">Frontend</a></li>
						<li>
							<button aria-disabled="true">
								<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
									<use href="#article-icon"></use>
								</svg>
								Development B
								<svg aria-hidden="true" viewbox="0 0 24 24">
									<use href="#arrow-drop-down-icon"></use>
								</svg>
							</button>
							<ul>
								<li><a href="#backend">Backend</a></li>
							</ul>
					</ul>
				</li>
				<li><a href="#marketing">Digital Marketing</a></li>
			</ul>
		</li>
		<li>
			<button aria-disabled="true">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				About
				<svg aria-hidden="true" viewbox="0 0 24 24">
					<use href="#arrow-drop-down-icon"></use>
				</svg>
			</button>
			<ul>
				<li><a href="#team">Our Team</a></li>
				<li><a href="#mission">Our Mission</a></li>
			</ul>
		</li>
		<li>
			<a href="#contact">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>Contact
			</a>
		</li>
	</ul>

	<div id="main-navigation-footer">
		<div class="separator">
			@lang('Theme')
		</div>
		<button aria-label="auto" aria-live="polite" class="header-button theme-toggle" id="theme-toggle">
			@lang('Dark/Light')
			<svg aria-hidden="true" class="sun-and-moon" viewBox="0 0 24 24">
				<mask class="moon" id="moon-mask">
					<rect fill="white" height="100%" width="100%" x="0" y="0"></rect>
					<circle cx="24" cy="10" fill="black" r="6"></circle>
				</mask>
				<use href="#theme-toggle-icon"></use>
			</svg>
		</button>
		<label class="separator" for="app-color-theme">
			@lang('Color')
		</label>
		<div id="app-color-slider">
			<input id="app-color-theme" max="360" min="0" type="range" value="115">
			<div id="app-color-actions">
				<button id="shuffle-app-color-theme" title="@lang('Shuffle')">
					<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
						<use href="#shuffle-icon"></use>
					</svg>
				</button>
				<button id="save-app-color-theme" title="@lang('Save')">
					<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
						<use href="#save-icon"></use>
					</svg>
				</button>
			</div>
		</div>
		<label class="separator" for="app-locale">
			@lang('Language')
		</label>
		<form action="{{ $app->url->route('locale-setting') }}" id="language-selector" method="POST">
			<select id="app-locale" name="locale">
				<option @selected($app->getLocale() == 'id') value="id">Indonesia</option>
				<option @selected($app->getLocale() == 'en') value="en">English</option>
			</select>
		</form>
	</div>
</nav>

<nav aria-label="App Navigation" data-print="none" id="app-navigation" popover>
	<ul class="menu flex">
		<li>
			<a href="#HRM">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				HRM
			</a>
		</li>
		<li>
			<a href="#LegalPR">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Legal & PR
			</a>
		</li>
		<li>
			<a href="#Finance">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Finance & Accounting
			</a>
		</li>
		<li>
			<a href="#Procurement">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Procurement
			</a>
		</li>
		<li>
			<a href="#SupplyChain">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Supply Chain
			</a>
		</li>
		<li>
			<a href="#Production">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Production
			</a>
		</li>
		<li>
			<a href="#QualityAssurance">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Quality Assurance
			</a>
		</li>
		<li>
			<a href="#Marketing">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Marketing
			</a>
		</li>
		<li>
			<a href="#CustomerSatisfaction">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Customer Satisfaction
			</a>
		</li>
	</ul>
</nav>

<nav aria-label="User Navigation" data-print="none" id="user-navigation" popover>
	<ul class="menu">
		<li>
			<a href="#EditProfile">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Edit Profile
			</a>
		</li>
		<li>
			<a href="#ChangePassword">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Change Password
			</a>
		</li>
		<li>
			<a href="#Logout">
				<svg aria-hidden="true" class="menu-icon" viewbox="0 0 24 24">
					<use href="#article-icon"></use>
				</svg>
				Logout
			</a>
		</li>
	</ul>
</nav>
