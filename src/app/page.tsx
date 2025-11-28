import NavigationProvider from '../providers/navigation.provider';
import Navigation from '../components/Navigation';
import About from '@/components/About';
import Skill from '@/components/Skill';
import Project from '../components/Project';
import Blog from '@/components/Blog';
import Contact from '@/components/Contact';
import { getWakaTimeData, getWakaTimeWeek } from '@/api';
import { GET_GH_STATS } from '@/graphql/github.gql';
import { GET_LEET_SOLVED_PROBLEMS } from '@/graphql/leetcode.gql';
import { getGithubClient, getLeetCodeClient } from '@/libs/apollo-client';
import { ISolvedProblems } from '@/interfaces/leetcode-response';
import { IGitHubStats } from '@/interfaces/github-response';

const sections = [
  {
    title: 'Home',
    slug: 'home',
  },
  {
    title: 'Skill',
    slug: 'skill',
  },
  {
    title: 'Project',
    slug: 'project',
  },
  {
    title: 'Blog',
    slug: 'blog',
  },
  {
    title: 'Contact',
    slug: 'contact',
  },
];

export default async function Home() {
  // Fetch WakaTime data (error handling is in the API functions)
  const wakaTime = await getWakaTimeData();
  const wakaTimeWeek = await getWakaTimeWeek();

  // Fetch GitHub stats with error handling
  let githubStats;
  try {
    githubStats = await getGithubClient.getClient().query<IGitHubStats>({
      query: GET_GH_STATS,
      variables: { login: process.env.GITHUB_USERNAME },
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    // Provide fallback data for GitHub stats
    githubStats = {
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: 0,
          },
          repositoriesContributedTo: {
            totalCount: 0,
          },
          pullRequests: {
            totalCount: 0,
          },
          openIssues: {
            totalCount: 0,
          },
          closedIssues: {
            totalCount: 0,
          },
          repositories: {
            totalCount: 0,
            nodes: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    };
  }

  const currentYear = new Date().getFullYear();

  // Fetch LeetCode stats with error handling
  let leetCodeStats;
  try {
    leetCodeStats = await getLeetCodeClient
      .getClient()
      .query<ISolvedProblems>({
        query: GET_LEET_SOLVED_PROBLEMS,
        variables: {
          username: process.env.LEETCODE_USERNAME,
          year: currentYear,
        },
      });
  } catch (error) {
    console.error('LeetCode API error:', error);
    // Provide fallback data for LeetCode stats
    leetCodeStats = {
      data: {
        matchedUser: {
          username: process.env.LEETCODE_USERNAME || 'user',
          submitStatsGlobal: {
            acSubmissionNum: [
              { difficulty: 'Easy', count: 0 },
              { difficulty: 'Medium', count: 0 },
              { difficulty: 'Hard', count: 0 },
            ],
          },
          problemsSolvedBeatsStats: [
            { difficulty: 'Easy', percentage: 0 },
            { difficulty: 'Medium', percentage: 0 },
            { difficulty: 'Hard', percentage: 0 },
          ],
        },
        allQuestionsCount: [
          { difficulty: 'Easy', count: 0 },
          { difficulty: 'Medium', count: 0 },
          { difficulty: 'Hard', count: 0 },
        ],
      },
    };
  }

  return (
    <>
      <NavigationProvider>
        <div className='relative'>
          <div className='absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(41,77,123,0.3),rgba(255,255,255,0))]'></div>
        </div>
        <div className='absolute bottom-0 left-0 right-0 top-0 z-[-2] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:75px_75px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>

        <Navigation links={sections} />

        <main className='relative'>
          <About section={{ title: 'Home', slug: 'home' }} />
          <Skill
            section={{ title: 'Skill', slug: 'skill' }}
            github={githubStats}
            wakaTime={wakaTime}
            wakaTimeWeek={wakaTimeWeek}
            leetCode={leetCodeStats}
          />
          <Project section={{ title: 'Project', slug: 'project' }} />
          <Blog section={{ title: 'Blog', slug: 'blog' }} />
          <Contact section={{ title: 'Contact', slug: 'contact' }} />
        </main>
      </NavigationProvider>
      <footer className='my-2 bg-neutral-950 text-center text-xs'>
        © Refi Fauzan. All rights reserved.
      </footer>
    </>
  );
}
