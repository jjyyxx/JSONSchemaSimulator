const Octokit = require('@octokit/rest')
const octokit = new Octokit()

octokit.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH
})

const { version } = require('../package.json')
octokit.repos.createRelease({
  repo: 'JSONSchemaSimulator',
  owner: 'jjyyxx',
  tag_name: version,
  name: version
}).then(() => {
  console.log('Release created successfully')
})
