const passwordInput = document.querySelector('#password');
const wrongPassword = document.querySelector('.wrongPassword');
const password = 'so this is christmas';

function logIn() {
  document.querySelector('.theseusAndAsterion').classList.remove('none');
  document.querySelector('.login').classList.add('none');
}

function checkPassword() {
  if (passwordInput.value.toLowerCase() === password) {
    localStorage.setItem('loggedIn', 'true');
    logIn();
  }
  else {
    wrongPassword.classList.remove('none');
  }
}

if (localStorage.getItem('loggedIn') === 'true') {
  logIn();
}

document.querySelector('.passwordBtn').addEventListener('click', checkPassword, false);

window.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    checkPassword();
  }
}, false);

passwordInput.addEventListener('input', () => {
  wrongPassword.classList.add('none');
}, false);