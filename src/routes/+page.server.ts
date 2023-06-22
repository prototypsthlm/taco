export const load = ({ locals }) => {
  if (locals.currentUser) return { isLoggedIn: true }
  else return { isLoggedIn: false }
}
