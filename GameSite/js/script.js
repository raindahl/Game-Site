
 
  //Andrew Rainey
  //Dynamic Web Technologies assessment 2
   //B00223478



// inner variables
var canvas, ctx;

// images
var backgroundImage;
var oLaserImage;
var oExplosionImage;
var introImage;
var oEnemyImage;

var bulletSound; // bullet sound
var explosionSound; // explosion sound
var soundtrackSound; // soundtrack sound

var iBgShiftY = 8000; //10000 (level length) - 700 (canvas height)
var bPause = true; // game pause
var plane = null; // plane object
var lasers = []; // array of lasers
var enemies = []; // array of enemies
var explosions = []; // array of explosions
var planeW = 200; // plane width
var planeH = 110; // plane height
var iSprPos = 2; // initial sprite frame for plane
var iMoveDir = 0; // move direction
var iEnemyW = 128; // enemy width
var iEnemyH = 128; // enemy height
var ilaserSpeed = 10; // initial laser speed
var iEnemySpeed = 5; // initial enemy speed
var pressedKeys = []; // array of pressed keys
var iScore = 0; // total score
var iLife = 40; // total life of plane
var sLastScore; // Local Storage Variable
var iDamage = 10; // damage per enemy plane
var enTimer = null; // random timer for a new enemy
// -------------------------------------------------------------

// objects :


function Plane(x, y, w, h, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image = image;
    this.bDrag = false;
}
function laser(x, y, w, h, speed, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.image = image;
}
function Enemy(x, y, w, h, speed, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.image = image;
}
function Explosion(x, y, w, h, sprite, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.sprite = sprite;
    this.image = image;
}
// -------------------------------------------------------------
// get random number between X and Y
function getRand(x, y) {
    return Math.floor(Math.random()*y)+x;
}

// Display Intro function
function displayIntro() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(introImage, 0, 0,700, 700);
}

// Draw Main scene function
function drawScene() {

    if (! bPause) {
        iBgShiftY -= 2; // move main ground
        if (iBgShiftY < 5) { // Finish position
            bPause = true;

            // draw score and style it
            ctx.font = '80px Arial';
            ctx.fillStyle = '#FF0000';
            ctx.fillText('Finish, your score: ' + iScore * 10 + ' points', 50, 200);
            return;
        }

        // process pressed keys for movement of the plane
        processPressedKeys();

        // clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // draw background
        ctx.drawImage(backgroundImage, 0, 0 + iBgShiftY, 700, 700, 0, 0, 700, 700);

        // draw plane in line with the Spritesheet at each position with iSprPos
        ctx.drawImage(plane.image, iSprPos*plane.w, 0, plane.w, plane.h, plane.x - plane.w/2, plane.y - plane.h/2, plane.w, plane.h);

        // draw lasers  Size etc 
        if (lasers.length > 0) {
            for (var key in lasers) {
                if (lasers[key] != undefined) {
                    ctx.drawImage(lasers[key].image, lasers[key].x, lasers[key].y);
                    lasers[key].y -= lasers[key].speed;

                    // if a laser is out of screen - remove it
                    if (lasers[key].y < 0) {
                        delete lasers[key];
                    }
                }
            }
        }

        // draw explosions again with Spritesheets etc
        if (explosions.length > 0) {
            for (var key in explosions) {
                if (explosions[key] != undefined) {
                    // display explosion sprites
                    ctx.drawImage(explosions[key].image, explosions[key].sprite*explosions[key].w, 0, explosions[key].w, explosions[key].h, explosions[key].x - explosions[key].w/2, explosions[key].y - explosions[key].h/2, explosions[key].w, explosions[key].h);
                    explosions[key].sprite++;

                    // remove an explosion object when it expires
                    if (explosions[key].sprite > 10) {
                        delete explosions[key];
                    }
                }
            }
        }

        // This will draw the enemies 
        if (enemies.length > 0) {
            for (var ekey in enemies) {
                if (enemies[ekey] != undefined) {
                    ctx.drawImage(enemies[ekey].image, enemies[ekey].x, enemies[ekey].y);
                    enemies[ekey].y -= enemies[ekey].speed;

                    // remove an enemy object if it is out of screen
                    if (enemies[ekey].y > canvas.height) {
                        delete enemies[ekey];
                    }
                }
            }
        }

        if (enemies.length > 0) {
            for (var ekey in enemies) {
                if (enemies[ekey] != undefined) {

                    // This bit is for destroying enemies 
                    if (lasers.length > 0) {
                        for (var key in lasers) {
                            if (lasers[key] != undefined) {
                                if (lasers[key].y < enemies[ekey].y + enemies[ekey].h/2 && lasers[key].x > enemies[ekey].x && lasers[key].x + lasers[key].w < enemies[ekey].x + enemies[ekey].w) {
                                    explosions.push(new Explosion(enemies[ekey].x + enemies[ekey].w / 2, enemies[ekey].y + enemies[ekey].h / 2, 120, 120, 0, oExplosionImage));

                                    // this bit will delete the enemy and laser off the screen and add a point to the score
                                    delete enemies[ekey];
                                    delete lasers[key];
                                    iScore++;
									

									// play explode sound 
                                explosionSound.currentTime = 0;
                                explosionSound.play();
                                }
                            }
                        }
                    }

                    // Collision detection with the plane 
                    if (enemies[ekey] != undefined) {
                        if (plane.y - plane.h/2 < enemies[ekey].y + enemies[ekey].h/2 && plane.x - plane.w/2 < enemies[ekey].x + enemies[ekey].w && plane.x + plane.w/2 > enemies[ekey].x) {
                            explosions.push(new Explosion(enemies[ekey].x + enemies[ekey].w / 2, enemies[ekey].y + enemies[ekey].h / 2, 120, 120, 0, oExplosionImage));

                            // This bit will remove enemies and give damage
                            delete enemies[ekey];
                            iLife -= iDamage;
							explosionSound.currentTime = 0;
                                explosionSound.play();

                            if (iLife <= 0) { // If life reaches zero its game over
                                bPause = true;
								

                                // This prints out the score and game over
                                ctx.font = '20px Arial';
                                ctx.fillStyle = '#FF0000';
                                ctx.fillText('Game over, Press F5 to play again, your score: ' + iScore * 10 + ' points', 25, 150);
								
                                return;
                            
							}
                        }
                    }
                }
            }
        }

        // display life and score
		//Local Storage item of the score
									localStorage.setItem('last-Score', iScore);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText('Life: ' + iLife + ' / 40', 50, 660);
        ctx.fillText('Score: ' + iScore , 50, 680);
		if (sLastScore != null) {  // Will display the last score that user had 
		ctx.fillText('Last Points: ' + sLastScore,50 , 700);
}
    }
}

