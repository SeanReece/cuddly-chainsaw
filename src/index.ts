import * as github from '@actions/github'
import * as core from '@actions/core'
import axios from 'axios'
import { format } from 'timeago.js';

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')
    const slackWebhook: string = core.getInput('slack-webhook')

    const octokit = new github.GitHub(token)

    const response = await octokit.graphql(`query prs($owner: String!, $repo: String!) {
      repository(owner:$owner, name:$repo) {
        nameWithOwner,
        pullRequests(first: 100, states: OPEN) {
          nodes {
            id
            title
            url
            createdAt
            isDraft
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
    }`, {
        ...github.context.repo, 
        headers: {
          accept: `application/vnd.github.shadow-cat-preview+json`
        }
      }
    )

    let pullRequests = response && response.repository.pullRequests.nodes
    const repoName = response && response.repository.nameWithOwner
    console.log(pullRequests)

    pullRequests = pullRequests.filter((pr: any ) => !pr.isDraft && pr.title.toLowerCase().startsWith('[wip]'))

    let text = `The following pull requests are waiting for review on ${repoName}`

    pullRequests.forEach((pr: any) => text = text.concat(`\n✅ <${pr.url}|${pr.title}> | ${format(pr.createdAt, 'en_US')}`))

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
