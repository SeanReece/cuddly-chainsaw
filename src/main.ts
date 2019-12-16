import * as github from '@actions/github'
import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')

    const octokit = new github.GitHub(token)

    // console.log(github.context.repo)

    const {data: pullRequest} = await octokit.pulls.list({...github.context.repo})

    console.log(pullRequest)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
