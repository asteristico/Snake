//função que devolve valores aleatórios entre a(inclusive) e b(exclusive)
function rnd(a, b) {
    return (Math.floor(Math.random() * (b - a) + a));
}
//Constantes
var COLS = 25,
    ROWS = 25;
//Valores das Células
var EMPTY=0,
    SNAKE=1,
    FRUIT=2;
//Direções
var LEFT=0,UP=1,RIGHT=2,DOWN=3;
//Códigos das teclas
var KEY_LEFT=37, KEY_UP=38, KEY_RIGHT=39, KEY_DOWN=40;

//Grelha
var grid = {
    width: undefined,
    height: undefined,
    grid: undefined,
    
    init: function(d, columns, rows) {
        this.width = columns;
        this.height = rows;
        this.grid = [];
        for (var x=0; x < columns; x++){
            this.grid.push([]);
            for (var y=0; y < rows; y++){
                this.grid[x].push(d);
            };
        };
    },
    
    set: function(val, x, y) {
        this.grid[x][y] = val;
    },
    
    get: function(x,y){
        return this.grid[x][y];
    }
};

var snake = {
    direction: undefined,
    queue: undefined,
    last: undefined,
    
    init: function(d, x, y) {
        this.direction = d;
        this.queue = [];
        this.insert(x,y);
    },
    
    insert: function(x,y){
        this.queue.unshift({x:x,y:y});
        this.last = this.queue[0];
    },
    
    remove: function(){
        return this.queue.pop();
    }
};

function setFood() {
    var empty = [];
    for (var x=0; x < grid.width; x++){
        for (var y=0; y < grid.width; y++){
            if (grid.get(x,y) == EMPTY){
                empty.push({x:x,y:y});
            }
        }
    }
    var randPos = empty[rnd(0,empty.length)];
    grid.set(FRUIT, randPos.x, randPos.y);
}

//Game Objects
var canvas, ctx, keystate, frames, score, gameover;

function main() {
    canvas = document.getElementById("snake");
    ctx = canvas.getContext("2d");
    
    displayHighScores();
    
    document.addEventListener("keydown", function(evt) {
        if (evt.keyCode === KEY_UP    ||
            evt.keyCode === KEY_RIGHT ||
            evt.keyCode === KEY_LEFT  ||
            evt.keyCode === KEY_DOWN){
                keystate = evt.keyCode;
        }
    });
    
	$("#snake").on("swipeup",function(){keystate=KEY_UP;});
	$("#snake").on("swipedown",function(){keystate=KEY_DOWN;});
	$("#snake").on("swipeleft",function(){keystate=KEY_LEFT;});
	$("#snake").on("swiperight",function(){keystate=KEY_RIGHT;});
	
    init();
}

function init() {
    
    score = 0;
    frames = 0;
    gameover = false;
    
    grid.init(EMPTY, COLS, ROWS);
    
    keystate = KEY_UP;
    
    var sp = {x: Math.floor(COLS/2), y: ROWS-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE,sp.x,sp.y);
    
    setFood();
    
    loop();
}

function loop() {
    update();
    draw();
    
    if (!gameover){
        window.requestAnimationFrame(loop,canvas);
    }else{
        end();
    }
}

function update() {
    frames++;
    
    if (frames%5 == 0){
        if (keystate === KEY_LEFT && snake.direction != RIGHT)
            snake.direction = LEFT;
        if (keystate === KEY_UP && snake.direction != DOWN)
            snake.direction = UP;
        if (keystate === KEY_DOWN && snake.direction != UP)
            snake.direction = DOWN;
        if (keystate === KEY_RIGHT && snake.direction != LEFT)
            snake.direction = RIGHT;
        
        var nx = snake.last.x;
        var ny = snake.last.y;
        
        switch (snake.direction){
            case LEFT:
                nx--;
                break;
            case UP:
                ny--;
                break;
            case RIGHT:
                nx++;
                break;
            case DOWN:
                ny++;
                break;
        }
                                                
        if ( nx < 0 ){
            nx = grid.width - 1;
        }else if (nx >= grid.width) {
            nx = 0;
        }else if (ny < 0) {
            ny = grid.height - 1;
        }else if (ny >= grid.height) {
            ny = 0;
        }
                
        if (grid.get(nx, ny) == SNAKE) {
            gameover = true;
        }
        
        if (grid.get(nx,ny) == FRUIT) {
            score++;
            var tail = {x: nx, y: ny};
            setFood();
        }else{
            var tail = snake.remove();
            grid.set(EMPTY,tail.x,tail.y);
            
            tail.x = nx;
            tail.y = ny;
        }
        
        grid.set(SNAKE,tail.x,tail.y);
        
        snake.insert(tail.x, tail.y);
    }
}

