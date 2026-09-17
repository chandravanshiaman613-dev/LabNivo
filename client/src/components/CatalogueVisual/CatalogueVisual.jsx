import './CatalogueVisual.css'

const resolveVisual = (label = '', type = 'test') => {
  const value = label.toLowerCase()
  if (/diabet|sugar|hba1c|glucose/.test(value)) return 'drop'
  if (/thyroid|hormone/.test(value)) return 'thyroid'
  if (/heart|cardiac|cholesterol|lipid|bp/.test(value)) return 'heart'
  if (/liver|hepatic/.test(value)) return 'liver'
  if (/kidney|renal|urine/.test(value)) return 'kidney'
  if (/vitamin|nutrition|wellness/.test(value)) return 'sun'
  if (/women|pregnan|pcos/.test(value)) return 'women'
  if (/fever|infection|dengue|covid|widal/.test(value)) return 'shield'
  return type === 'package' ? 'care' : 'tube'
}

export default function CatalogueVisual({ label, type = 'test', imageUrl }) {
  const visual = resolveVisual(label, type)
  const icons = {
    drop: <path d="M12 3.5C9 7.4 6.5 10.2 6.5 13a5.5 5.5 0 0011 0c0-2.8-2.5-5.6-5.5-9.5zM9.7 13.4c.2 1.3 1.1 2.2 2.4 2.5" />,
    thyroid: <><path d="M8 5.5c1.3 1.1 2.6 1.1 4 0 1.4 1.1 2.7 1.1 4 0" /><path d="M8.5 7.3v4.3a3.5 3.5 0 007 0V7.3" /><path d="M10.3 17.5h3.4" /></>,
    heart: <path d="M12 19s-7-4.3-7-9.2C5 7.6 6.4 6 8.4 6c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2 2 0 3.4 1.6 3.4 3.8C19 14.7 12 19 12 19z" />,
    liver: <path d="M4.5 11.7c2.7-4.8 7.8-6.5 13.7-4.3.9.3 1.3 1.2 1 2.1-1 3.5-3.7 6.4-8.2 6.7-3.6.2-5.7-1.6-6.5-4.5zM10 9.8c1.6.5 3 .5 4.5-.1" />,
    kidney: <><path d="M9.2 5.2c-3.1 0-4.7 2.7-4.2 5.8.5 3.1 2.4 5.2 4.7 4.8 2.2-.4 2.5-2.6 2.3-4.7-.2-2.8-.2-5.9-2.8-5.9z" /><path d="M14.8 5.2c3.1 0 4.7 2.7 4.2 5.8-.5 3.1-2.4 5.2-4.7 4.8-2.2-.4-2.5-2.6-2.3-4.7.2-2.8.2-5.9 2.8-5.9z" /><path d="M12 13.2v5.3" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18.4 5.6L17 7M7 17l-1.4 1.4M18.4 18.4L17 17M7 7L5.6 5.6" /></>,
    women: <><circle cx="12" cy="8" r="3" /><path d="M7.5 19c.7-3.5 2.2-5.2 4.5-5.2s3.8 1.7 4.5 5.2M12 19v2M9.8 21h4.4" /></>,
    shield: <><path d="M12 3.5l6 2.2v4.6c0 4-2.4 6.7-6 8.2-3.6-1.5-6-4.2-6-8.2V5.7l6-2.2z" /><path d="M9.3 11.2l1.8 1.8 3.8-3.8" /></>,
    care: <><path d="M12 19s-6.5-4-6.5-8.5C5.5 8.6 6.7 7 8.6 7c1.5 0 2.7.8 3.4 2 .7-1.2 1.9-2 3.4-2 1.9 0 3.1 1.6 3.1 3.5C18.5 15 12 19 12 19z" /><path d="M12 5v4M10 7h4" /></>,
    tube: <><path d="M9 3.5h6M10 3.5v7.2l-2.7 5a3 3 0 002.7 4.3h4a3 3 0 002.7-4.3l-2.7-5V3.5" /><path d="M9.2 14h5.6" /></>
  }
  return <div className={`catalogue-visual ${type} visual-${visual}`} aria-hidden="true">{imageUrl ? <img src={imageUrl} alt="" onError={event => { event.currentTarget.style.display = 'none' }} /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[visual]}</svg>}</div>
}
