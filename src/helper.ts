import mkdirp from 'mkdirp';
import {spinner} from './index';
import {existsSync, writeFileSync} from 'fs';
import fetch, {Headers, Response} from 'node-fetch';
import {parse as parsePath, ParsedPath, resolve as resolvePath} from 'path';

export const githubApiBaseUrl: string = 'https://api.github.com';
export const githubContentsEndpoint: string = `${githubApiBaseUrl}/repos/%s/%s/contents`;

interface GitHubRequestHeaders extends Headers {
  Authorization?: string;
}

export async function getBlobs(url: string, token?: string): Promise<Blob> {
  const headers: Partial<GitHubRequestHeaders> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res: Response = await fetch(url, {
    headers: <GitHubRequestHeaders>headers,
  });

  if (!res.ok) {
    spinner.stop();
    console.error('Something went wrong!');
    process.exit(1);
  }

  return res.json();
}

export async function getContents(url: string, token?: string): Promise<GithubContent[]> {
  const headers: Partial<GitHubRequestHeaders> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res: Response = await fetch(url, {
    headers: <GitHubRequestHeaders>headers,
  });

  if (!res.ok) {
    const error = await res.json();
    spinner.stop();
    if (error.message === 'Bad credentials') {
      console.error('Provided token is invalid');
    } else {
      console.error('Something went wrong!');
    }
    process.exit(1);
  }

  return res.json();
}

export async function download(baseUrl: string, path: string, branch: string, token?: string): Promise<void> {
  const url: string = `${baseUrl}/${path}?ref=${branch}`;
  const contents: GithubContent[] = await getContents(url, token);
  for (const content of contents) {
    if (content.type === 'dir') {
      await download(baseUrl, content.path, branch, token);
    } else {
      spinner.text = `Downloading ${content.path}`;
      const blob: GithubBlob = await getBlobs(content.git_url, token);

      const parsedPath: ParsedPath = parsePath(content.path);
      const directoryPath: string = resolvePath(`${process.cwd()}/${parsedPath.dir}`);
      const filePath: string = resolvePath(`${process.cwd()}/${content.path}`);
      if (!existsSync(directoryPath)) {
        mkdirp.sync(directoryPath);
      }

      const buffer: Buffer = Buffer.from(<string>blob.content, 'base64');
      writeFileSync(filePath, buffer);
    }
  }
}