function draw() {
    var tw = canvas.width/grid.width;
    var th = canvas.height/grid.height;
    
    for (var x=0; x < grid.width; x++){
        for (var y=0; y < grid.height; y++){
            switch (grid.get(x,y)) {
                case EMPTY:
                    ctx.fillStyle = "#000";
                    break;
                case SNAKE:
                    ctx.fillStyle = "#00f";
                    break;
                case FRUIT:
                    ctx.fillStyle = "#f00";
                    break;
            }
            ctx.fillRect(x*tw,y*th,tw,th);
        }
    }
    ctx.font = "20px Times";
    ctx.fillStyle = "#0f0";
    ctx.fillText("Score: " + score, 10, canvas.height - 10);
}

function end() {
    ctx.fillStyle = "#0f0";
    
    var endDiv = document.createElement("div");
    endDiv.id = "end";
    
    var text = document.createElement("h2");
    text.id = "endgametext";
    text.innerHTML = "Game Over<br/>Your score was: <br/>" + score;
    endDiv.appendChild(text);
    
    var btnRestart = document.createElement("div");
    btnRestart.id = "restart";
    endDiv.appendChild(btnRestart);
    
    var hRestart = document.createElement("h3");
    hRestart.innerHTML = "Retry";
    btnRestart.appendChild(hRestart);
    
    document.body.appendChild(endDiv);
    
    saveHighScore(score);
	displayHighScores();
    
    btnRestart.addEventListener("click", function () {restart(endDiv) ;});
	btnRestart.addEventListener("touchend",function(){restart(endDiv);});
}

function saveHighScore(highScore){
    var highscores = getHighScores();
    highscores.push(highScore);
    highscores.sort(function(a,b){return b-a;});
    for(var i=0;i<10;i++){
        window.localStorage["score"+i] = highscores[i];
    }
}
function getHighScores(){
    var scores = [];
    for(var i=0;i<10;i++){
        var item = window.localStorage.getItem("score"+i);
        if (!hasStrangeValues(item)) {
            scores.push(parseInt(item));
        }else{
            scores.push(-1);
			window.localStorage.setItem("score"+i,-1);
        }
    }
    return scores;
}
function displayHighScores(){
	var highscores = getHighScores();
	var div = document.getElementById("highscore");
	if (div == null)
	{
		div = createElement(document.body,"div","highscore");
		var title = createElement(div,"h2",null,"High Scores");
	}
	else
		if (div.lastChild.nodeName.toLowerCase() == "ol")
			div.removeChild(div.lastChild);
	
	var highscoresList = createElement(div,"ol");
	for (var i = 0; i < highscores.length; i++)
	{
		var s = highscores[i];
		if(s!=-1)
			createElement(highscoresList,"li",null,s.toString());
	}
}

function createElement(parent, element, id, text){
	var node = document.createElement(element);
	if(!hasStrangeValues(id))
		node.id = id;
	if(!hasStrangeValues(text))
		node.innerHTML = text;
	parent.appendChild(node);
	return node;
}

function hasStrangeValues(variable){
	return (variable == null ||
			variable == undefined ||
			variable == NaN ||
			variable == "null" ||
			variable == "undefined" ||
			variable == "NaN" ||
			variable.length == 0);
}

function restart (end) {
    end.parentNode.removeChild(end);
    
    init();
}

main();