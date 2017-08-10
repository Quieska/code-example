'use strict';

var React = require('react');
var Link = require('react-router').Link;
var c = createjs;

var stage;
var g = new createjs.Graphics();
	g.beginFill(createjs.Graphics.getRGB(255,255,255));
	// g.drawCircle(0,0,3);

var stars = [];
function Star(id, coord, size) {
	this.id = id;
	this.x = coord.x;
	this.y = coord.y;
	this.layer = coord.layer;
	this.size = size;

	this.g = new createjs.Graphics();
	this.g.beginFill(createjs.Graphics.getRGB(255,255,255));
	this.g.drawCircle(0,0,this.size);

	this.shape = new c.Shape(this.g);
	this.shape.x = this.x;
	this.shape.y = this.y;
}

var layers = [];

var starSystem = {
	width: 1920,
	height: 1080,
	layerAmount: 5,
	layerCenter: 1.5,
	layerDistance: 5,
	starAmount: 500,
	maxStarSize: 2,
	offsetRatio: -10
};

var NotFoundPage = React.createClass({
	componentDidMount: function() {
		this.initLayers();
		this.initStars();

		this.refs.notFoundBlock.addEventListener("mousemove", this.mouseMoved);
	},

	componentWillUnmount: function() {
		this.refs.notFoundBlock.removeEventListener("mousemove", this.mouseMoved);
	},

	initLayers: function() {
		stage = new c.Stage("star-system");

		for (var i = 0; i < starSystem.layerAmount; i++) {
			layers[i] = new c.Container();

			stage.addChild(layers[i]);
		}
	},

	initStars: function() {

		for (var i = 0; i < starSystem.starAmount; i++) {

			var x = Math.random() * starSystem.width;
			var y = Math.random() * starSystem.height;
			var layer = Math.floor( Math.random() * starSystem.layerAmount );
			var size = Math.floor( Math.random() * starSystem.maxStarSize ) + 1;

			// Уменьшаем все размеры на единицу, кроме тех, где уже была единица,
			// Для подавляющего большинства маленьких звезд
			if ( size > 1) {
				size = size - 1;
			}

			//Делаем зависимость размера от слоя
			if ( layer < starSystem.layerCenter ) {
				size = size * .1 * starSystem.layerDistance * (1 / (starSystem.layerCenter - layer));
			} else if (layer > starSystem.layerCenter) {
				size = size * .1 * starSystem.layerDistance * (layer - starSystem.layerCenter);
			}
			stars[i] = new Star(i, {x: x, y: y, layer: layer}, size);

			layers[layer].addChild(stars[i].shape);
			
		}
		
		c.Ticker.setFPS(60);
		c.Ticker.addEventListener("tick", this.tick);
	},

	mouseMoved: function() {
		for (var i = 0; i < starSystem.layerAmount; i++) {

			var screenWidth = this.refs.notFoundBlock.offsetWidth;
			var screenHeight = this.refs.notFoundBlock.offsetHeight;
			var mouseX = event.clientX;
			var mouseY = event.clientY;

			var offsetX = ((starSystem.offsetRatio * mouseX) / screenWidth) - (starSystem.offsetRatio / 2);
			var offsetY = ((starSystem.offsetRatio * mouseY) / screenHeight) - (starSystem.offsetRatio / 2);

			layers[i].x = offsetX * (starSystem.layerDistance * (i - starSystem.layerCenter));
			layers[i].y = offsetY * (starSystem.layerDistance * (i - starSystem.layerCenter));
		}
	},

	tick: function() {
		stage.update();
	},

	render: function() {
		return (
			<div id="not-found" ref='notFoundBlock'>
				<canvas id="star-system" width='1920' height='1080'></canvas>
				<div className="content">
					<h1><span><b>404</b></span></h1>
					<span>Page Not Found</span>
					<br></br>
					<div className="index-link">
						<Link to="/"></Link>
					</div>
				</div>
			</div>
		)
	}
});

module.exports = NotFoundPage;
