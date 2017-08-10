'use strict';

var createjs = window.createjs;
var c = createjs;

var changeGamePhase = require('../game_lib/game_phases').changeGamePhase;
var VISIBLE_PHASE = {
	SCREENS: 0,
	INSTRUCTION: 1,
	GAME: 2 
};

var gameLib = require('../game_lib');
var games = require('../../data/games');

var localization = require('../../localization');
var gInstrText = localization.String.Games.Instruction.RPS;

var gameSession;
var currentUser;

var stage;
var queueInstr;
var queue;

var stageSizeX = 640,
	stageSizeY = 320;

//Инструкция
var blackLeft,
	messageLeft,
	animInterval,
	dot1,
	dot2,
	dot3,
	instrPrev,
	instrNext,
	instrPrevClr,
	instrNextClr,
	instrOk,
	instrOkClr;

var instrPage = 1;
var instrPagesNumber = 3;

var border,
	SPLIT_BORDER = 4;

var size = 2/3;

var container1,
	container2,
	instrContainer,
	screenContainer;

var background1,
	background2;

var graphicsRect,
	graphicsLine,
	graphicsBtn;

var ROCK = 1;
var PAPER = 3;
var SCISSORS = 2;

var gradLineLeft1,
	gradLineLeft2,
	gradLineRight1,
	gradLineRight2;

var gradRock1,
	gradRock2,
	gradPaper1,
	gradPaper2,
	gradScissors1,
	gradScissors2;

var titleRock1,
	titleRock2,
	titlePaper1,
	titlePaper2,
	titleScissors1,
	titleScissors2;

var rock1,
	rock2,
	paper1,
	paper2,
	scissors1,
	scissors2;

var rockInterval,
	paperInterval,
	scissorsInterval;

var bigHand1 = {};
var bigHand2 = {};

var winLoseTextLeft,
	winLoseTextRight;

var btn1 = {};
var btn2 = {};

var PLAYER_SIDE = {
	LEFT: 'left',
	RIGHT: 'right'
};

var clickAble = false;
// var okAble = true;

var STATE_GAME = 2;
var STATE_END = 3;

var phase_obj = {};

function init() {
	gameSession = games.getGame();
	currentUser = gameSession.user;

	stage = new c.Stage('game_canvas');
	stage.enableMouseOver(20);

	variableEqual();

	queueInstr = new c.LoadQueue(true);

	queueInstr.loadManifest([
		{ src: "/images/games/manual/instr_btn.png", id: "nxtBtn"},
		{ src: "/images/games/manual/instr_btn_clr.png", id: "nxtBtnClr"},
		{ src: "/images/games/manual/ok_btn.png", id: "okBtn"},
		{ src: "/images/games/manual/ok_btn_clr.png", id: "okBtnClr"},
		], true);

	queueInstr.on("complete", preload);
}

function close() {
	c.Tween.removeAllTweens();
	if (typeof queue === 'object') {
		queue.close();
	}
	if (typeof queueInstr === 'object') {
		queueInstr.close();
	}
}

