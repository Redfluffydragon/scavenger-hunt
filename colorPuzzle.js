const cells = document.getElementsByClassName('colorCell');
const colorBtns = document.getElementsByClassName('colorBtn');

const colNumbers = document.getElementsByClassName('topLabel');
const rowNumbers = document.getElementsByClassName('sideLabel');

const shadow = document.getElementsByClassName('shadow')[0];
const successImage = document.getElementsByClassName('successImage')[0];

const cellData = Array.from(new Array(25), () => {return {color: 'white'}});
const colors = ['red', 'green', 'brown', 'yellow', 'gray', 'black', 'white'];
let color = 'white';

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

function colorCell(target) {
  if (finished) {
    return;
  }
  const clickIdx = [...cells].findIndex(cell => cell === target);
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

function colorDrag(e) {
  const over = document.elementFromPoint(e.clientX, e.clientY);
  if (over.matches('.colorCell')) {
    colorCell(over);
  }
}

function mulberry32(a) {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  var t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function checkUserPattern(pattern) {
  const checkPattern = pattern.replace(/ /g, '');
  return cellData.every((cell, idx) => colorToLetter[cell.color] === checkPattern.charAt(idx));
}

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
 * @param {'side'|'top'|'both'|'random'} style Which numbers to display
 */
function showColorNumbers(numbers, color) {
  const cLetter = colorToLetter[color];
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

document.addEventListener('click', e => {
  if (e.target.matches('.colorCell')) {
    colorCell(e.target);
  }
  else if (e.target.matches('.clearBtn')) {
    [...cells].forEach(cell => {
      cell.classList.value = 'colorCell';
    });
  }
}, false);

document.getElementsByClassName('colorGrid')[0].addEventListener('mousedown', e => {
  if (e.button !== 0) {
    return;
  }
  e.preventDefault();
  document.addEventListener('mousemove', colorDrag, false);
}, false);

document.addEventListener('mouseup', () => {
  document.removeEventListener('mousemove', colorDrag, false);
}, false);

document.getElementById('colorForm').addEventListener('input', () => {
  const newColor = new FormData(document.forms.colorForm).get('currentColor');
  color = newColor;
  showColorNumbers(colorNums, color);
}, false);