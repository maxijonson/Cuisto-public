const expect = require('expect');
const request = require('supertest');
const { app } = require('../../server');
const errMsg = require('../../middleware/messages');
const { Organisation } = require('../../models');

var { resetDatabase } = require('../seed/seed');

// Reset test database
before(resetDatabase);
var token;


describe('Organisation Operations', () => {

    it('should signup a new Organisation', (done) => {
        const params = {
            nom: 'Organisation Test',
            username: 'TestAdmin',
            password: 'TestPassword',
            courriel: 'organisation@test.com'
        };

        request(app)
            .post('/api/signup')
            .send(params)
            .expect(200)
            .expect((res) => {
                const org = res.body;

                expect(org.id).toBeTruthy();
                expect(org.nom).toBe(params.nom);
                expect(org.username).toBe(params.username);
                expect(org.password).toBeFalsy();
            })
            .end(async (err, res) => {
                if (err) return done(err);
                try {
                    token = res.headers['x-auth'];
                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('should logout the Organisation and delete the token from the DB', (done) => {
        request(app)
            .get('/api/logout')
            .set('x-auth', token)
            .expect(200)
            .end(async (err, res) => {
                try {
                    if (err) return done(err);
                    await Organisation.findByToken(token);
                    done("Assertion should not have reached this point");
                } catch (err) {
                    expect(err).toBe(errMsg.TOKEN_NOT_FOUND);
                    done();
                }
            });
    });
});