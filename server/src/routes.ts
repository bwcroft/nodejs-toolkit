import { Router } from '@bwcroft/octane'
import pkg from '../package.json' with { type: 'json' }

const router = new Router()

router.get('/', (_, res) => {
  res.sendJson(200, {
    name: pkg.name,
    type: pkg.type,
    private: pkg.private,
  })
})

router.get('/speed', (_, res) => {
  res.sendJson(200, { hello: 'world' })
})

export default router
