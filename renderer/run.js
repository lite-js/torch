const mocha = require('mocha')
const {
  each
} = require('lodash')
const {
  ipcRenderer
} = require('electron')
const runMocha = require('../lib/runMocha')

let opts = {}

if (window.location.hash) {
  const hash = window.location.hash.slice(1)
  opts = JSON.parse(decodeURIComponent(hash))
}

if (!opts.interactive) {
  require('./console')
}

// Expose mocha
window.mocha = mocha

try {
  each(opts.preload, script => {
    const tag = document.createElement('script')
    tag.src = script
    tag.async = false
    document.head.appendChild(tag)
  })
} catch (error) {
  ipcRenderer.send('mocha-error', error)
}

ipcRenderer.on('mocha-start', () => {
  try {
    runMocha(opts, (...args) => {
      ipcRenderer.send('mocha-done', ...args)
    })
  } catch (error) {
    ipcRenderer.send('mocha-error', error)
  }
})

// Request re-run on reload in --interactive mode
ipcRenderer.send('mocha-ready-to-run')