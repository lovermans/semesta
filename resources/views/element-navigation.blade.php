<nav aria-label="Main Navigation" data-print="none" id="main-navigation" popover>
	<ul class="menu">
		@hasSection('main-navigation')
			@yield('main-navigation')
		@endif
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
</nav>
