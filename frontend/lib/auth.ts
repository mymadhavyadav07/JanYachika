
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { apiBaseUrl } from '@/data/data';


interface WithAuthOptions {
  redirectTo?: string;
}

export async function withAuth<T>(
  context: GetServerSidePropsContext,
  getProps?: (context: GetServerSidePropsContext, user: any) => Promise<GetServerSidePropsResult<T>>,
  options: WithAuthOptions = {}
): Promise<GetServerSidePropsResult<T>> {
  const { req } = context;

  const res = await fetch(`${apiBaseUrl}/user`, {
    headers: {
      cookie: req.headers.cookie || '',
    },
    credentials: 'include',
  });

  if (res.status !== 200) {
    return {
      redirect: {
        destination: options.redirectTo || '/login',
        permanent: false,
      },
    };
  }

  const user = await res.json();

  if (getProps) {
    return await getProps(context, user);
  }

  return {
    props: { user } as unknown as T,
  };
}
