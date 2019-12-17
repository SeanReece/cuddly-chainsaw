import * as github from '@actions/github'
import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')
    const slackWebhook: string = core.getInput('slack-webhook')

    const octokit = new github.GitHub(token)

    const response = await octokit.graphql(`query prs($owner: String!, $repo: String!) {
      repository(owner:$owner, name:$repo) {
        nameWithOwner,
        pullRequests(first: 100, states: OPEN, labels: "ready") {
          nodes {
            id
            title
            url
            updatedAt
            reviews(first: 10, states: [CHANGES_REQUESTED, APPROVED]) {
              totalCount
              nodes {
                state
              }
            }
            comments {
              totalCount
            }
            commits(first: 10) {
              nodes {
                commit {
                  status {
                    id
                    state
                  }
                }
              }
            }
          }
          totalCount
        }
      }
    }`, {...github.context.repo}
  )

    const pullRequests = response && response.repository.pullRequests.nodes
    const repoName = response && response.repository.nameWithOwner
    console.log(pullRequests)

    let text = `The following pull requests are waiting for review on ${repoName}`

    pullRequests.forEach((pr: any) => text = text.concat(`\n✅ <${pr.url}|${pr.title}>`))

    const message = {
      text,
      username: 'Cuddly Chainsaw PR Notifications',
      icon_emoji: ':ghost:'
    }

    return await axios.post(slackWebhook, message)
    // console.log(response)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