function preload() {
	if (currentUser.isPlayer()) {
		blackLeft = new c.Shape();
		blackLeft.graphics.beginLinearGradientFill(["rgba(0,0,0,1)","rgba(0,0,0,0)"], [0, 1], 0, 40, 0, 100)
			.drawRect(0, 0, stageSizeX, stageSizeY);

		messageLeft = new c.Text(" ", "25px 'Helvetica Neue'");
		messageLeft.set({ textAlign: "center", color: "#FFFFFF", x: 0, textBaseline: "middle", y: 0 });
		messageLeft.x = stageSizeX / 2;
		messageLeft.y = 15;
		messageLeft.alpha = 1;
		messageLeft.lineWidth = stageSizeX - 30;

		instrPrev = new c.Bitmap(queueInstr.getResult("nxtBtn"));
		instrPrev.regX = 38;
		instrPrev.regY = 38;
		instrPrev.x = 50;
		instrPrev.y = stageSizeY / 2;
		instrPrev.shadow = new c.Shadow("#000000", 0, 0, 10);

		instrPrevClr = new c.Bitmap(queueInstr.getResult("nxtBtnClr"));
		instrPrevClr.regX = 38;
		instrPrevClr.regY = 38;
		instrPrevClr.x = 50;
		instrPrevClr.y = stageSizeY / 2;
		instrPrevClr.alpha = 0;

		instrNext = new c.Bitmap(queueInstr.getResult("nxtBtn"));
		instrNext.regX = 38;
		instrNext.regY = 38;
		instrNext.x = stageSizeX - 50;
		instrNext.y = stageSizeY / 2 - 1;
		instrNext.rotation = 180;
		instrNext.shadow = new c.Shadow("#000000", 0, 0, 10);

		instrNextClr = new c.Bitmap(queueInstr.getResult("nxtBtnClr"));
		instrNextClr.regX = 38;
		instrNextClr.regY = 38;
		instrNextClr.x = stageSizeX - 50;
		instrNextClr.y = stageSizeY / 2 - 1;
		instrNextClr.rotation = 180;
		instrNextClr.alpha = 0;

		instrOk = new c.Bitmap(queueInstr.getResult("okBtn"));
		instrOk.regX = 38;
		instrOk.regY = 38;
		instrOk.x = stageSizeX - 50;
		instrOk.y = stageSizeY / 2;
		instrOk.alpha = 0;
		instrOk.shadow = new c.Shadow("#000000", 0, 0, 10);

		instrOkClr = new c.Bitmap(queueInstr.getResult("okBtnClr"));
		instrOkClr.regX = 38;
		instrOkClr.regY = 38;
		instrOkClr.x = stageSizeX - 50;
		instrOkClr.y = stageSizeY / 2;
		instrOkClr.alpha = 0;

		instrNextClr.on('mouseover', function(event) {
			c.Tween.get(instrNextClr, {override: true})
				.to({alpha: 1}, 400);
		});

		instrNextClr.on('mouseout', function(event) {
			c.Tween.get(instrNextClr, {override: true})
				.to({alpha: 0.1}, 400);
		});

		instrPrevClr.on('mouseover', function(event) {
			if (instrPage === 1){
				return;
			}

			c.Tween.get(instrPrevClr, {override: true})
				.to({alpha: 1}, 400);
		});

		instrPrevClr.on('mouseout', function(event) {
			c.Tween.get(instrPrevClr, {override: true})
				.to({alpha: 0.1}, 400);
		});

		instrOkClr.on('mouseover', function(event) {
			c.Tween.get(instrOkClr, {override: true})
				.to({alpha: 1}, 400);
		});

		instrOkClr.on('mouseout', function(event) {
			c.Tween.get(instrOkClr, {override: true})
				.to({alpha: 0.1}, 400);
		});

		instrPrevClr.addEventListener("click", function(event) {
			if (event.nativeEvent.button !== 0) return;
			prevClicked();
		});
		instrNextClr.addEventListener("click", function(event) {
			if (event.nativeEvent.button !== 0) return;
			nextClicked();
		});
		instrOkClr.addEventListener("click", function(event) {
			if (event.nativeEvent.button !== 0) return;
			nextClicked();
		});

		//Создание точек для инструкции
		dot1 = new c.Shape();
		dot1.graphics.beginFill("#fffff0").drawCircle(0, 0, 4);
		dot2 = new c.Shape();
		dot2.graphics.beginFill("#fffff0").drawCircle(0, 0, 4);
		dot3 = new c.Shape();
		dot3.graphics.beginFill("#fffff0").drawCircle(0, 0, 4);
		dot1.y = dot2.y = dot3.y = stageSizeY - 15;
		dot1.x = stageSizeX / 2 - 20;
		dot2.x = stageSizeX / 2;
		dot3.x = stageSizeX / 2 + 20;
		dot1.alpha = 1;
		dot2.alpha = 0.4;
		dot3.alpha = 0.4;
	}

	queue = new c.LoadQueue(false);
	queue.on('complete', gameCreating);
	queue.loadManifest([
		{ src: '/images/games/rock-paper-scissors/background.png', id: 'background' },
		{ src: '/images/games/rock-paper-scissors/rock.png', id: 'rock' },
		{ src: '/images/games/rock-paper-scissors/rock_big.png', id: 'rockBig' },
		{ src: '/images/games/rock-paper-scissors/paper.png', id: 'paper' },
		{ src: '/images/games/rock-paper-scissors/paper_big.png', id: 'paperBig' },
		{ src: '/images/games/rock-paper-scissors/scissors.png', id: 'scissors' },
		{ src: '/images/games/rock-paper-scissors/scissors_big.png', id: 'scissorsBig' }
		], true);
}


function goToGame(){
	clearTimeout(rockInterval);
	clearTimeout(paperInterval);
	clearTimeout(scissorsInterval);

	changeGamePhase(VISIBLE_PHASE.GAME, phase_obj);
}


function gameStart(){

	if (currentUser.isPlayer()) {

		clearInterval(animInterval);
		clearInterval(swapInterval);

		c.Tween.get(instrContainer, { override: true })
				.to({ alpha: 0 });
	}
}

function animProc() {
	changeGamePhase(VISIBLE_PHASE.INSTRUCTION, phase_obj);

	instrNextClr.alpha = 0.1;
	instrPrevClr.alpha = 0.1;
	swapInterval();
	animInterval = setInterval(swapInterval, 5000);
}

function okClicked(event) {
	if (event.nativeEvent.button !== 0) return;
	if (!stage.okAble) return;

	stage.okAble = false;
	gameStart();
	gameLib.youAreReady();
	gameSession.sendEvent({ type: 1001 });
}

function prevClicked() {
	if (instrPage > 1){
		instrPage--;

		clearInterval(animInterval);
		swapInterval();
		animInterval = setInterval(swapInterval, 5000);
	}
}

function skipInstruction() {
	instrPage = instrPagesNumber;
	nextClicked();
}

function nextClicked() {
	if (instrPage < 3){
		instrPage++;

		clearInterval(animInterval);
		swapInterval();
		animInterval = setInterval(swapInterval, 5000);
	} else {
		instrPrevClr.removeAllEventListeners();
		instrNextClr.removeAllEventListeners();
		instrOkClr.removeAllEventListeners();

		instrPrevClr.cursor = "arrow";
		instrNextClr.cursor = "arrow";
		instrOkClr.cursor = "arrow";

		stage._okBtnLeft._listeners.click[0] = okClicked;
		clearInterval(animInterval);

		changeGamePhase(VISIBLE_PHASE.SCREENS, phase_obj);
		gameLib.drawPreparing();
	}
}

