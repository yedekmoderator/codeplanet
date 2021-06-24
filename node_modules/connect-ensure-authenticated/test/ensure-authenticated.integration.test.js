const assert = require('assert');
const request = require('supertest');

const startServer = require('./start-server');

const testUser = {
  username: 'bob',
  password: '12345',
  firstName: 'Bob',
  favoriteNumber: 42,
};

describe('ensureAuthenticated integration test', () => {
  let server;

  before((done) => {
    startServer()
      .then((result) => {
        server = result;
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  after((done) => {
    server.close(() => {
      done();
    });
  });

  describe('without unless', () => {
    it('should successfully login and access a protected route', (done) => {
      let cookie;

      const login = () => new Promise((resolve, reject) => {
        request('http://localhost:3000')
          .post('/api/login')
          .send({
            username: testUser.username,
            password: testUser.password,
          })
          .end((error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
      });

      const whoami = () => new Promise((resolve, reject) => {
        request('http://localhost:3000')
          .get('/api/whoami')
          .set('cookie', cookie)
          .end((error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
      });

      const logout = () => new Promise((resolve, reject) => {
        request('http://localhost:3000')
          .post('/api/logout')
          .set('cookie', cookie)
          .end((error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
      });

      login()
        .then((loginResponse) => {
          assert.equal(loginResponse.status, 200);
          assert.deepStrictEqual(loginResponse.body, testUser);

          cookie = loginResponse.headers['set-cookie'];
          assert.notEqual(cookie, undefined);

          return whoami();
        })
        .then((whoamiResponse) => {
          assert.equal(whoamiResponse.status, 200);
          assert.deepStrictEqual(whoamiResponse.body, { authenticationRequired: true });

          return logout();
        })
        .then((logoutResponse) => {
          assert.equal(logoutResponse.status, 200);
          assert.deepStrictEqual(logoutResponse.body, { logout: true });

          done();
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should throw an error if the user is not authenticated', (done) => {
      request('http://localhost:3000')
        .get('/api/whoami')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((error, response) => {
          if (error) {
            done(error);
          } else {
            assert.deepStrictEqual(response.body, { message: 'Authentication required' });

            done();
          }
        });
    });
  });

  describe('with unless', () => {
    it('should successfully login and access a protected route guarded by unless', (done) => {
      let cookie;

      const login = () => new Promise((resolve, reject) => {
        request('http://localhost:3000')
          .post('/api/login')
          .send({
            username: testUser.username,
            password: testUser.password,
          })
          .end((error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
      });

      const whoami = () => new Promise((resolve, reject) => {
        request('http://localhost:3000')
          .get('/api/unless/whoami')
          .set('cookie', cookie)
          .end((error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
      });

      const logout = () => new Promise((resolve, reject) => {
        request('http://localhost:3000')
          .post('/api/logout')
          .set('cookie', cookie)
          .end((error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
      });

      login()
        .then((loginResponse) => {
          assert.equal(loginResponse.status, 200);
          assert.deepStrictEqual(loginResponse.body, testUser);

          cookie = loginResponse.headers['set-cookie'];
          assert.notEqual(cookie, undefined);

          return whoami();
        })
        .then((authenticatedResponse) => {
          assert.equal(authenticatedResponse.status, 200);
          assert.deepStrictEqual(authenticatedResponse.body, { authenticationRequired: true });

          return logout();
        })
        .then((logoutResponse) => {
          assert.equal(logoutResponse.status, 200);
          assert.deepStrictEqual(logoutResponse.body, { logout: true });

          done();
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should throw an error if the user is not authenticated', (done) => {
      request('http://localhost:3000')
        .get('/api/unless/whoami')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((error, response) => {
          if (error) {
            done(error);
          } else {
            assert.deepStrictEqual(response.body, { message: 'Authentication required' });

            done();
          }
        });
    });

    it('should successfully return because the route is not authenticated due to unless', (done) => {
      request('http://localhost:3000')
        .get('/api/unless/login')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((error, response) => {
          if (error) {
            done(error);
          } else {
            assert.deepStrictEqual(response.body, { authenticationRequired: false });

            done();
          }
        });
    });
  });

  describe('custom options', () => {
    it('should throw a custom error message/status if the user is not authenticated', (done) => {
      request('http://localhost:3000')
        .get('/api/custom-options/whoami')
        .expect('Content-Type', /json/)
        .expect(418)
        .end((error, response) => {
          if (error) {
            done(error);
          } else {
            assert.deepStrictEqual(response.body, { message: 'I\'m a teapot!' });

            done();
          }
        });
    });
  });
});
