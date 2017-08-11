const mocha = require('mocha')
const {
  ipcRenderer
} = require('electron')
const {
  each
} = require('lodash')
const {
  extname
} = require('path')
const Coverage = require('../lib/Coverage')
const notify = require('../lib/notify')
const runMocha = require('../lib/runMocha')

let opts = {}

if (window.location.hash) {
  const hash = window.location.hash.slice(1)
  opts = JSON.parse(decodeURIComponent(hash))
}

if (!opts.interactive) {
  require('./console')
}

let coverage
if (opts.coverage) {
  coverage = new Coverage(opts.root, opts.sourcePattern)
}

// Expose mocha
window.mocha = mocha

function reportError ({
  message,
  stack
}) {
  if (opts.interactive) {
    console.error(message)
    console.error(stack)
  } else {
    ipcRenderer.send('mocha-error', {
      message,
      stack
    })
  }
}

// TODO compile
if (opts.compile) {
  require('../lib/requireHook')(opts.compileOpts)
}

try {
  each(opts.preload, file => {
    const ext = extname(file)
    if (ext === '.js') {
      const tag = document.createElement('script')
      tag.src = file
      tag.async = false
      document.head.appendChild(tag)
    } else if (ext === '.css') {
      const tag = document.createElement('link')
      tag.rel = 'stylesheet'
      tag.href = file
      document.head.appendChild(tag)
    }
  })
} catch (error) {
  reportError(error)
}

ipcRenderer.on('mocha-start', () => {
  try {
    runMocha(opts, count => {
      if (count && opts.notifyOnFail) {
        notify(count)
      }
      if (coverage) {
        coverage.report()
      }
      ipcRenderer.send('mocha-done', count)
    })
  } catch (error) {
    reportError(error)
  }
})

// Request re-run on reload in --interactive mode
ipcRenderer.send('mocha-ready-to-run')