function swapInterval(){
	
	clearTimeout(rockInterval);
	clearTimeout(paperInterval);
	clearTimeout(scissorsInterval);

	if (clickAble === false){
		switch (instrPage){
			case(1): {
				instrPrevClr.cursor = "arrow";
				instrNextClr.cursor = "pointer";
				instrAnim1();
				c.Tween.get(dot1, { override: true })
					.to({ alpha: 1, scaleX: 1.6, scaleY: 1.6 }, 200);
				c.Tween.get(dot2, { override: true })
					.to({ alpha: 0.4, scaleX: 1, scaleY: 1 }, 200);
				c.Tween.get(dot3, { override: true })
					.to({ alpha: 0.4, scaleX: 1, scaleY: 1 }, 200);

				break;
			}
			case(2): {
				instrPrevClr.cursor = "pointer";
				instrNextClr.cursor = "pointer";
				instrAnim2();
				c.Tween.get(dot1, { override: true })
					.to({ alpha: 0.4, scaleX: 1, scaleY: 1 }, 200);
				c.Tween.get(dot2, { override: true })
					.to({ alpha: 1, scaleX: 1.6, scaleY: 1.6 }, 200);
				c.Tween.get(dot3, { override: true })
					.to({ alpha: 0.4, scaleX: 1, scaleY: 1 }, 200);

				instrNextClr.alpha = 0.1;
				instrNext.alpha = 1;
				instrOkClr.alpha = 0;
				instrOk.alpha = 0;

				break;
			}
			case(3): {

				instrOkClr.cursor = "pointer";

				instrAnim3();
				c.Tween.get(dot1, { override: true })
					.to({ alpha: 0.4, scaleX: 1, scaleY: 1 }, 200);
				c.Tween.get(dot2, { override: true })
					.to({ alpha: 0.4, scaleX: 1, scaleY: 1 }, 200);
				c.Tween.get(dot3, { override: true })
					.to({ alpha: 1, scaleX: 1.6, scaleY: 1.6 }, 200);

				instrOkClr.alpha = 1;
				instrOk.alpha = 1;
				instrNextClr.alpha = 0;
				instrNext.alpha = 0;

				break;
			}
		}  
	}
}

function instrAnim1() {
	c.Tween.get(blackLeft, {override:true})
		.to({alpha: 0.7});
	c.Tween.get(messageLeft, {override:true})
		.to({alpha: 0}, 300)
		.to({text: gInstrText.PAGE_1})
		.to({alpha: 1}, 300);

	rockInterval = setTimeout(instrAnim1Rock, 500);
	paperInterval = setTimeout(instrAnim1Paper, 1500);
	scissorsInterval = setTimeout(instrAnim1Scissors, 2500);
}
function instrAnim1Rock() {
	rock1.startSwing();
	titleRock1.growUp();
	gradRock1.appear();

	setTimeout(function() {
		rock1.stopSwing();
		titleRock1.reset();
		gradRock1.reset();
	}, 1000);
}
function instrAnim1Paper() {
	paper1.startSwing();
	titlePaper1.growUp();
	gradPaper1.appear();

	setTimeout(function() {
		paper1.stopSwing();
		titlePaper1.reset();
		gradPaper1.reset();
	}, 1000);
}
function instrAnim1Scissors() {
	scissors1.startSwing();
	titleScissors1.growUp();
	gradScissors1.appear();

	setTimeout(function() {
		scissors1.stopSwing();
		titleScissors1.reset();
		gradScissors1.reset();
	}, 1000);
}

function instrAnim2() {
	c.Tween.get(messageLeft, {override:true})
		.to({alpha: 0}, 300)
		.to({text: gInstrText.PAGE_2})
		.to({alpha: 1}, 300);


	rockInterval = setTimeout(instrAnim2Rock, 500);
	paperInterval = setTimeout(instrAnim2Paper, 1500);
	scissorsInterval = setTimeout(instrAnim2Scissors, 2500);
}
function instrAnim2Rock() {
	bigHand1[ROCK].appear();
	setTimeout(function() { bigHand1[ROCK].reset(); }, 1000);
}
function instrAnim2Paper() {
	bigHand1[PAPER].appear();
	setTimeout(function() { bigHand1[PAPER].reset(); }, 1000);
}
function instrAnim2Scissors() {
	bigHand1[SCISSORS].appear();
	setTimeout(function() { bigHand1[SCISSORS].reset(); }, 1000);
}

function instrAnim3() {
	c.Tween.get(messageLeft, {override:true})
		.to({alpha: 0}, 300)
		.to({text: gInstrText.PAGE_3})
		.to({alpha: 1}, 300);
}


function BigHand(image, side) {
	createjs.Bitmap.call(this, image);
	this.regY = this.image.height / 2;
	this.y = stageSizeY / 2 / size;
	if ( side === PLAYER_SIDE.LEFT ) {
		this.x = (stageSizeX - 300)  / size ;
	} else {
		this.x = 300 / size;
		this.scaleX = -1;
	}

	this.side = side;
	this.shakeAnim = null;
	// this.isSwing = false;
}

BigHand.prototype = Object.create(createjs.Bitmap.prototype);
BigHand.prototype.constructor = BigHand;
BigHand.prototype.shake = function() {
	this.shakeAnim = c.Tween.get(this);
	if (this.side === PLAYER_SIDE.LEFT) {
		this.shakeAnim
		.to({ y: stageSizeY / 2 / size - 20, rotation: -20 }, 500)
		.to({y: stageSizeY / 2 / size, rotation: 0 }, 200)
		.to({ y: stageSizeY / 2 / size - 20, rotation: -10 }, 300)
		.to({y: stageSizeY / 2 / size , rotation: 0 }, 200);
	} else {
		this.shakeAnim
		.to({ y: stageSizeY / 2 / size - 20, rotation: 20 }, 500)
		.to({ y: stageSizeY / 2 / size, rotation: 0 }, 200)
		.to({ y: stageSizeY / 2 / size - 20, rotation: 10 }, 300)
		.to({ y: stageSizeY / 2 / size, rotation: 0 }, 200);
	}
};
BigHand.prototype.appear = function() {
	createjs.Tween.get(this, {override: true})
		.to({ alpha: 1}, 200);
};
BigHand.prototype.reset = function() {
	createjs.Tween.get(this, {override: true})
		.to({ alpha: 0}, 200);
};

