'use strict'

const { subHours, format } = require('date-fns')

const Mail = use('Mail')
const Hash = use('Hash')

const Database = use('Database')

/** @type {typeof import ('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')

/** @type {typeof import ('@adonisjs/vow/src/Suite')} */
const { test, trait } = use('Test/Suite')('Forgot Password')

/** @type {typeof import ('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('it should send an email with reset password instructions', async ({
  assert,
  client
}) => {
  Mail.fake()

  const email = 'paulo.santana.r@gmail.com'
  const user = await Factory.model('App/Models/User').create({ email })

  await client
    .post('/forgot')
    .send({ email })
    .end()

  const token = await user.tokens().first()

  assert.include(token.toJSON(), {
    type: 'forgotPassword'
  })

  const recentEmail = Mail.pullRecent()

  assert.equal(recentEmail.message.to[0].address, email)

  Mail.restore()
})

test('it should be able to reset password', async ({ assert, client }) => {
  Mail.fake()

  const email = 'paulo.santana.r@gmail.com'

  const user = await Factory.model('App/Models/User').create({ email })
  const userToken = await Factory.model('App/Models/Token').make()

  await user.tokens().save(userToken)

  await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '123456',
      password_confirmation: '123456'
    })
    .end()

  await user.reload()
  const checkPassword = await Hash.verify('123456', user.password)
  assert.isTrue(checkPassword)

  Mail.restore()
})

test('it cannot reset password after 2h of forgot password request', async ({
  assert,
  client
}) => {
  const email = 'paulo.santana.r@gmail.com'

  const user = await Factory.model('App/Models/User').create({ email })
  const userToken = await Factory.model('App/Models/Token').make()

  await user.tokens().save(userToken)

  const dateWithSub = format(subHours(new Date(), 5), 'yyyy-MM-dd HH:ii:ss')
  await Database.table('tokens')
    .where('token', userToken.token)
    .update('created_at', dateWithSub)

  const response = await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '123456',
      password_confirmation: '123456'
    })
    .end()

  response.assertStatus(400)
})
