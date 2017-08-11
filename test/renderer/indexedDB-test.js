/* eslint-env mocha */
import {
  ok
} from 'assert'

describe('accessing indexedDB', () => {
  it('does not fail when deleting the temp directory on exit', () => {
    const db = window.indexedDB.open('TestDatabase', 3)
    ok(db !== null)
  })
})
