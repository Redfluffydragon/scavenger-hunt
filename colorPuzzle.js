const colorGrid = document.getElementsByClassName('colorGrid')[0];
const cells = document.getElementsByClassName('colorCell');
const colorBtns = document.getElementsByClassName('colorBtn');

const colNumbers = document.getElementsByClassName('topLabel');
const rowNumbers = document.getElementsByClassName('sideLabel');

const shadow = document.getElementsByClassName('shadow')[0];
const successImage = document.getElementsByClassName('successImage')[0];

const cellData = Array.from(new Array(25), () => {return { color: 'white', locked: false }});
const colors = ['red', 'green', 'brown', 'yellow', 'gray', 'black', 'white'];
let color = 'white';
let locking = true;
let dragged = false;

/**
 * n = brown
 * b = black
 * 
 * a = gray
 * g = green
 */
const patterns = {
  snowMom: {
    pattern: 'ggbgg ggwgg grrrg grrrg gwwwg',
  },
  tree: {
    pattern: 'wwyww wwgww wrggw gggrg wwnww',
    display: {
      r: 'top',
      g: 'both',
      n: 'side',
      y: 'both',
      a: 'both',
      b: 'both',
      w: 'both',
    },
  },
  test: 'gwwww wwwww wwwww wwwww wwwww',
}

let currentPattern = patterns.snowMom;
let finished = false;

const colorToLetter = {
  red: 'r',
  green: 'g',
  brown: 'n',
  yellow: 'y',
  gray: 'a',
  black: 'b',
  white: 'w',
};

/**
 * Change the color of the target cell to the current color
 * @param {HTMLElement} target The target to change the color of
 * @returns {void}
 */
function colorCell(target) {
  const clickIdx = [...cells].findIndex(cell => cell === target);

  if (finished || cellData[clickIdx].locked) {
    return;
  }
  target.classList.add(color);
  colors.forEach(el => {
    el !== color && target.classList.remove(el);
  });
  cellData[clickIdx].color = color;
  if (checkUserPattern(currentPattern.pattern)) {
    finished = true;
    shadow.classList.remove('none');
    successImage.classList.remove('none');
    document.getElementsByClassName('clearBtn')[0].disabled = true;
    document.getElementsByClassName('colorGrid')[0].classList.add('finished');
    setTimeout(() => {
      shadow.classList.add('none');
      successImage.classList.add('none');
    }, 2400);
  }
}

/**
 * Change the color of cells by draggin over them with left click
 * @param {Event} e A mousemoved event to get the element the cursor is over
 */
function colorDrag(e) {
  const over = document.elementFromPoint(e.clientX, e.clientY);
  if (over.matches('.colorCell')) {
    colorCell(over);
  }
}

/**
 * Lock or unlock the target cell
 * @param {HTMLElement} target The cell to lock or unlock
 * @param {boolean} lock Whether to lock or unlock the target
 * @returns {void}
 */
function lockCell(target, lock) {
  if (finished) {
    return;
  }
  const clickIdx = [...cells].findIndex(cell => cell === target);
  target.classList[lock ? 'add' : 'remove']('locked');
  cellData[clickIdx].locked = lock;
}

/**
 * Lock cells by dragging over them with right click
 * @param {Event} e A mousemoved event to get the element the cursor is over
 */
function lockDrag(e) {
  dragged = true;
  const over = document.elementFromPoint(e.clientX, e.clientY);
  if (over.matches('.colorCell')) {
    lockCell(over, locking);
  }
}

/**
 * The mulberry32 PRNG, for deterministically but randomly displaying either the side or top hints. Returns a random number between 0 and 1.
 * @param {number} a The seed
 * @returns {number}
 */
