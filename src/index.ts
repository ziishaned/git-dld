#!/usr/bin/env node

/// <reference path="./types/index.d.ts" />
/// <reference path="./types/is-github-url.d.ts" />
/// <reference path="./types/github-url-parse.d.ts" />

import ora from 'ora';
import yargs from 'yargs';
import {format} from 'util';
import isGithubUrl from 'is-github-url';
import {download, githubContentsEndpoint} from './helper';
import parseGithubUrl, {ParsedGithubUrl} from 'github-url-parse';

export const spinner: ora.Ora = ora('Fetching information');

yargs
  .scriptName('git dld')
  .command({
    command: '* [url]',
    describe: 'Download the directory or file from GitHub',
    builder: {
      token: {
        alias: 't',
        type: 'string',
        describe: 'GitHub access token if you want download from private repository',
      },
    },
    handler: async (args: DownloadCommandArgs): Promise<void> => {
      const isValid = isGithubUrl(args?.url);
      if (!isValid) {
        console.error('Provided URL is not a valid GitHub URL');
        process.exit(1);
      }

      const {user, repo, path, branch} = <ParsedGithubUrl>parseGithubUrl(args.url);
      const url: string = format(githubContentsEndpoint, user, repo);

      console.log(`Downloading into '${path}'`);

      spinner.start();
      await download(url, path, branch, args.token);
      spinner.stop();

      console.log(`✓ Done`);

      process.exit(0);
    },
  })
  .help()
  .showHelpOnFail(false).argv;