function Hand(image, side, posY) {
	createjs.Bitmap.call(this, image);
	this.regY = this.image.height / 2;
	this.y = ((stageSizeY / 3) * posY - (stageSizeY / 3 / 2)) / size;
	if ( side === PLAYER_SIDE.LEFT ) {
		this.x = (posY * 30 - 20)  / size;
	} else {
		this.x = (stageSizeX - posY * 30 + 20) / size;
		this.scaleX = -1;
	}

	this.side = side;
	this.swingInterval;
}

Hand.prototype = Object.create(createjs.Bitmap.prototype);
Hand.prototype.constructor = Hand;
Hand.prototype.startSwing = function() {
	this.swingAnim();
	this.swingInterval = setInterval(this.swingAnim.bind(this), 400);
};
Hand.prototype.swingAnim = function() {
	if (this.side === PLAYER_SIDE.LEFT) {
		c.Tween.get(this, {override: true})
			.to({ rotation: 3 }, 100)
			.to({ rotation: -3}, 200)
			.to({ rotation: 0}, 100);
	} else {
		c.Tween.get(this, {override: true})
			.to({ rotation: -3 }, 100)
			.to({ rotation: 3}, 200)
			.to({ rotation: 0}, 100);
	}
};
Hand.prototype.stopSwing = function() {
	clearInterval(this.swingInterval);
};

function GradientRect(side, posY) {
	createjs.Shape.call(this, graphicsRect);
	this.y = ((stageSizeY / 3) * posY - (stageSizeY / 3)) / size;
	if ( side === PLAYER_SIDE.LEFT ) {
		this.x = - 100;
	} else {
		this.x = (stageSizeX + 100) / size;
		this.scaleX = -1;
	}
}
GradientRect.prototype = Object.create(createjs.Shape.prototype);
GradientRect.prototype.constructor = GradientRect;
GradientRect.prototype.appear = function() {
	c.Tween.get(this, {override: true})
		.to({ x: 0}, 200);
};
GradientRect.prototype.reset = function() {
	c.Tween.get(this, {override: true})
		.to({ x: -100}, 200);
};

function GradientLine(side, posY) {
	createjs.Shape.call(this, graphicsLine);
	this.y = ((stageSizeY / 3) * posY - 2) / size;
	if ( side === PLAYER_SIDE.LEFT ) {
		this.x = 0;
	} else {
		this.x = stageSizeX / size;
		this.scaleX = -1;
	}
}
GradientLine.prototype = Object.create(createjs.Shape.prototype);
GradientLine.prototype.constructor = GradientLine;

function HandButton(side, posY) {
	createjs.Shape.call(this, graphicsBtn);
	this.skewX = -8;
	this.alpha = 0.01;

	if ( side === PLAYER_SIDE.LEFT ) {
		switch (posY) {
			case 1:
			this.x = -46 / size;
			break;
			case 2:
			this.x = -31 / size;
			break;
			case 3:
			this.x = -16 / size;
			break;
		}
	} else {
		this.scaleX = -1;
		switch (posY) {
			case 1:
			this.x = (stageSizeX) / size;
			break;
			case 2:
			this.x = (stageSizeX + 16) / size;
			break;
			case 3:
			this.x = (stageSizeX + 31) / size;
			break;
		}
	}

	
	this.y = ((stageSizeY / 3) * posY - (stageSizeY / 3)) / size;
}
HandButton.prototype = Object.create(createjs.Shape.prototype);
HandButton.prototype.constructor = HandButton;
HandButton.prototype.reset = function() {
	c.Tween.get(this, {override: true})
		.to({ alpha: 0.01}, 200);
};

function Title(side, posY) {
	createjs.Text.call(this);

	switch (posY) {
		case 1:
		this.x = (side === PLAYER_SIDE.LEFT) ? ( 110 / size ) : ( (stageSizeX - 110) / size );
		this.y = 30 / size;
		this.text = 'rock';
		break;
		case 2:
		this.x = (side === PLAYER_SIDE.LEFT) ? ( 160 / size ) : ( (stageSizeX - 150) / size );
		this.y = ((stageSizeY/3) + 30) / size;
		this.text = 'paper';
		break;
		case 3:
		this.x = (side === PLAYER_SIDE.LEFT) ? ( 210 / size ) : ( (stageSizeX - 190) / size );
		this.y = (2 * (stageSizeY/3) + 30) / size;
		this.text = 'scissors';
		break;
	}
	this.font = '60px Arial';
	this.color = '#FFFFFF';
	// this.shadow = new c.Shadow('#000000', 0, 0, 5);

	if ( side === PLAYER_SIDE.RIGHT ) {
		this.regX = this.getMeasuredWidth();
	}
}
Title.prototype = Object.create(createjs.Text.prototype);
Title.prototype.constructor = Title;
Title.prototype.growUp = function() {
	c.Tween.get(this, {override: true})
		.to({ scaleX: 1.02, scaleY: 1.02}, 200);
};
Title.prototype.reset = function() {
	c.Tween.get(this, {override: true})
		.to({ scaleX: 1, scaleY: 1}, 200);
};

