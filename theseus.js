const maze = document.querySelector('.maze');

const mazeCells = [];

const mazePattern = `
          
__  __  _ 
| |  | || 
    _ __  
 ||  |  | 
 _ _   __ 
|  |||    
     _ ___
|  |  |   
   _ _    
|| | |||| 
          
|| | | || 
  _  _    
| | |   | 
 _  _ __  
    |  || 
 ______   
       || 
__________`;

// Vertical and horizontal walls (every other line)
const parserMazeVWalls = mazePattern.split('\n').filter((_, i) => i % 2).join('');
const parserMazeHWalls = mazePattern.split('\n').filter((_, i) => !(i % 2)).join('');
finished = false;

function setBorderClasses(cell, {top, right, bottom, left} = {}) {
  top && cell.classList.add('topBorder');
  right && cell.classList.add('rightBorder');
  bottom && cell.classList.add('bottomBorder');
  left && cell.classList.add('leftBorder');
}

function restart() {
  location.reload();
}

function lose() {
  shadow.classList.remove('none');
  document.querySelector('.deathModal').classList.remove('none');
}

function win() {
  finished = true;
  maze.classList.add('won');
  document.body.style.background = 'black';
  document.querySelector('.controls').classList.add('none');
}

class Entity {
  constructor({element} = {}) {
    this.element = typeof element === 'string' ? document.getElementById(element) : element;
  }

  static directionToSide = {
    up: 'top',
    right: 'right',
    down: 'bottom',
    left: 'left',
  }

  static isEdgeCell(direction, index) {
    if (direction === 'up') {
      return index <= 9;
    }
    else if (direction === 'right') {
      return ((index + 1) % 10) === 0;
    }
    else if (direction === 'down') {
      return index >= 90;
    }
    else if (direction === 'left') {
      return index % 10 === 0;
    }
  }

  static canMove(direction, position) {
    return !mazeCells[position].borders[Entity.directionToSide[direction]] && !Entity.isEdgeCell(direction, position)
  }

  static transformString = (x, y) => `translate(calc(${x} * (9vh - 0.5px)), calc(${y} * (9vh - 0.5px)))`;
}

class Player extends Entity {
  constructor({name, element} = {}) {
    super({ element: element });
    this.name = name || 'Asterion';
    this.cell = 0; // Current cell by index
    this.xPos = 0; // Current x coordinate in the maze
    this.yPos = 0; // Current y coordinate in the maze
    this.active = true; // Able to be controlled by the player or not
  }

  move(direction) {
    if (!Entity.canMove(direction, this.cell) || !this.active || finished) {
      return false;
    }

    if (direction === 'up' && this.yPos > 0) {
      this.yPos--;
    }
    else if (direction === 'right' && this.xPos < 9) {
      this.xPos++;
    }
    else if (direction === 'down' && this.yPos < 9) {
      this.yPos++;
    }
    else if (direction === 'left' && this.xPos > 0) {
      this.xPos--;
    }
    this.cell = this.yPos * 10 + this.xPos;
    this.element.style.transform = Entity.transformString(this.xPos, this.yPos);
    mazeCells[this.cell].cell.classList.add('revealed');
    mazeCells[this.cell].revealed = true;

    if (mazeCells.every(cell => cell.revealed)) {
      win();
    }
    return true;
  }
}

class Enemy extends Entity {
  constructor({name, element, target} = {}) {
    super({element: element});
    this.name = name || 'Theseus';
    this.target = target;

    this.cell = 99;
    this.xPos = 9;
    this.yPos = 9;
  }

  isCloser(direction) {
    const move = (direction === 'down' || direction === 'right') ? 1 : -1;
    const coordinate = (direction === 'up' || direction === 'down') ? 'yPos' : 'xPos';
    return Math.abs((this[coordinate] + move) - this.target[coordinate]) < Math.abs(this[coordinate] - this.target[coordinate]);
  }

  moveOnce() {
    if (Entity.canMove('up', this.cell) && this.isCloser('up')) {
      this.yPos--;
    }
    else if (Entity.canMove('right', this.cell) && this.isCloser('right')) {
      this.xPos++;
    }
    else if (Entity.canMove('down', this.cell) && this.isCloser('down')) {
      this.yPos++;
    }
    else if (Entity.canMove('left', this.cell) && this.isCloser('left')) {
      this.xPos--;
    }
    this.cell = this.yPos * 10 + this.xPos;
    this.element.style.transform = Entity.transformString(this.xPos, this.yPos);
    if (this.cell === this.target.cell) {
      this.target.active = false;
      lose();
    }
  }

  move() {
    this.moveOnce();
    this.moveOnce();
  }
}

window.addEventListener('load', () => {
  // Draw the maze
  for (let i = 0; i < 100; i++) {
    const newCell = document.createElement('div');
    newCell.classList = 'mazeCell';

    const preRevealed = i === 0; // The starting cell starts revealed
    // const preRevealed = i !== 1; // The starting cell starts revealed
    preRevealed && newCell.classList.add('revealed');
  
    const cellData = {
      cell: newCell,
      borders: {
        top: i >= 10 ? parserMazeHWalls.charAt(i - 10) !== ' ' : false,
        right: parserMazeVWalls.charAt(i) !== ' ',
        bottom: i < 90 && parserMazeHWalls.charAt(i) !== ' ',
        left: i > 0 ? parserMazeVWalls.charAt(i - 1) !== ' ' : false,
      },
      revealed: preRevealed,
    }
    setBorderClasses(newCell, cellData.borders);
  
    mazeCells.push(cellData);
    maze.appendChild(newCell);
  }

  // Set the riddle
  setTimeout(() => {
    document.querySelector('.riddle').innerHTML = `
    The ground of chilren's recreation
    <br>
    <br>
    We have but only one
    <br>
    <br>
    In times of old more dangerous
    <br>
    <br>
    But oftentimes more fun.`
  }, 10);
}, false);

window.addEventListener('beforeunload', () => {
  document.querySelector('.riddle').innerHTML = '';
}, false);

const Asterion = new Player({ element: 'asterion' });
const Theseus = new Enemy({element: 'theseus', target: Asterion});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    if (Asterion.move('up')) {
      Theseus.move();
    }
  }
  else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    if (Asterion.move('right')) {
      Theseus.move();
    }
  }
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    if (Asterion.move('down')) {
      Theseus.move();
    }
  }
  else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    if (Asterion.move('left')) {
      Theseus.move();
    }
  }
  else if (e.key === 'Enter') {
    Theseus.move();
  }
}, false);

document.addEventListener('click', e => {
  if (e.target.matches('.skipTurnBtn')) {
    Theseus.move();
  }
  else if (e.target.matches('.restartBtn')) {
    restart();
  }
}, false);
