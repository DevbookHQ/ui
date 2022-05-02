import { withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs'
import Title from 'components/typography/Title'

export const getServerSideProps = withAuthRequired({ redirectTo: '/signin' })
function Home() {
  return (
    <div className="flex flex-col">
      <Title>Code Snippets</Title>

    </div>
  )
}

export default Home