function gameCreating() {
	//Контейнеры, которые содержат все игровые картинки(для их невидимости)
	container1 = new c.Container();
	container1.x = 0;
	container1.alpha = 1;
	container1.scaleX = size;
	container1.scaleY = size;

	container2 = new c.Container();
	container2.x = stageSizeX + SPLIT_BORDER;
	container2.alpha = 1;
	container2.scaleX = size;
	container2.scaleY = size;

	border = new c.Shape();
	border.graphics.beginFill('#FFFFFF').drawRect(stageSizeX, 0, SPLIT_BORDER, stageSizeY);
	border.alpha = 0;
	stage.addChild(border);

	background1 = new c.Bitmap(queue.getResult('background'));
	background2 = new c.Bitmap(queue.getResult('background'));
	background2.x = stageSizeX / size;
	background2.y = stageSizeY / size;
	background2.scaleX = -1;
	background2.scaleY = -1;

	graphicsRect = new createjs.Graphics()
		.beginLinearGradientFill(['rgba(0, 234, 226, 1)', 'rgba(0, 204, 146, 0)'],
			[0, 0.6], 0, stageSizeY/2/size, stageSizeX/size, stageSizeY/2/size)
		.drawRect(0, 0, stageSizeX/size, stageSizeY/3/size);

	graphicsLine = new createjs.Graphics()
		.beginLinearGradientFill(['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'],
			[0, 0.6], 0, stageSizeY/2/size, stageSizeX/size, stageSizeY/2/size)
		.drawRect(0, 0, stageSizeX/size, 4);

	graphicsBtn = new createjs.Graphics()
		.beginFill('rgb(0,0,0)').drawRect(0, 0, 590, stageSizeY/3/size);


	titleRock1 = new Title(PLAYER_SIDE.LEFT, 1);
	titleRock2 = new Title(PLAYER_SIDE.RIGHT, 1);
	titlePaper1 = new Title(PLAYER_SIDE.LEFT, 2);
	titlePaper2 = new Title(PLAYER_SIDE.RIGHT, 2);
	titleScissors1 = new Title(PLAYER_SIDE.LEFT, 3);
	titleScissors2 = new Title(PLAYER_SIDE.RIGHT, 3);

	gradLineLeft1 = new GradientLine(PLAYER_SIDE.LEFT, 1);
	gradLineLeft2 = new GradientLine(PLAYER_SIDE.LEFT, 2);
	gradLineRight1 = new GradientLine(PLAYER_SIDE.RIGHT, 1);
	gradLineRight2 = new GradientLine(PLAYER_SIDE.RIGHT, 2);

	gradRock1 = new GradientRect(PLAYER_SIDE.LEFT, 1);
	gradRock2 = new GradientRect(PLAYER_SIDE.RIGHT, 1);
	gradPaper1 = new GradientRect(PLAYER_SIDE.LEFT, 2);
	gradPaper2 = new GradientRect(PLAYER_SIDE.RIGHT, 2);
	gradScissors1 = new GradientRect(PLAYER_SIDE.LEFT, 3);
	gradScissors2 = new GradientRect(PLAYER_SIDE.RIGHT, 3);

	rock1 = new Hand(queue.getResult('rock'), PLAYER_SIDE.LEFT, 1);
	rock2 = new Hand(queue.getResult('rock'), PLAYER_SIDE.RIGHT, 1);
	paper1 = new Hand(queue.getResult('paper'), PLAYER_SIDE.LEFT, 2);
	paper2 = new Hand(queue.getResult('paper'), PLAYER_SIDE.RIGHT, 2);
	scissors1 = new Hand(queue.getResult('scissors'), PLAYER_SIDE.LEFT, 3);
	scissors2 = new Hand(queue.getResult('scissors'), PLAYER_SIDE.RIGHT, 3);

	bigHand1[ROCK] = new BigHand(queue.getResult('rockBig'), PLAYER_SIDE.LEFT);
	bigHand2[ROCK] = new BigHand(queue.getResult('rockBig'), PLAYER_SIDE.RIGHT);
	bigHand1[PAPER] = new BigHand(queue.getResult('paperBig'), PLAYER_SIDE.LEFT);
	bigHand2[PAPER] = new BigHand(queue.getResult('paperBig'), PLAYER_SIDE.RIGHT);
	bigHand1[SCISSORS] = new BigHand(queue.getResult('scissorsBig'), PLAYER_SIDE.LEFT);
	bigHand2[SCISSORS] = new BigHand(queue.getResult('scissorsBig'), PLAYER_SIDE.RIGHT);
	bigHand1[ROCK].alpha = 0;
	bigHand2[ROCK].alpha = 0;
	bigHand1[PAPER].alpha = 0;
	bigHand2[PAPER].alpha = 0;
	bigHand1[SCISSORS].alpha = 0;
	bigHand2[SCISSORS].alpha = 0;

	rock1 = new Hand(queue.getResult('rock'), PLAYER_SIDE.LEFT, 1);
	rock2 = new Hand(queue.getResult('rock'), PLAYER_SIDE.RIGHT, 1);
	paper1 = new Hand(queue.getResult('paper'), PLAYER_SIDE.LEFT, 2);
	paper2 = new Hand(queue.getResult('paper'), PLAYER_SIDE.RIGHT, 2);
	scissors1 = new Hand(queue.getResult('scissors'), PLAYER_SIDE.LEFT, 3);
	scissors2 = new Hand(queue.getResult('scissors'), PLAYER_SIDE.RIGHT, 3);

	btn1[ROCK] = new HandButton(PLAYER_SIDE.LEFT, 1);
	btn2[ROCK] = new HandButton(PLAYER_SIDE.RIGHT, 1);
	btn1[PAPER] = new HandButton(PLAYER_SIDE.LEFT, 2);
	btn2[PAPER] = new HandButton(PLAYER_SIDE.RIGHT, 2);
	btn1[SCISSORS] = new HandButton(PLAYER_SIDE.LEFT, 3);
	btn2[SCISSORS] = new HandButton(PLAYER_SIDE.RIGHT, 3);

	winLoseTextLeft = new c.Text('lose', '80px Arial', '#FFFFFF');
	winLoseTextLeft.x = (stageSizeX - 30) / size;
	winLoseTextLeft.y = 30 / size;
	winLoseTextLeft.shadow = new c.Shadow('#000000', 0, 0, 5);
	winLoseTextLeft.alpha = 0;

	winLoseTextRight = new c.Text('win', '80px Arial', '#FFFFFF');
	winLoseTextRight.x = 30 / size;
	winLoseTextRight.y = 30 / size;
	winLoseTextRight.shadow = new c.Shadow('#000000', 0, 0, 5);
	winLoseTextRight.alpha = 0;

	container1.addChild(background1,
		gradRock1, gradPaper1, gradScissors1,
		gradLineLeft1, gradLineLeft2,
		rock1, paper1, scissors1,
		titleRock1, titlePaper1, titleScissors1,
		btn1[ROCK], btn1[PAPER], btn1[SCISSORS],
		bigHand1[ROCK], bigHand1[PAPER], bigHand1[SCISSORS],
		winLoseTextLeft);

	container2.addChild(background2,
		gradRock2, gradPaper2, gradScissors2,
		gradLineRight1, gradLineRight2,
		rock2, paper2, scissors2,
		titleRock2, titlePaper2, titleScissors2,
		btn2[ROCK], btn2[PAPER], btn2[SCISSORS],
		bigHand2[ROCK], bigHand2[PAPER], bigHand2[SCISSORS],
		winLoseTextRight);

	stage.addChild(container1);
	stage.addChild(container2);

	instrContainer = new c.Container();

	instrContainer.addChild(blackLeft, messageLeft, instrPrev,
		instrPrevClr, instrNext, instrNextClr, instrOk,
		instrOkClr, dot1, dot2, dot3);

	stage.addChild(instrContainer);

	border = new c.Shape();
	border.graphics.beginFill("#FFFFFF").drawRect(stageSizeX, 0, SPLIT_BORDER, stageSizeY);
	border.alpha = 0;
	stage.addChild(border);

	screenContainer = new c.Container();
	stage.addChild(screenContainer);

	instrContainer.alpha = 0;
	container1.alpha = 0;
	container2.alpha = 0;
	screenContainer.alpha = 1;

	phase_obj.container1 = container1;
	phase_obj.container2 = container2;
	phase_obj.instrContainer = instrContainer;
	phase_obj.border = border;
	phase_obj.screenContainer = screenContainer;

	gameLib.createScreen(stage, screenContainer, currentUser);
	// gameLib.drawReadyScreen(stage, currentUser, okAble, skipInstruction);

	c.Ticker.setFPS(60);
	c.Ticker.addEventListener('tick', tick);

	lifecycle.initCompleted();
}

