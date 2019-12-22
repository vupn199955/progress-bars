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

const getData = () => {
  return makeRequest('GET', 'http://pb-api.herokuapp.com/bars');
};

module.exports = { getData };
