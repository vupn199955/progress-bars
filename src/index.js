import './styles/style.scss';

let CURRENT_BAR;
let LIMIT = 100;
const ELEMENT_IDS = {
  SELECT_BAR: 'select-bar',
  LIMIT_TEXT: 'limit-value',
  PROGRESS_BARS: 'progress-bar-container',
  BUTTONS: 'btn-container',
};

const setBarActive = () => {
  const progressBar = document.getElementById(CURRENT_BAR);
  progressBar.classList.add('bg-warning');
};

const setBarDeactive = () => {
  const progressBar = document.getElementById(CURRENT_BAR);
  if (progressBar) {
    progressBar.classList.remove('bg-warning');
  }
};

const SELECT_BAR_elm = document.getElementById(ELEMENT_IDS.SELECT_BAR);

SELECT_BAR_elm.addEventListener('change', (e) => {
  setBarDeactive();
  if (e.target.value === '0') {
    CURRENT_BAR = null;
    return;
  }
  CURRENT_BAR = e.target.value;
  setBarActive();
});

const makeRequest = (method, url) => new Promise(((resolve, reject) => {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  } catch (err) {
    reject({
      status: 500,
      statusText: err,
    });
  }
}));

const setBarValue = (value, id) => {
  const progressBar = document.getElementById(id);
  if (!progressBar) {
    alert('Please choose which bar that you want to change.');
    return;
  }
  const currentValue = progressBar.getAttribute('aria-valuenow');
  let newValue = Number(currentValue) + Number(value);
  let width;
  if (newValue < 0) {
    newValue = 0;
    width = 0;
  } else {
    width = parseInt((newValue / LIMIT) * 100);
  }

  if (newValue > LIMIT) {
    progressBar.classList.add('bg-danger');
  } else {
    progressBar.classList.remove('bg-danger');
  }

  progressBar.setAttribute('style', `width: ${width}%`);
  progressBar.setAttribute('aria-valuenow', newValue);
  progressBar.innerHTML = newValue;
};

const generateBars = (bars = []) => {
  const createProgressBarElm = (value, index) => {
    const id = `progress-${index + 1}`;
    const option = document.createElement('option');
    const progressBar = document.createElement('div');
    const progressBarContainer = document.createElement('div');
    progressBarContainer.setAttribute('class', 'progress my-3');

    option.setAttribute('value', id);
    option.innerHTML = `#${id}`;
    SELECT_BAR_elm.append(option);

    progressBar.setAttribute('id', id);
    progressBar.setAttribute('class', 'progress-bar bg-info');
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuemin', 0);
    progressBar.setAttribute('aria-valuemax', LIMIT);
    const width = parseInt((value / LIMIT) * 100);
    progressBar.setAttribute('aria-valuenow', value);
    progressBar.setAttribute('style', `width: ${width}%`);
    progressBar.innerHTML = value;

    progressBarContainer.append(progressBar);

    return progressBarContainer;
  };

  SELECT_BAR_elm.removeAttribute('hidden');
  const progressBarContainer = document.getElementById(ELEMENT_IDS.PROGRESS_BARS);
  bars.forEach(
    (value, index) => progressBarContainer.append(createProgressBarElm(value, index))
  );
};

const generateBtn = (btns = []) => {
  const createBtn = (value) => {
    const btn = document.createElement('button');
    btn.innerHTML = value > 0 ? `+${value}` : value;
    btn.setAttribute('class', 'btn btn-info m-1');
    btn.addEventListener('click', () => setBarValue(value, CURRENT_BAR));

    return btn;
  };

  const btnContainer = document.getElementById(ELEMENT_IDS.BUTTONS);
  btns.forEach(
    (value) => btnContainer.appendChild(createBtn(value))
  );
};

const setLimitValue = (value) => {
  LIMIT = value;
  const limitElm = document.getElementById(ELEMENT_IDS.LIMIT_TEXT);
  limitElm.innerHTML = value;
};

const getData = () => {
  makeRequest('GET', 'http://pb-api.herokuapp.com/bars').then((data) => {
    const buttons = data.buttons.sort();
    setLimitValue(data.limit);
    generateBars(data.bars);
    generateBtn(buttons);
  }).catch(() => {
    alert('Server error!');
  });
};

getData();
