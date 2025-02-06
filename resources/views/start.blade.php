@extends('layouts.root')

@section('main-content')
	<p class="browser-info">
		<strong>
			@lang('Best used with a Browser at least compatible with Google Chrome version 133')
		</strong>
		&nbsp; - &nbsp;
		<i>
			@lang('You are using')
			<span id="detectedBrowser">@lang('inspecting...')</span>
		</i>
	</p>
@endsection
