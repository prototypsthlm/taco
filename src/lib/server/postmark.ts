import { POSTMARK_API_KEY } from '$env/static/private'
import { ServerClient } from 'postmark'

const postmark = new ServerClient(POSTMARK_API_KEY)

export default postmark