var btnClick = function(big, btnLeft1, btnLeft2) {
	gameSession.sendEvent({type: 1003, move: big});

	disableButtons();
	c.Tween.get(btn1[btnLeft1], {override: true})
		.to({ alpha: 0.3 }, 400, c.Ease.cubicInOut);
	c.Tween.get(btn1[btnLeft2], {override: true})
		.to({ alpha: 0.3 }, 400, c.Ease.cubicInOut);
};

var btnOver = function(swingItem, grad, title) {
	swingItem.startSwing();
	grad.appear();
	title.growUp();
};

var btnOut = function(swingItem, grad, title) {
	swingItem.stopSwing();
	grad.reset();
	title.reset();
};

var clicks = {};
clicks.ROCK = function() { btnClick(ROCK, PAPER, SCISSORS); };
clicks.PAPER = function() { btnClick(PAPER, ROCK, SCISSORS); };
clicks.SCISSORS = function() { btnClick(SCISSORS, ROCK, PAPER); };

var mouseovers = {};
mouseovers.ROCK = function() { btnOver(rock1, gradRock1, titleRock1); };
mouseovers.PAPER = function() { btnOver(paper1, gradPaper1, titlePaper1); };
mouseovers.SCISSORS = function() { btnOver(scissors1, gradScissors1, titleScissors1); };

var mouseouts = {};
mouseouts.ROCK = function() { btnOut(rock1, gradRock1, titleRock1); };
mouseouts.PAPER = function() { btnOut(paper1, gradPaper1, titlePaper1); };
mouseouts.SCISSORS = function() { btnOut(scissors1, gradScissors1, titleScissors1); };

function clickBtnHandler(event, clickFunction, clickEvent) {
	if (clickEvent.nativeEvent.button !== 0) return;
	clickFunction();
}

function enableButtons() {
	btn1[ROCK].addEventListener('click', clickBtnHandler.bind(null, event, clicks.ROCK));
	btn1[PAPER].addEventListener('click', clickBtnHandler.bind(null, event, clicks.PAPER));
	btn1[SCISSORS].addEventListener('click', clickBtnHandler.bind(null, event, clicks.SCISSORS));
	
	btn1[ROCK].addEventListener('mouseover', mouseovers.ROCK);
	btn1[PAPER].addEventListener('mouseover', mouseovers.PAPER);
	btn1[SCISSORS].addEventListener('mouseover', mouseovers.SCISSORS);

	btn1[ROCK].addEventListener('mouseout', mouseouts.ROCK);
	btn1[PAPER].addEventListener('mouseout', mouseouts.PAPER);
	btn1[SCISSORS].addEventListener('mouseout', mouseouts.SCISSORS);
}

function disableButtons() {
	btn1[ROCK].removeAllEventListeners();
	btn1[PAPER].removeAllEventListeners();
	btn1[SCISSORS].removeAllEventListeners();
}

var animationInterval;

function animateResults(moves) {
	rockFadeIn(moves);
}

function rockFadeIn(moves) {
	bigHand1[ROCK].appear();
	bigHand1[PAPER].reset();
	bigHand1[SCISSORS].reset();

	bigHand2[ROCK].appear();
	bigHand2[PAPER].reset();
	bigHand2[SCISSORS].reset();

	setTimeout( function() { shakeRock(moves); }, 300);
}

