type GithubBlob = {
  sha?: string;
  node_id?: string;
  size?: number;
  url?: string;
  content?: string;
  encoding?: string;
};
type GithubContent = {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'dir' | 'file';
  _links: GithubContentLinks;
};
type GithubContentLinks = {
  self: string;
  git: string;
  html: string;
};
type DownloadCommandArgs = {
  url: string;
  t: string;
  token: string;
};
