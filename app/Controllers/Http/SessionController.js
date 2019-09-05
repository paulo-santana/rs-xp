'use strict'

class SessionController {
  async store({ auth, request, response }) {
    const {email, password} = request.only([
      'email',
      'password'
    ]);

    const { token } = await auth.attempt(email, password);

    return { token };
  }
}

module.exports = SessionController
