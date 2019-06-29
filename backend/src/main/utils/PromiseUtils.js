class PromiseUtils {
  static promiseFinally(promise, finallyFn) {
    return new Promise((resolve, reject) => {
      promise
        .then(result => {
          return Promise.resolve(finallyFn()).then(() => resolve(result));
        })
        .catch(error => {
          return Promise.resolve(finallyFn()).then(() => reject(error));
        });
    });
  }
}

module.exports = PromiseUtils;
