'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
	$('.project a').click(addProjectDetails);

	$('#colorBtn').click(randomizeColors);

	$('.spotify .handle').hover(function() {
		showSpotify($(this).parent());
	});
}

/*
 * Make an AJAX call to retrieve project details and add it in
 */
function addProjectDetails(e) {
	// Prevent following the link
	e.preventDefault();

	// Get the div ID, e.g., "project3"
	var projectID = $(this).closest('.project').attr('id');
	// get rid of 'project' from the front of the id 'project3'
	var idNumber = projectID.substr('project'.length);

	$.get('/project/' + idNumber, showProject);
}

function showProject(projectData) {
	var html = 
		'<h4>' + projectData.date + '</h4>' +
		'<img src="' + projectData.image + '" class="detailsImage">' +
		projectData.summary;
	$('#project' + projectData.id).find('.details').html(html);
}

/*
 * Make an AJAX call to retrieve a color palette for the site
 * and apply it
 */
function randomizeColors(e) {
	$.get('/palette', setColors);
}

function setColors(colorData) {
	var colors = colorData.colors.hex;
	$('body').css('background-color', colors[0]);
	$('.thumbnail').css('background-color', colors[1]);
	$('h1, h2, h3, h4, h5, h5').css('color', colors[2]);
	$('p').css('color', colors[3]);
	$('.project img').css('opacity', .75);
}

function showSpotify($spotifyElement) {
	var $project = $spotifyElement.parents('.project');
	var $content = $spotifyElement.children('.content');
	$spotifyElement.addClass('active');
	if ($content.children().length == 0) {
		var projectID = $project.attr('id');
		var idNumber = projectID.substr('project'.length);

		var title = $project.find('.projectTitle').text();
		var firstWord = title.split(' ')[0];

		var $tracksContainer = $('<div class="tracksContainer"></div>');
		var $tracks = $('<div class="tracks"></div>');
		$tracksContainer.append($tracks);

		var receivedTracks = 0;
		var currentTrack = 0;

		var $nextButton = $('<div class="nextButton"></div>');
		var $prevButton = $('<div class="prevButton"></div>').hide();

		$nextButton.click(function() {
			if (currentTrack < receivedTracks - 1) {
				// Show next track
				currentTrack++;
				$tracks.stop(true).animate({left: -currentTrack*150});
			}
			if (currentTrack >= receivedTracks -1) {
				$nextButton.hide();
			}
			if (currentTrack > 0) {
				$prevButton.show();
			}
		});

		$prevButton.click(function() {
			if (currentTrack > 0) {
				// Show previous track
				currentTrack--;
				$tracks.stop(true).animate({left: -currentTrack*150});
			}
			if (currentTrack <= 0) {
				$prevButton.hide();
			}
			if (currentTrack < receivedTracks -1) {
				$nextButton.show();
			}
		});

		$content.append($tracksContainer, $prevButton, $nextButton);

		var callback = function(results) {
			console.log(results);
			var tracks = results.tracks;

			receivedTracks = Math.min(tracks.length,10); // Show no more than 10 tracks
			$tracks.css({width: receivedTracks * 150});

			for (var i = 0; i < receivedTracks; i++) {
				var track = tracks[i];

				var $playButton = $('<a href="' + track.href + '" class="playButton"></a>');
				var $title = $('<h4 title="' + track.artists[0].name + '">' + track.name + '</h4>');

				var $track = $('<div class="track"></div>');

				$track.append($playButton, $title);
				$tracks.append($track);
			}
		}

		// GAAH hard coded haxx since I can't get any results on some of the original titles.
		firstWord = firstWord == 'Needfinding' ? 'Need' : firstWord == 'Prototyping' ? 'Prototype' : firstWord;
		var data = { q: firstWord, page: 1};                
        $.get('http://ws.spotify.com/search/1/track', data, callback, 'json');

		var $closeButton = $('<div class="exit">close</div>');
		$closeButton.click(function() {
			$content.stop().slideUp(100);
			$spotifyElement.removeClass('active');
		});

		$content.append($closeButton);
	}
	$content.stop().slideDown(100);
}