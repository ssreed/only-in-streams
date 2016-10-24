"use strict";

(function(Window) {

	console.log("%c app ready ", "color: blue; font-size: 20px; background: blueviolet; color: white; text-transform: uppercase");

	var props = {
		TWITCH_KEY: '2ml2xnkbukvgtn1nr6fgcrscaip5ff8',
		TWITCH_URL: 'https://api.twitch.tv/kraken/search/streams',
		LIMIT: 10,
		PAGE: 1,
		TOTAL_RESULTS: 0,
		TOTAL_PAGES: 1,
		CURRENT_PAGE: 1
	};

	var searchForm = document.querySelector("#streamsForm");
	var searchInput = document.querySelector("#searchTerm");
	var streamsEl = document.querySelector(".streams");
	var scriptContainer = document.querySelector('#scriptContainer');
	var nextBtn = document.querySelector("#pageRight");
	var prevBtn = document.querySelector("#pageLeft");
	var pageNumbersEl = document.querySelector('.page-numbers');
	var totalViewersEl = document.querySelector('.total-viewers');
	var nextPageEl = document.querySelector('#pageRight');
	var prevPageEl = document.querySelector('#pageLeft');


	function handleSearch(e) {
		e.preventDefault();

		var url = props.TWITCH_URL + '?limit=' + props.LIMIT + '&q=' + searchInput.value + '&callback=handleResponse' + '&client_id=' + props.TWITCH_KEY;

		if (searchInput.value !== "") {
			getData(url);
		} else {
			console.warn('Please enter a valid term');
		}
	}

	function handleNext(e) {
		e.preventDefault();

		var url = e.target.parentNode.getAttribute('href');

		if (props.CURRENT_PAGE < props.TOTAL_PAGES) {
			getData(url);
		}
	}

	function handlePrevious(e) {
		e.preventDefault();

		var url = e.target.parentNode.getAttribute('href');

		getData(url);
	}

	function handleResponse(response) {
		var streams = [],
			info = {};

		cleanUpScripts();
		cleanUpStreamContent();

		if (response && response._total > 0) {

			console.info('total: ', response._total);
			console.info('response: ', response);

			info = {
				'total_results': response._total,
				'next_link': response._links.next,
				'prev_link': response._links.prev,
				'self_link': response._links.self
			};

			response.streams.forEach(function(stream) {
				streams.push({
					'name': stream.game,
					'channel_name': stream.channel.display_name,
					'number_of_viewers': stream.viewers,
					'description': stream.channel.status,
					'stream_preview': stream.preview.medium,
					'stream_url': stream.channel.url,
					'stream_preview_small': stream.preview.small,
					'stream_preview_medium': stream.preview.medium,
					'stream_preview_large': stream.preview.large
				});
			});

			console.log('streams length: ', streams.length);
		} else {

			cleanUpStreamInfo();

			streams.push({
				'error': 'No results available'
			});
		}

		if (!streams[0].error || streams[0].error.length <= 0) {
			renderInfo(info);
		}

		renderContent(streams);
	}

	function createStreamContainer() {
		var streamContainer = document.createElement('li');
		streamContainer.setAttribute('class', 'stream');

		streamsEl.appendChild(streamContainer);

		return streamContainer;
	}

	function renderContent(data) {
		var stream_details = "";
		var streamContainer;

		if (data[0].error) {

			streamContainer = createStreamContainer();
			streamContainer.innerHTML = data[0].error;

			nextPageEl.querySelector('span').setAttribute('hidden', true);
			prevPageEl.querySelector('span').setAttribute('hidden', true);

		} else {
			data.forEach(function(x) {

				streamContainer = createStreamContainer();

				//stream data v2
				stream_details = "<div class='stream-image-container'>" + "<a href='" + x.stream_url + "'>" +
					"<img src='" + x.stream_preview + "'srcset='" + x.stream_preview_large + " 640w, " + x.stream_preview_medium + " 320w, " + x.stream_preview_small + " 80w'" + ">" +
					"</a>" + "</div>" + "<div class='stream-info-container'>" + "<a href='" + x.stream_url + "'>" +
					"<div class='name'>" + x.channel_name + "</div>" + "</a>" +
					"<div class='game'>" + x.name +
					" - " + x.number_of_viewers + " viewers</div>" +
					"<div class='description'>" + x.description + "</div>" + "</div>";

				streamContainer.innerHTML = stream_details;
			});
		}
	}

	function renderInfo(info) {

		props.TOTAL_RESULTS = info.total_results;
		props.CURRENT_PAGE = (info.next_link.split("offset=")[1].split("&")[0] / props.LIMIT);
		props.TOTAL_PAGES = Math.ceil(props.TOTAL_RESULTS / props.LIMIT);

		totalViewersEl.textContent = 'Total results: ' + info.total_results;
		pageNumbersEl.textContent = props.CURRENT_PAGE + '/' + props.TOTAL_PAGES;

		nextPageEl.setAttribute('href', info.next_link + '&callback=handleResponse' + '&client_id=' + props.TWITCH_KEY);
		prevPageEl.setAttribute('href', (info.prev_link ? info.prev_link + '&callback=handleResponse' + '&client_id=' + props.TWITCH_KEY : ""));

		nextPageEl.querySelector('span').removeAttribute('hidden');
		prevPageEl.querySelector('span').removeAttribute('hidden');
	}

	function getData(url) {
		var scriptElement = document.createElement('script');
		scriptElement.setAttribute('src', url);

		scriptContainer.appendChild(scriptElement);
	}

	function cleanUpScripts() {
		while (scriptContainer.firstChild) {
			scriptContainer.removeChild(scriptContainer.firstChild);
		}
	}

	function cleanUpStreamContent() {
		if (streamsEl.innerHTML.length > 0) {
			streamsEl.innerHTML = "";
		}
	}

	function cleanUpStreamInfo() {
		if (pageNumbersEl.innerHTML.length > 0) {
			pageNumbersEl.innerHTML = "";
		}

		if (totalViewersEl.innerHTML.length > 0) {
			totalViewersEl.innerHTML = "";
		}
	}

	searchForm.addEventListener('submit', handleSearch);
	nextBtn.addEventListener('click', handleNext);
	prevBtn.addEventListener('click', handlePrevious);

	Window.handleResponse = handleResponse;

})(window);