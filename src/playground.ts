import { unionizeHints } from './hint'
import { AnyZ, z, Z } from './z'

const a = z.void().optional().underlying

type C = z.infer<typeof a>
