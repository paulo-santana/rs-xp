'use strict'

const { randomBytes } = require('crypto')
const { promisify } = require('util')

const Mail = use('Mail')
const Env = use('Env')

/** @type {typeof import ('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')

class ForgotPasswordController {
  async store({ request }) {
    const email = request.input('email')

    const user = await User.findByOrFail('email', email)

    const random = await promisify(randomBytes)(24)
    const token = random.toString('hex')

    await user.tokens().create({
      token,
      type: 'forgotPassword'
    })

    const resetPasswordUrl = `${Env.get('FRONT_URL')}/reset?token=${token}`

    await Mail.send(
      'emails.forgotpassword',
      { name: user.name, resetPasswordUrl },
      message => {
        message
          .to(user.email)
          .from('paulo.santana.r@gmail.com')
          .subject('RS/XP - Recuperação de senha')
      }
    )
  }
}

module.exports = ForgotPasswordController
