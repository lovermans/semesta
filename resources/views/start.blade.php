@extends('layouts.root')

@section('main-content')
	<p class="browser-info">
		<strong>
			@lang('Best use on Google Chrome at least version 133 compatible browser')
		</strong>
		&nbsp; - &nbsp;
		<i>
			@lang('You are using')
			<span id="detectedBrowser">@lang('inspecting...')</span>
		</i>
	</p>
@endsection
