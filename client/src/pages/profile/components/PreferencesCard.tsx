import { Badge } from '@/components/ui/badge'
import { useProfilePreferences } from '@/hooks/useProfilePreferences'

export default function PreferencesCard() {
  const { data: prefs } = useProfilePreferences()

  return (
    <div className="pp-card">
      <h2 className="pp-card__title">Preferences</h2>
      <div className="pp-prefs__fields">
        <div className="pp-prefs__field">
          <span className="pp-prefs__field-label">Notifications</span>
          <Badge variant={prefs?.notification_enabled ? 'default' : 'secondary'}>
            {prefs?.notification_enabled ? 'On' : 'Off'}
          </Badge>
        </div>
        <div className="pp-prefs__field">
          <span className="pp-prefs__field-label">Language</span>
          <span className="pp-prefs__field-value">{prefs?.language ?? 'English'}</span>
        </div>
      </div>
    </div>
  )
}