function shakeRock(moves) {

	bigHand1[ROCK].shake();
	bigHand2[ROCK].shake();

	animationInterval = setInterval(function() {

		for (var i = 1; i <= 3; i++) {
			if (currentUser.isSpectator()) {
				if ( i !== moves[index.left] ){
					c.Tween.get(btn1[i], {override: true})
						.wait(300)
						.to({ alpha: 0.3 }, 200, c.Ease.cubicInOut);
				}
			}
			if ( i !== moves[index.right] ){
				c.Tween.get(btn2[i], {override: true})
					.wait(300)
					.to({ alpha: 0.3 }, 200, c.Ease.cubicInOut);
			}
		}
		
		if (moves[index.left] === ROCK) {
			c.Tween.get(bigHand1[moves[index.left]], {override: true})
				.to({ y: stageSizeY / 2 / size - 20, rotation: -10 }, 300)
				.to({ y: stageSizeY / 2 / size, rotation: 0 }, 200);
		} else {
			c.Tween.get(bigHand1[ROCK], {override: true})
				.to({ y: stageSizeY / 2 / size - 20, rotation: -10 }, 300)
				.to({ y: stageSizeY / 2 / size, rotation: 0, alpha: 0 }, 200);
			c.Tween.get(bigHand1[moves[index.left]], {override: true})
				.to({ y: stageSizeY / 2 / size - 20, rotation: -10 }, 300)
				.to({ y: stageSizeY / 2 / size, rotation: 0, alpha: 1 }, 200);
		}

		if (moves[index.right] === ROCK) {
			c.Tween.get(bigHand2[moves[index.right]], {override: true})
				.to({ y: stageSizeY / 2 / size - 20, rotation: 10 }, 300)
				.to({ y: stageSizeY / 2 / size, rotation: 0 }, 200)
				.call( function() { clearInterval(animationInterval); }  )
				.wait(3000)
				.call( function() { reset(); });
		} else {
			c.Tween.get(bigHand2[ROCK], {override: true})
				.to({ y: stageSizeY / 2 / size - 20, rotation: 10 }, 300)
				.to({ y: stageSizeY / 2 / size, rotation: 0, alpha: 0 }, 200);
			c.Tween.get(bigHand2[moves[index.right]], {override: true})
				.to({ y: stageSizeY / 2 / size - 20, rotation: 10 }, 300)
				.to({ y: stageSizeY / 2 / size, rotation: 0, alpha: 1 }, 200)
				.call( function() { clearInterval(animationInterval); } )
				.wait(3000)
				.call( function() { reset(); });
		}
	}, 1200);
}

var label = {
	left: 'p1',
	right: 'p2'
};

var index = {
	left: 0,
	right: 1
};

var idPl = {        // для спектаторов
	left: 1,
	right: 2
};

var winsToWin = 3;

var winStreak = {   // Число побед
	left: 0,
	right: 0
};

var readyPlayer = {
	left: false,
	right: false
};

var EVENT_TYPE_GAME_STATE = 1000;
var EVENT_READY = 1001;
var EVENT_ROUND_START = 1002;
var EVENT_MOVE = 1003;
var EVENT_ROUND_RESULT = 1005;

function recvData(event) {
	switch (event.type) {
		//--------------------------------------------------П А К Е Т  1 0 0 0------------------------------------------
		case (EVENT_TYPE_GAME_STATE): {
			//Присвоение индексов
			if (currentUser.isSpectator()) {
				// Присвоение id для проверок дальнейших
				idPl.left = event.data.players_data[0].id;
				idPl.right = event.data.players_data[1].id;
				// я зритель, ниче не делаем, все по дефолту: p1 слева, p2 справа
			} else if (currentUser.id === event.data.players_data[0].id) {
				// ура, я плаер1, ничего не делаем, все по дефолту: p1 слева, p2 справа

			} else {
				// черт, я плаер2, меняем значения

				var temp = label.left;
				label.left = label.right;
				label.right = temp;
				temp = index.left;
				index.left = index.right;
				index.right = temp;
			}

			// Извлечение инфы из пакета
			readyPlayer.left = event.data.players_data[index.left].ready;
			readyPlayer.right = event.data.players_data[index.right].ready;

			gameLib.drawReadyScreen(currentUser, skipInstruction);

			//Текст поменять
				if(event.data.round !== 0){
					gameLib.drawText(currentUser);
					if (currentUser.isPlayer()) {
						gameStart();
						stage._okBtnLeft._listeners.click[0] = okClicked;
					}
				}
			
			if (readyPlayer.left === true) {
				gameStart();
				stage.okAble = false;
				if (currentUser.isPlayer()) {
					stage._okBtnLeft._listeners.click[0] = okClicked;
					gameLib.youAreReady();
				}
				gameLib.leftPlayerReady(currentUser);
			}
			if (readyPlayer.right === true) {
				gameLib.rightPlayerReady(currentUser);
			}

			winsToWin = event.data.wins_count;
			winStreak.left = event.data.players_data[index.left].wins;
			winStreak.right = event.data.players_data[index.right].wins;
			//Сердечки
			var x = event.data.players_data[index.left].wins;
			var y = event.data.players_data[index.right].wins;

			gameSession.initWins(
				event.data.players_data[index.left].wins,
				event.data.players_data[index.right].wins
			);

			if (event.data.round !== 0 && currentUser.isPlayer()) {
				gameLib.disableSkip();
			}

			//Если ты подключился на 2 стадии игры
			if (event.data.state === STATE_GAME) {
				goToGame();
				gameLib.clearStage();
				if (currentUser.isPlayer()){
					clickAvailable();
				}
			}

			// Если ты подключился на 3 стадии игры
			if (event.data.state === STATE_END) {
				x = event.data.players_data[index.left].wins;
				y = event.data.players_data[index.right].wins;

				gameLib.clearStage();

				if (gameSession.isStateExecution()){
					gameLib.drawExecutionScreen(winStreak, winsToWin, currentUser);
				}

				if (gameSession.isStateRating()){
					gameLib.rateThem(currentUser);
				}
			}

			break;
		}
		//--------------------------------------------------П А К Е Т  1 0 0 1------------------------------------------
		case (EVENT_READY): {
			if (currentUser.isPlayer()) {
				gameLib.rightPlayerReady(currentUser);
			} else {
				if (event.id === idPl.left) {
					gameLib.leftPlayerReady(currentUser);
				} else {
					gameLib.rightPlayerReady(currentUser);
				}
			}
			break;
		}
		//----------------------------------------П А К Е Т  1 0 0 2------------------------------------------------
		case (EVENT_ROUND_START): {

			if (currentUser.isPlayer()) {
				clickAvailable();
			}
			goToGame();
			gameLib.clearStage();

			break;
		}
		//--------------------------------------------П А К Е Т  1 0 0 5------------------------------------------------
		case (EVENT_ROUND_RESULT): {
			animateResults(event.moves);

			clickAble = false;
			stage.okAble = true;
			//Если ты спектатор
			if (currentUser.isSpectator()) {
				switch (event.winner_id) {
					case (idPl.left): {
						showWinLoseTitles("left");
						gameSession.leftWins();
						winStreak.left++;
						break;
					}
					case (idPl.right): {
						showWinLoseTitles("right");
						gameSession.rightWins();
						winStreak.right++;
						break;
					}
					case (0): {
						showWinLoseTitles("draw");
						gameSession.draw();
						break;
					}
				}
			} else {
				switch (event.winner_id) {
					case (currentUser.id): {
						showWinLoseTitles("left");
						gameSession.leftWins();
						winStreak.left++;
						break;
					}
					case (0): {
						showWinLoseTitles("draw");
						gameSession.draw();
						break;
					}
					default: {
						showWinLoseTitles("right");
						gameSession.rightWins();
						winStreak.right++;
						break;
					}
				}
			}

			if (event.final) {
				c.Tween.get(messageLeft)
					.wait(7000)
					.call(function () {
						changeGamePhase(VISIBLE_PHASE.SCREENS, phase_obj);
						gameLib.drawExecutionScreen(winStreak, winsToWin, currentUser);
					});

			} else {
				c.Tween.get(messageLeft)
					.wait(5000)
					.call(function () {
						changeGamePhase(VISIBLE_PHASE.SCREENS, phase_obj); 
					})
					.call(function () { gameLib.drawText(currentUser); });
			}
			break;
		}
	}
}

