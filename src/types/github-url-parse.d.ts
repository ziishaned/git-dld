declare module 'github-url-parse' {
  type ParsedGithubUrl = {
    user: string;
    repo: string;
    type: string;
    path: string;
    branch: string;
  };

  export default function parseGithubUrl(url: string): ParsedGithubUrl;
}
