import { redirect } from 'next/navigation'
export const runtime = 'nodejs'
export default function PostLostFound() { redirect('/submit?submission_type=lost_pet') }
