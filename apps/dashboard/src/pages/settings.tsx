import { withPageAuth } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser } from '@supabase/supabase-auth-helpers/react'
import { ClipboardCheck, ClipboardCopy, Settings as SettingsIcon } from 'lucide-react'
import { useRouter } from 'next/router'

import Button from 'components/Button'
import Spinner from 'components/icons/Spinner'
import Text from 'components/typography/Text'
import useAPIKey from 'hooks/useAPIKey'
import useExpiringState from 'hooks/useExpiringState'
import { initPostHog } from 'utils/posthog/usePostHog'

export const getServerSideProps = withPageAuth({
  redirectTo: '/signin',
})

function Settings() {
  const { user, isLoading: isUserLoading } = useUser()
  const { key, isLoading: isAPIKeyLoading } = useAPIKey(user?.id)
  const router = useRouter()

  const [copied, setWasCopied] = useExpiringState({ defaultValue: false, timeout: 2000 })

  async function handleCopyAPIKey() {
    if (key) {
      await navigator.clipboard.writeText(key)
      setWasCopied(true)
    }
  }

  function handleSignOut() {
    const posthog = initPostHog()
    posthog.reset()

    router.push('/api/auth/logout')
  }

  return (
    <div
      className="
      flex
      flex-1
      flex-col
      space-y-4
      space-x-0
      overflow-hidden
      p-8
      md:flex-row
      md:space-y-0
      md:space-x-8
      md:p-12
    "
    >
      <div className="flex items-start justify-start">
        <div className="items-center flex space-x-2">
          <SettingsIcon size="30px" />
          <Text
            size={Text.size.S1}
            text="Settings"
          />
        </div>
      </div>

      <div
        className="
        flex
        flex-1
        flex-col
        items-start
        space-y-4
        "
      >
        <div
          className="
        flex
        flex-col
        space-y-1
      "
        >
          <Text
            className="text-slate-400"
            size={Text.size.S3}
            text="Email"
          />
          {isUserLoading
            ? <Spinner />
            : <Text
              size={Text.size.S2}
              text={user?.email!}
            />
          }
        </div>
        <div
          className="
        flex
        flex-col
        space-y-1
      "
        >
          <Text
            className="text-slate-400"
            size={Text.size.S3}
            text="API Key"
          />
          {isAPIKeyLoading
            ? <Spinner />
            : <Button
              className="select-text transition-all"
              icon={copied ? <ClipboardCheck size="14px" /> : <ClipboardCopy size="14px" />}
              text={key}
              onClick={handleCopyAPIKey}
            />
          }
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSignOut}
            text="Sign out"
          />
        </div>
      </div>
    </div >
  )
}

export default Settings
