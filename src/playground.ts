import { z } from './z'

const v = z.nullable(z.null()).unwrap().notes('foo').deprecated().hint

console.log(v)