// This function is for moving the plane left and right
function processPressedKeys() {
    if (pressedKeys[37] != undefined) { // 37 is left arrow key
        if (iSprPos > 0) {  // shows the sprites to move
            iSprPos--;
            iMoveDir = -7;
        }
        if (plane.x - plane.w / 2 > 10) {
            plane.x += iMoveDir;
        }
    }
    else if (pressedKeys[39] != undefined) { // 39 is right arrow
        if (iSprPos < 4) {
            iSprPos++;
            iMoveDir = 7;
        }
        if (plane.x + plane.w / 2 < canvas.width - 10) {
            plane.x += iMoveDir;
        }
    }
}

// This will add enemies randomly 
function addEnemy() {
    clearInterval(enTimer);

    var randX = getRand(0, canvas.height - iEnemyH);
    enemies.push(new Enemy(randX, 0, iEnemyW, iEnemyH, - iEnemySpeed, oEnemyImage));

    var interval = getRand(1000, 4000);
    enTimer = setInterval(addEnemy, interval); // loop
}

// Initialision of Global and Jquery 
$(function(){
    canvas = document.getElementById('scene');  //Canvas scene
    ctx = canvas.getContext('2d');

    // load background image
    backgroundImage = new Image();
    backgroundImage.src = 'images/levelmap.jpg';
    backgroundImage.onload = function() {
    }
    backgroundImage.onerror = function() {
        console.log('Error loading the background image.');
    }

    introImage = new Image();
    introImage.src = 'images/intro.jpg';  // Intro page 

	// initialization of empty laser
    olaserImage = new Image();
    olaserImage.src = 'images/rocket.png';
    olaserImage.onload = function() { }

    // initialization of explosion image
    oExplosionImage = new Image();
    oExplosionImage.src = 'images/explosion.png';
    oExplosionImage.onload = function() { }

    // initialization of empty enemy
    oEnemyImage = new Image();
    oEnemyImage.src = 'images/enemy.png';
    oEnemyImage.onload = function() { }

    // initialization of plane
    var oPlaneImage = new Image();
    oPlaneImage.src = 'images/plane.png';
    oPlaneImage.onload = function() {
        plane = new Plane(canvas.width / 2, canvas.height - 100, planeW, planeH, oPlaneImage);
		// Explosion
	
// Local Storage for high Score 
	sLastScore = localStorage.getItem('last-Score');
	
    explosionSound = new Audio('media/explosion.mp3');  // audio for various
    explosionSound.volume = 0.9;
    bulletSound = new Audio('media/bullet.mp3');
    bulletSound.volume = 0.9;
	
	// 'soundtrack' music init
    soundtrackSound = new Audio('media/brmc.mp3');
    soundtrackSound.volume = 0.9;
    soundtrackSound.addEventListener('ended', function() { // loop soundtrack sound
        this.currentTime = 0;
        this.play();
    }, false);
    soundtrackSound.play();
	
    }

    $(window).keydown(function (evt){ // Keydown event handler 
        var pk = pressedKeys[evt.keyCode];
        if (! pk) {
            pressedKeys[evt.keyCode] = 1; // add all pressed keys into array
        }

        if (bPause && evt.keyCode == 13) { // Enter button to start game
            bPause = false;

            // start main animation
            setInterval(drawScene, 30); // loop drawScene

            // and add first enemy
            addEnemy();
        }
    });

    $(window).keyup(function (evt) { // onkeyup event handler function
        var pk = pressedKeys[evt.keyCode];
        if (pk) {
            delete pressedKeys[evt.keyCode]; // remove pressed key from array
        }
        if (evt.keyCode == 32) { // Space Bar to fire lasers 
            lasers.push(new laser(plane.x - 16, plane.y - plane.h, 32, 32, ilaserSpeed, olaserImage));
			bulletSound.currentTime = 0;
                                bulletSound.play();
        }
        if (evt.keyCode == 37 || evt.keyCode == 39) {
            // Move plane sprite to default position
            if (iSprPos > 2) {
                for (var i = iSprPos; i >= 2; i--) {
                    iSprPos = i;
                    iMoveDir = 0;
                }
            } else {
                for (var i = iSprPos; i <= 2; i++) {
                    iSprPos = i;
                    iMoveDir = 0;
                }
            }
        }
    });

    // To display intro when ready
    introImage.onload = function() {
        displayIntro(); // Display intro once
    }
});