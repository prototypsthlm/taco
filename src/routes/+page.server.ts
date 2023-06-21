export const load = ({ cookies }) => {
  const sessionId = cookies.get('session_id')
  console.log(sessionId)
  if (sessionId) return { isLoggedIn: true }
  else return { isLoggedIn: false }
}
