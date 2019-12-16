import * as github from '@actions/github'
import * as core from '@actions/core'
import wretch from 'wretch'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')
    const slackWebhook: string = core.getInput('slack_webhook')

    const octokit = new github.GitHub(token)

    const {data: pullRequests} = await octokit.pulls.list({...github.context.repo})

    console.log(pullRequests)

    const message = {
      text: `Hello,\nYou have ${pullRequests.length} PRs!`,
      username: 'Cuddly Chainsaw PR Notifications',
      icon_emoji: ':ghost:'
    }

    const slackHook = wretch(slackWebhook)
    const response = await slackHook.post(message).json()
    console.log(response)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
