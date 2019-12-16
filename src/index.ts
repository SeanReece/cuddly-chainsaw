import * as github from '@actions/github'
import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')
    const slackWebhook: string = core.getInput('slack-webhook')

    const octokit = new github.GitHub(token)

    const {data: pullRequests} = await octokit.pulls.list({...github.context.repo})

    console.log(pullRequests)

    const message = {
      text: `Hello,\nYou have ${pullRequests.length} PRs!`,
      username: 'Cuddly Chainsaw PR Notifications',
      icon_emoji: ':ghost:'
    }

    const response = await axios.post(slackWebhook, message)
    console.log(response)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
