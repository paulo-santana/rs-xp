const { trait, test } = use('Test/Suite')('Workshop')

/** @type {import ('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

trait('Test/ApiClient')
trait('Auth/Client')

test('create workshops', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .post('/workshops')
    .loginVia(user, 'jwt')
    .send({
      user_id: user.id,
      title: 'Utilizando Node.js para construir APIs seguras e performáticas',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus, cum! Consectetur veritatis aut in quia a. Doloribus enim doloremque voluptates maiores voluptate fugit eos architecto sunt, consectetur obcaecati accusantium rerum?',
      section: 1,
    })
    .end()

  response.assertStatus(201)
  assert.exists(response.body.id)
})

test('should list workshops', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create()
  const workshop = await Factory.model('App/Models/Workshop').make()

  await user.workshops().save(workshop)

  const response = await client
    .get('/workshops')
    .loginVia(user, 'jwt')
    .end()

  const expectedResponse = [
    {
      ...workshop.toJSON(),
      user: {
        ...user.toJSON(),
      },
    },
  ]

  response.assertStatus(200)
})