function showWinLoseTitles(winner) {
	var timeTextFadeIn = 2000;
	var textLeft;
	var textRight;

	switch (winner) {
		case "left":
			textLeft = "win";
			textRight = "lose";
		break;
		case "right":
			textLeft = "lose";
			textRight = "win";
		break;
		default:
			textLeft = "draw";
			textRight = "draw";
	}

	winLoseTextLeft.text = textLeft;
	winLoseTextLeft.regX = winLoseTextLeft.getMeasuredWidth();

	winLoseTextRight.text = textRight;
	winLoseTextRight.regX = 0;

	c.Tween.get(winLoseTextLeft, {override: true})
		.wait(timeTextFadeIn)
		.to({ alpha: 1 }, 200);
	c.Tween.get(winLoseTextRight, {override: true})
		.wait(timeTextFadeIn)
		.to({ alpha: 1 }, 200);
}

function resetComponents() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].reset();
	}
}

function stopHandsSwinging() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].stopSwing();
	}
}

function reset() {
	resetComponents(bigHand1[ROCK], bigHand1[PAPER], bigHand1[SCISSORS], 
						bigHand2[ROCK], bigHand2[PAPER], bigHand2[SCISSORS],
						btn1[ROCK], btn1[PAPER], btn1[SCISSORS],
						btn2[ROCK], btn2[PAPER], btn2[SCISSORS],
						gradRock1, gradPaper1, gradScissors1,
						titleRock1, titlePaper1, titleScissors1,
						titleRock2, titlePaper2, titleScissors2);

	stopHandsSwinging(rock1, paper1, scissors1, rock2, paper2, scissors2);

	c.Tween.get(winLoseTextLeft, {override: true})
		.to({ alpha: 0 }, 200);
	c.Tween.get(winLoseTextRight, {override: true})
		.to({ alpha: 0 }, 200);

}

function tick(event) {
	stage.update();
}

function clickAvailable(){
	enableButtons();
	clickAble = true;
}

function rateThem() {
	gameLib.rateThem(currentUser);
}

function variableEqual() {
	label = {       // для именованных свойств
		left: 'p1',
		right: 'p2'
	};

	index = {       // для массивов
		left: 0,
		right: 1
	};

	idPl = {        // для спектаторов
		left: 1,
		right: 2
	};

	winStreak = {   // Число побед
		left: 0,
		right: 0
	};

	readyPlayer = {
		left: false,
		right: false
	};

	winsToWin; //Раундов в игре

	clickAble = false;
	stage.okAble = false;

	instrPage = 1;

	phase_obj = {};
	
	clearInterval(animInterval);
}

function showGameResults() {
	changeGamePhase(VISIBLE_PHASE.SCREENS, phase_obj);
	gameLib.showGameResults(gameSession, currentUser);
}

var lifecycle = new gameLib.Lifecycle({
	init: init,
	recvData: recvData,
	rateThem: rateThem,
	showGameResults: showGameResults
});

module.exports = {
	init: function() { lifecycle.init(); },
	close: function() { close(); },
	recvData: function(event) { lifecycle.recvData(event); },
	rateThem: function() { lifecycle.rateThem(); },
	showGameResults: function() { lifecycle.showGameResults(); },

	animProc: animProc,
	clickAvailable: clickAvailable
};