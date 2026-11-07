import { Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { ScreenHeader } from '../components/layout/ScreenHeader'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Page not found"
        subtitle="The link may be broken or the page may have moved"
        showBack
        backTo="/"
      />

      <div className="px-4 pt-6">
        <EmptyState
          icon={Compass}
          title="Nothing here"
          description="The page you are looking for does not exist or may have moved."
          action={
            <Button onClick={() => navigate('/')}>Back to home</Button>
          }
        />
      </div>
    </div>
  )
}
