import * as github from '@actions/github'
import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')
    const slackWebhook: string = core.getInput('slack-webhook')

    const octokit = new github.GitHub(token)
    console.log(github.context.repo)
    const {data: pullRequests} = await octokit.pulls.list({...github.context.repo})

    const reso = await octokit.graphql(`query prs($owner: String!, $repo: String!) {
      repository(owner:$owner, name:$repo) {
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

    console.log(reso)

    let text = 'The following pull requests are waiting for review'

    pullRequests.forEach((pr) => text = text.concat(`\n💩 <${pr.html_url}|${pr.title}>`))

    const message = {
      text,
      username: 'Cuddly Chainsaw PR Notifications',
      icon_emoji: ':ghost:'
    }

    const response = await axios.post(slackWebhook, message)
    // console.log(response)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
