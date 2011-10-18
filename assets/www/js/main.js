function init() 
{
    document.addEventListener("deviceready", onDeviceReady, true);
}

function onDeviceReady()
{
	// some reason the android browser is not recognizing the style=block when set in the CSS
	// it only seems to recognize the style when dynamically set here or when set inline...
	// the style needs to be explicitly set for logic used in the backButton handler
	document.getElementById("content").style.display = "block";

    document.addEventListener("backbutton", onBackButton, false);
    document.addEventListener("searchbutton", onSearchButton, false); 
    
	loadContent();
}

function onBackButton()
{
	if ($('#content').css('display') == "block")
	{
		console.log("we want to go back in browser history");
		// hmm...using the PG-Android APIs for:
		// -navigator.app.overrideBackbutton(false); --> goes to blank screen and then exits app if pressed again...
		// -navigator.app.backHistory(); --> exits the app instead of going back in the browser history...
		// using the default browser history API
		// -window.history.back(); --> exits the app instead of going back in the browser history...
		
		// window.history.back();
		navigator.app.backHistory(); 
		//navigator.app.overrideBackbutton(false);
	}

	if ($('#bookmarks').css('display') == "block" ||
		$('#history').css('display') == "block" ||
		$('#searchresults').css('display') == "block")
	{
		console.log("overlays back");
		enableOptionsMenu();
		window.hideOverlayDivs();
		window.showContent();
	}
}

function onSearchButton()
{
	//hmmm...doesn't seem to set the cursor in the input field - maybe a browser bug???
	$('#searchParam').focus();
	
	plugins.SoftKeyBoard.show();
}

function showProgressLoader(title, message)
{
	PhoneGap.exec(null, null, "IndeterminateProgress", "progressStart", [title, message]);
}

function hideProgressLoader()
{
	PhoneGap.exec(null, null, "IndeterminateProgress", "progressStop", []);
}

function hideMobileLinks()
{
	var frameDoc = document.getElementById("main").contentDocument;
	frameDoc.getElementById("header").style.display = "none";
	frameDoc.getElementById("footmenu").style.display = "none";
	$('a.external, a.extiw', frameDoc).click(function(event) {
		var target = $(this).attr('href');

		// Stop the link from opening in the iframe...
		event.preventDefault();

		// And open it in parent context for reals.
		//
		// This seems to successfully launch the native browser, and works
		// both with the stock browser and Firefox as user's default browser
		document.location = target;
	});
}

function iframeOnLoaded()
{
	// scroll the page to the top after it loads
	window.scroll(0,0);
	hideMobileLinks();
	addToHistory();
	hideProgressLoader();
}

function loadContent() 
{
	if (hasNetworkConnection())
	{
		showProgressLoader(mw.message('spinner-loading').plain(),
		                   mw.message('spinner-retrieving', mw.message('sitename').plain()).plain());
    $.ajax({url: "http://en.m.wikipedia.org",
            success: function(data) {
              if(data) {
                $('#main').attr('src', 'http://en.m.wikipedia.org');
              } else {
                noConnectionMsg();
                navigator.app.exitApp();
              }
            },
            error: function(xhr) {
              noConnectionMsg();
            },
            timeout: 3000
         });
	}
	else
	{
		noConnectionMsg();
	}
}

function hideOverlayDivs()
{
	$('#bookmarks').hide();
	$('#history').hide();
	$('#searchresults').hide();
}

function showContent()
{
	$('#mainHeader').show();
	$('#content').show();
}

function hideContent()
{	
	$('#mainHeader').hide();
	$('#content').hide();
}

function checkLength()
{
	var searchTerm = $('#searchParam').val();
	
	if (searchTerm.length > 0)
	{
		$('#clearSearch').show();
	}
	else
	{
		$('#clearSearch').hide();
	}
}

function clearSearch()
{
	$('#searchParam').val('');
	$('#clearSearch').hide();
}

function noConnectionMsg()
{
	alert("Please try again when you're connected to a network.");
}

function hasNetworkConnection() 
{
    return navigator.network.connection.type == Connection.NONE ? false : true;
}

function disableOptionsMenu()
{	
/*
	disableCommand('forward');
	disableCommand('add bookmark');
	
	PGMenuElement.update();
	*/
}

function disableCommand(commandToDisable)
{
	var commands = document.getElementsByTagName("command");

	for (var i=0;i<commands.length;i++)
	{
		if (commands[i].getAttribute('label').toLowerCase() == commandToDisable)
		{
			commands[i].setAttribute('disabled', 'true');
			return;
		}
	}
}

function enableOptionsMenu()
{
/*
	var commands = document.getElementsByTagName("command");

	for (var i=0;i<commands.length;i++)
	{
		commands[i].setAttribute('disabled', 'false');
	}
	
	PGMenuElement.update();
	*/
}
