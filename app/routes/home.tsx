import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Google API Drawing Example' },
    { name: 'description', content: 'POC POC! - who is?' },
  ]
}

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center text-2xl">
      In progress
    </div>
  )
}
