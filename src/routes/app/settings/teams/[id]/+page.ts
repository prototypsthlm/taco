import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, parent }) => {
  const { user } = await parent()
  return {
    userTeam: user?.userTeams.find((x) => x.teamId?.toString() === params.id),
  }
}
