#!/usr/bin/env node

const { execSync } = require('child_process')
const { TRAVIS_BRANCH, TRAVIS_PULL_REQUEST, TRAVIS_PULL_REQUEST_BRANCH, TRAVIS_PULL_REQUEST_SHA } = process.env

if (TRAVIS_PULL_REQUEST && TRAVIS_BRANCH === 'master') {
  if (TRAVIS_PULL_REQUEST_BRANCH === 'develop') {
    const previous = JSON.parse(execSync('git show master:package.json').toString('utf8')).version
    const current = JSON.parse(execSync(`git show ${TRAVIS_PULL_REQUEST_SHA}:package.json`).toString('utf8')).version
    if (previous === current) {
      console.log('The version number did not increase')
      process.exit(1)
    }
  } else {
    console.log('Only develop can be merged into master')
    process.exit(1)
  }
}