$(function() {
	var gameNumber = Math.floor(Math.random() * 100) + 1;
	var gameHistory = [];
	var guessesAllowed = 5;
	var gameOver = false;
	var prevGameStatus = {};
	var animateID = null;

	/* Bind elements to vars */
	var $gameTitle = $('.game-title');
	var $guessInputField = $('#guess-input');
	var $guessForm = $('#guess-form').attr('autocomplete', 'off');
	var $gameStatus = $('#game-status');
	var $gameStatusBaseClass = $gameStatus.attr('class');
	var $gameStatusIcon = $('#icon-status');
	var $guessStatus = $('#guess-status');
	var $gameInfo = $('#game-info');
	var $guessHistory = $('#guess-history');
	var $newGameButton = $('#new-game-button');
	var $hintButton = $('#hint-button');
	var $colorButton = $('#color-button');

	var $animateElem = $('.color-animate')


	newGame();

	function isValidInput(inputVal) {
		var numeric1to100Reg = /^([0-9]|[1-9][0-9]|100)$/;
		if (!inputVal) {
			return false;
		}
		if (!numeric1to100Reg.test(inputVal)) {
			return false;
		}
		else {
			return true;
		}
	}

	function checkUserGuess(userVal, pastGuesses) {
		var userVal = userVal * 1; // convert to integer
		var guessRange = Math.abs(gameNumber - userVal);

		var lastGuess = pastGuesses.length ? pastGuesses.slice(-1) : 1000;
		var lastGuessRange = Math.abs(gameNumber - lastGuess);

		var outputString = "";
		var outputClass;
		var trend = "cold";
		var status = "cold";

		if (gameNumber === userVal) {
			outputString = "You've won!!!";
			outputClass = "win-guess";
			status = "win";
		}
		else {
			outputString = "You are ";
			if (guessRange <= 5) {
				outputString += "Burning Hot and ";
				outputClass = "burning-hot-guess";
				status = "hot";
			}
			else if (guessRange <= 10) {
				outputString += "Hot and ";
				outputClass = "hot-guess";
				status = "hot";
			}
			else if (guessRange <= 15) {
				outputString += "Warm and ";
				outputClass = "warm-guess";
				status = "hot";
			}
			else if (guessRange <= 25) {
				outputString += "Cold and ";
				outputClass = "cold-guess";
			}
			else {
				outputString += "Ice Cold and ";
				outputClass = "ice-cold-guess";
			}

			if (guessRange < lastGuessRange) {
				outputString += "getting hotter... ";
				trend = "hot";
			}
			else {
				outputString += "getting colder... ";
				trend = "cold";
			}

			if (gameNumber > userVal) {
				outputString += "Guess higher!"
			} 
			else {
				outputString += "Guess lower!"
			}
		}

		return { 
			guess: userVal,
			trend: trend,
			status: status,
			outputClass: outputClass, 
			outputString: outputString 
		};
	}

	function addGuessHistory(info) {
		$('.latest-guess').removeClass('latest-guess');

		gameHistory.push(info['guess']);
		var historyString = gameHistory[gameHistory.length-1] + " " + info["outputString"];
		var historyItem = $('<li>', { 
			"class": info["outputClass"] + ' latest-guess',
			text: historyString
		});
		$guessHistory.prepend(historyItem);
		$gameInfo.find('span').text((guessesAllowed - gameHistory.length) + " Guesses Remaining...");

		historyItem.fadeOut(0).fadeIn(400);
	}

	function updateGameStatus(info, updatePrev) {
		// Remove all classes and revert to default
		$gameStatus.removeClass().addClass($gameStatusBaseClass);
		$gameStatus.addClass(info['outputClass']);
		var num = info['guess'] || "";

		// Hide the currently shown status icon
		var shownElem = $gameStatusIcon.children().not('.hidden');
		var updateElem = $gameStatusIcon.find('#'+info['status']);
		shownElem.addClass('hidden');
		updateElem.removeClass('hidden').fadeOut(0).fadeIn(400);

		$guessStatus.text(num);
		$guessStatus.removeClass('hidden').fadeOut(0).fadeIn(400);

		if(updatePrev) {
			prevGameStatus = info;
		}
	}

	function writeError(errorString) {
		var errorField = $('.alert');
		errorField.removeClass('invisible');
		errorField.find('.error').text(errorString);
		errorField.stop(true, true); // stop any queued animations
		errorField.fadeTo(0, 1, function() {
			$(this).delay(1000);
			$(this).fadeTo(1000, 0);
		});
	}

	function startColorAnimate($element) {
		var bgColors = ['cornflowerblue', 'tomato'];
		var fgColors = ['mediumturquoise', 'crimson'];

	    var tempID = 0;
	    var changeInterval = 1000;    // Change interval in miliseconds

	    if (animateID) {
	    	$element.stop(true,true);
	    	clearInterval(animateID);
        }
	    animateID = setInterval(function() {
			            $element.animate({
			            	backgroundColor: bgColors[tempID],
			        		color: fgColors[tempID]}, 5000);
			            tempID=tempID+1;
			            if (tempID>bgColors.length-1) {
			            	bgColors.reverse();
			            	fgColors.reverse();
			            	tempID=0; 
			            }
	       	}, changeInterval);
	    //console.log("starting " + animateID);
	}

	function stopColorAnimate($element) {
		//console.log("stopping " + animateID);
		$element.stop(true, true);
		clearInterval(animateID);

		// clear inline styles to revert to original styles
		$element.css({ backgroundColor: "", color: ""});
	}

	function newGame() {
		gameNumber = Math.floor(Math.random() * 100) + 1;
		gameHistory = [];
		gameOver = false;
		prevGameStatus = { guess: 0,
						   status: 'begin', 
						   outputClass: 'begin-guess' };

		$('#hint').text(gameNumber);

		updateGameStatus(prevGameStatus);

		$guessHistory.empty();

		$gameInfo.find('span').text((guessesAllowed - gameHistory.length) + " Guesses Remaining...");
		$gameInfo.fadeOut(0).fadeIn(600);

		stopColorAnimate($animateElem);
		startColorAnimate($animateElem);
	}

	$newGameButton.click(newGame);

	$hintButton.click(function () {
		var res;
		if ($gameStatus.hasClass('hint-guess')) {
			res = prevGameStatus;
		}
		else {
			res = { guess: 0, status: 'hint', outputClass: 'hint-guess' };
		}
		updateGameStatus(res, false);
	});

	/*$colorButton.click(function() {
		if (animateID === null) {
			startColorAnimate($animateElem);

			$(this).find('.button-text').text('Stop Animate Colors');
		}
		else {
			stopColorAnimate($animateElem);
			animateID = null;
			$(this).find('.button-text').text('Start Animate Colors');
		}
	});*/

	$guessInputField.keyup(function(event) {
		var userGuess = $(this).val();

		if (userGuess && !isValidInput(userGuess)) {
			var errorString = userGuess + " is not a valid number!";
			writeError(errorString);
		}
		else {
			//errorField.addClass('invisible');
		}
	});

	$guessForm.submit(function(event) {
		var guessInput = $(this).find('input');
		var userGuess = guessInput.val();
		var errorString = "";

		if (gameOver) {
			errorString = "Game Over: Please try again!";
			writeError(errorString);
		}
		else if (!userGuess) {
			errorString = "Please enter a number!";
			writeError(errorString);
		}
		else if (!isValidInput(userGuess)) {
			errorString = userGuess + " is not a valid number!";
			writeError(errorString);
		}
		else {
			var newNumber = true;
			userGuess = userGuess * 1; // convert to integer
			for (var i = 0; i < gameHistory.length; i++) {
				if (userGuess === gameHistory[i]) {
					newNumber = false;
					errorString = "You've already guessed " + userGuess + "!";
					writeError(errorString);
					break;
				}
			}
			if (newNumber) {
				var results = checkUserGuess(userGuess, gameHistory);
				addGuessHistory(results);

				if (results['status'] == 'win')  {
					gameOver = true;
					$gameInfo.find('span').text("Game Over: Please try again!");
				}
				else if (gameHistory.length === guessesAllowed) {
					gameOver = true;
					$gameInfo.find('span').text("Game Over: Please try again!");

					results['status'] = "lose";
					results['outputClass'] = "lose-guess";
				}

				updateGameStatus(results, true);
				stopColorAnimate($animateElem);
			}
		}

		guessInput.val("");
		return false; // prevent form submission from refreshing page
	});

});