function mulberry32(a) {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  var t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

/**
 * Check if the user input is equal to the given pattern
 * @param {string} pattern The pattern to check against
 * @returns {Boolean}
 */
function checkUserPattern(pattern) {
  const checkPattern = pattern.replace(/ /g, '');
  return cellData.every((cell, idx) => colorToLetter[cell.color] === checkPattern.charAt(idx));
}

/**
 * Generate an object with all the color hints for a pattern
 * @param {Object} pattern The pattern to create hints for
 * @returns {Object}
 */
function getColorNumbers(pattern) {
  const numbers = {
    r: {
      rows: [0, 0, 0, 0, 0],
      cols: [0, 0, 0, 0, 0],
      display: '',
    },
    g: {
      rows: [0, 0, 0, 0, 0],
      cols: [0, 0, 0, 0, 0],
      display: '',
    },
    n: {
      rows: [0, 0, 0, 0, 0],
      cols: [0, 0, 0, 0, 0],
      display: '',
    },
    y: {
      rows: [0, 0, 0, 0, 0],
      cols: [0, 0, 0, 0, 0],
      display: '',
    },
    a: {
      rows: [0, 0, 0, 0, 0],
      cols: [0, 0, 0, 0, 0],
      display: '',
    },
    b: {
      rows: [0, 0, 0, 0, 0],
      cols: [0, 0, 0, 0, 0],
      display: '',
    },
    w: {
      rows: [0, 0, 0, 0, 0],
      cols: [0, 0, 0, 0, 0],
      display: '',
    },
  };

  pattern.pattern.split(' ').forEach((row, idx) => {
    for (const i in numbers) {
      const colorMatch = new RegExp(i, 'g');
      numbers[i].rows[idx] = (row.match(colorMatch) || []).length;
    }
    for (let i = 0; i < row.length; i++) {
      numbers[row.charAt(i)].cols[i]++;
    }
  });

  if (pattern.display) {
    for (const i in pattern.display) {
      numbers[i].display = pattern.display[i];
    }
  }
  return numbers;
}

/**
 * Display the number hints along the edge of the puzzle
 * @param {Object} numbers An object with all the numbers for each color to display
 * @param {string} color The current color to display
 */
function showColorNumbers(numbers, color) {
  const cLetter = colorToLetter[color];

  /** @type {'side'|'top'|'both'|'random'} style Which numbers to display */
  let display = numbers[cLetter].display || 'random';

  if (display === 'random') {
    const decider = Math.round(mulberry32(numbers[cLetter].cols.reduce((sum, curr) => sum + curr)) * 10);
    if (!(decider % 2)) { // Top
      [...colNumbers].forEach((el, idx) => {
        el.textContent = numbers[cLetter].cols[idx];
      });
      [...rowNumbers].forEach(el => {
        el.textContent = '';
      });
    }
    else { // Side
      [...colNumbers].forEach(el => {
        el.textContent = '';
      });
      [...rowNumbers].forEach((el, idx) => {
        el.textContent = numbers[cLetter].rows[idx];
      });
    }
  }
  else if (display === 'both') {
    [...colNumbers].forEach((el, idx) => {
      el.textContent = numbers[cLetter].cols[idx];
    });
    [...rowNumbers].forEach((el, idx) => {
      el.textContent = numbers[cLetter].rows[idx];
    });
  }
  else if (display === 'side') {
    [...colNumbers].forEach(el => {
      el.textContent = '';
    });
    [...rowNumbers].forEach((el, idx) => {
      el.textContent = numbers[cLetter].rows[idx];
    });
  }
  else if (display === 'top') {
    [...colNumbers].forEach((el, idx) => {
      el.textContent = numbers[cLetter].cols[idx];
    });
    [...rowNumbers].forEach(el => {
      el.textContent = '';
    });
  }
}

const colorNums = getColorNumbers(currentPattern);

addEventListener('load', () => {
  showColorNumbers(colorNums, color);
}, false);

colorGrid.addEventListener('mousedown', e => {
  e.preventDefault();
  if (e.button === 0) {
    document.addEventListener('mousemove', colorDrag, false);
  }
  else if (e.button === 2) { // Lock cells with right click
    locking = !e.target.matches('.locked');
    document.addEventListener('mousemove', lockDrag, false);
  }
}, false);

document.addEventListener('mouseup', () => {
  document.removeEventListener('mousemove', colorDrag, false);
  document.removeEventListener('mousemove', lockDrag, false);
}, false);

colorGrid.addEventListener('contextmenu', e => {
  e.preventDefault();
  if (dragged) {
    dragged = false;
    return;
  }
  if (e.target.matches('.colorCell')) {
    locking = !e.target.matches('.locked');
    lockCell(e.target, locking);
  }
}, false);

document.addEventListener('click', e => {
  if (e.target.matches('.colorCell')) {
    if (e.button === 0) {
      colorCell(e.target);
    }
  }
  else if (e.target.matches('.clearBtn')) {
    [...cells].forEach(cell => {
      cell.classList.value = 'colorCell';
    });
    cellData.forEach(cell => {
      cell.color = 'white';
      cell.locked = false;
    });
  }
}, false);

document.getElementById('colorForm').addEventListener('input', () => {
  const newColor = new FormData(document.forms.colorForm).get('currentColor');
  color = newColor;
  showColorNumbers(colorNums, color);
}, false);