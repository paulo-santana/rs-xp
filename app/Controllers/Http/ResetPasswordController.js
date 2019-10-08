const { isBefore, subHours } = require('date-fns')

/** @type {typeof import ('@adonisjs/lucid/src/Lucid/Model')} */
const Token = use('App/Models/Token')

class ResetPasswordController {
  async store({ request, response }) {
    const { token, password } = request.only(['token', 'password'])

    const userToken = await Token.findByOrFail('token', token)

    const now = new Date()
    const twoHoursAgo = subHours(now, 2)

    if (isBefore(new Date(userToken.created_at), twoHoursAgo)) {
      return response.status(400).json({
        error: 'Expired Token. Please try requesting the reset again.',
      })
    }

    const user = await userToken.user().fetch()

    user.password = password

    await user.save()
  }
}

module.exports = ResetPasswordController
